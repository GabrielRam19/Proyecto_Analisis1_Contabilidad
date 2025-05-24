using Microsoft.AspNetCore.Mvc;
using ContabilidadAPIV2.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MySqlConnector;


namespace ContabilidadAPIV2.Controllers
{


    [Route("api/[controller]")]
    [ApiController]
    public class LibrosContablesController : ControllerBase
    {
        private readonly ContabilidadContext _context;

        public LibrosContablesController(ContabilidadContext context)
        {
            _context = context;
        }

        [HttpPost("LibroDiario")]
        public async Task<ActionResult<IEnumerable<LibroDiarioDto>>> GetLibroDiario(RequestConsultaLibros requestConsulta)
        {
            // Obtener el período
            var periodo = await _context.PERIODO
                .Where(p => p.id_periodo == requestConsulta.id_periodo)
                .FirstOrDefaultAsync();

            if (periodo == null)
                return NotFound("Periodo no encontrado");

            var asientos = await _context.ASIENTOS
                .Include(a => a.Detalles)
                    .ThenInclude(d => d.Cuenta)
                .Where(a => a.FECHA.Date >= periodo.fecha_inicio.ToDateTime(TimeOnly.MinValue)
         && a.FECHA.Date <= periodo.fecha_fin.ToDateTime(TimeOnly.MinValue))
                .OrderBy(a => a.FECHA)
                .ToListAsync();

            var resultado = asientos.Select(a => new LibroDiarioDto
            {
                AsientoId = a.ASIENTO_ID,
                Fecha = a.FECHA,
                Descripcion = a.DESCRIPCION,
                Detalles = a.Detalles.Select(d => new DetalleLibroDiarioDto
                {
                    CodigoCuenta = d.Cuenta?.CODIGO ?? "N/A",
                    NombreCuenta = d.Cuenta?.NOMBRE ?? "N/A",
                    Debe = d.DEBE,
                    Haber = d.HABER
                }).ToList()
            }).ToList();

            return Ok(resultado);
        }

        [HttpPost("LibroMayor")]
        public async Task<ActionResult<IEnumerable<LibroMayorAgrupado>>> GetLibroMayor(RequestConsultaLibros requestConsulta)
        {
            var periodo = await _context.PERIODO
                .FirstOrDefaultAsync(p => p.id_periodo == requestConsulta.id_periodo);

            if (periodo == null)
                return NotFound("Periodo no encontrado");

            var query = @"
SELECT 
    d.detalle_id,
    c.cuenta_id,
    c.codigo,
    c.nombre,
    a.asiento_id,
    a.descripcion,
    a.fecha,
    d.debe,
    d.haber
FROM 
    DETALLE_ASIENTO d
JOIN 
    ASIENTOS a ON d.asiento_id = a.asiento_id
JOIN 
    CUENTAS c ON d.cuenta_id = c.cuenta_id
WHERE
    a.fecha BETWEEN @FechaInicio AND @FechaFin
ORDER BY
    c.cuenta_id, a.fecha, a.asiento_id, d.detalle_id";

            var saldosIniciales = await _context.SALDOCUENTAPERIODO
                .Where(s => s.id_periodo == requestConsulta.id_periodo)
                .ToDictionaryAsync(s => s.cuenta_id, s => s.saldo_inicial);

            // CAMBIO: Usamos MySqlParameter en lugar de SqlParameter
            var movimientosRaw = await _context.Set<LibroMayorMovimientoRawDto>()
                .FromSqlRaw(query,
                    new MySqlParameter("@FechaInicio", periodo.fecha_inicio.ToDateTime(TimeOnly.MinValue)),
                    new MySqlParameter("@FechaFin", periodo.fecha_fin.ToDateTime(TimeOnly.MinValue)))
                .ToListAsync();

            var jerarquias = await _context.JERARQUIA
                .ToDictionaryAsync(j => j.codigo_cuenta_hijo, j => new { j.codigo_cuenta_padre, j.nivel });

            var agrupado = movimientosRaw
                .GroupBy(m => new { m.Cuenta_Id, m.Codigo, m.Nombre })
                .Select(g =>
                {
                    decimal saldoInicial = saldosIniciales.TryGetValue(g.Key.Cuenta_Id, out var s) ? s : 0;
                    decimal saldoAcumulado = saldoInicial;

                    var movimientosConSaldo = g.Select(m =>
                    {
                        saldoAcumulado += m.Debe - m.Haber;
                        return new LibroMayorMovimientoDto
                        {
                            Detalle_Id = m.Detalle_Id,
                            Cuenta_Id = m.Cuenta_Id,
                            Codigo = m.Codigo,
                            Nombre = m.Nombre,
                            Asiento_Id = m.Asiento_Id,
                            Descripcion = m.Descripcion,
                            Fecha = m.Fecha,
                            Debe = m.Debe,
                            Haber = m.Haber,
                            Saldo = saldoAcumulado
                        };
                    }).ToList();

                    jerarquias.TryGetValue(g.Key.Codigo, out var jerarquiaInfo);

                    return new LibroMayorAgrupado
                    {
                        CuentaId = g.Key.Cuenta_Id,
                        Codigo = g.Key.Codigo,
                        Nombre = g.Key.Nombre,
                        SaldoInicial = saldoInicial,
                        Movimientos = movimientosConSaldo,
                        CodigoCuentaPadre = jerarquiaInfo?.codigo_cuenta_padre,
                        NivelJerarquia = jerarquiaInfo?.nivel
                    };
                })
                .ToList();

            return agrupado;
        }

        [HttpPost("BalanceSaldos")]
        public async Task<ActionResult<IEnumerable<BalanceSaldosDto>>> GetBalanceSaldos(RequestConsultaLibros requestConsulta)
        {
            var periodo = await _context.PERIODO
                .FirstOrDefaultAsync(p => p.id_periodo == requestConsulta.id_periodo);

            if (periodo == null)
                return NotFound("Periodo no encontrado");

            // Obtener saldos iniciales del periodo
            var saldosIniciales = await _context.SALDOCUENTAPERIODO
                .Where(s => s.id_periodo == requestConsulta.id_periodo)
                .ToDictionaryAsync(s => s.cuenta_id, s => s.saldo_inicial);

            // Consulta de movimientos del periodo con sintaxis MySQL
            var query = @"
SELECT 
    c.cuenta_id,
    c.codigo,
    c.nombre,

    IFNULL(SUM(CASE WHEN a.fecha BETWEEN @FechaInicio AND @FechaFin THEN d.debe ELSE 0 END), 0) AS total_debe,
    IFNULL(SUM(CASE WHEN a.fecha BETWEEN @FechaInicio AND @FechaFin THEN d.haber ELSE 0 END), 0) AS total_haber

FROM Detalle_Asiento d
JOIN Cuentas c ON d.cuenta_id = c.cuenta_id
JOIN Asientos a ON d.asiento_id = a.asiento_id
WHERE a.fecha BETWEEN @FechaInicio AND @FechaFin
GROUP BY c.cuenta_id, c.codigo, c.nombre
ORDER BY c.codigo";

            var movimientosPeriodo = await _context.Set<BalanceSaldosParcialDto>()
                .FromSqlRaw(query,
                    new MySqlParameter("@FechaInicio", periodo.fecha_inicio),
                    new MySqlParameter("@FechaFin", periodo.fecha_fin))
                .ToListAsync();

            // Obtener jerarquía para cada cuenta
            var jerarquias = await _context.JERARQUIA.ToListAsync();
            var jerarquiaDict = jerarquias.ToDictionary(j => j.codigo_cuenta_hijo);

            // Combinar con saldos iniciales
            var resultado = movimientosPeriodo
                .Select(m =>
                {
                    var saldoInicial = saldosIniciales.TryGetValue(m.Cuenta_Id, out var s) ? s : 0;
                    var saldoFinal = saldoInicial + (m.Total_Debe - m.Total_Haber);

                    jerarquiaDict.TryGetValue(m.Codigo, out var jerarquia);

                    return new BalanceSaldosDto
                    {
                        Cuenta_Id = m.Cuenta_Id,
                        Codigo = m.Codigo,
                        Nombre = m.Nombre,
                        Saldo_Inicial = saldoInicial,
                        Total_Debe = m.Total_Debe,
                        Total_Haber = m.Total_Haber,
                        Saldo_Final = saldoFinal,
                        CodigoCuentaPadre = jerarquia?.codigo_cuenta_padre,
                        NivelJerarquia = jerarquia?.nivel
                    };
                })
                .ToList();

            return Ok(resultado);
        }

        [HttpPost("EstadoResultados")]
        public async Task<ActionResult<IEnumerable<EstadoResultadosDto>>> GetEstadoResultados(RequestConsultaLibros requestConsulta)
        {
            var query = @"
SELECT 
    c.cuenta_id,
    c.codigo,
    c.nombre,
    SUM(d.debe) AS total_debe,
    SUM(d.haber) AS total_haber,
    SUM(d.haber - d.debe) AS resultado,
    j.codigo_cuenta_padre AS codigoCuentaPadre,
    j.nivel AS nivelJerarquia
FROM 
    Detalle_Asiento d
JOIN 
    Cuentas c ON d.cuenta_id = c.cuenta_id
JOIN 
    Asientos a ON d.asiento_id = a.asiento_id
LEFT JOIN 
    JERARQUIA j ON c.codigo = j.codigo_cuenta_hijo
WHERE 
    c.tipo IN ('Ingreso', 'Gasto') AND
    a.id_periodo = @IdPeriodo
GROUP BY 
    c.cuenta_id, c.codigo, c.nombre, j.codigo_cuenta_padre, j.nivel
ORDER BY 
    c.codigo";

            var resultado = await _context.Set<EstadoResultadosDto>()
                .FromSqlRaw(query, new MySqlParameter("@IdPeriodo", requestConsulta.id_periodo))
                .ToListAsync();

            return Ok(resultado);
        }

        [HttpPost("BalanceGeneral")]
        public async Task<ActionResult<IEnumerable<BalanceGeneral>>> GetBalanceGeneral(RequestConsultaLibros requestConsulta)
        {
            var periodo = await _context.PERIODO
                .FirstOrDefaultAsync(p => p.id_periodo == requestConsulta.id_periodo);

            if (periodo == null)
                return NotFound("Periodo no encontrado");

            var cuentas = await _context.CUENTAS
                .Where(c => c.TIPO == "Activo" || c.TIPO == "Pasivo" || c.TIPO == "Capital")
                .ToListAsync();

            var saldosIniciales = await _context.SALDOCUENTAPERIODO
                .Where(s => s.id_periodo == requestConsulta.id_periodo)
                .ToDictionaryAsync(s => s.cuenta_id, s => s.saldo_inicial);

            var query = @"
SELECT 
    c.cuenta_id,
    SUM(d.debe) AS total_debe,
    SUM(d.haber) AS total_haber
FROM 
    Detalle_Asiento d
JOIN 
    Asientos a ON d.asiento_id = a.asiento_id
JOIN 
    Cuentas c ON d.cuenta_id = c.cuenta_id
WHERE 
    c.tipo IN ('Activo', 'Pasivo', 'Capital') AND
    a.id_periodo = @PeriodoId
GROUP BY 
    c.cuenta_id";

            var movimientos = await _context.Set<BalanceGeneralMovimientoParcialDto>()
                .FromSqlRaw(query, new MySqlParameter("@PeriodoId", requestConsulta.id_periodo))
                .ToListAsync();

            var movimientosDict = movimientos.ToDictionary(m => m.Cuenta_Id);

            var jerarquias = await _context.JERARQUIA.ToListAsync();

            var nivelesPorCodigo = jerarquias
                .GroupBy(j => j.codigo_cuenta_hijo)
                .ToDictionary(g => g.Key, g => g.Max(j => j.nivel));

            var padresPorCodigo = jerarquias
                .GroupBy(j => j.codigo_cuenta_hijo)
                .ToDictionary(g => g.Key, g => g.First().codigo_cuenta_padre);

            var resultado = cuentas.Select(c =>
            {
                saldosIniciales.TryGetValue(c.CUENTA_ID, out decimal saldoInicial);
                movimientosDict.TryGetValue(c.CUENTA_ID, out var mov);
                decimal debe = mov?.Total_Debe ?? 0;
                decimal haber = mov?.Total_Haber ?? 0;
                decimal saldoBruto = saldoInicial + (debe - haber);

                // Para activos y pasivos el saldo siempre es positivo
                decimal saldo = (c.TIPO == "Activo" || c.TIPO == "Pasivo") ? Math.Abs(saldoBruto) : saldoBruto;
                string tipoSaldo = saldo >= 0 ? "Deudor" : "Acreedor";

                nivelesPorCodigo.TryGetValue(c.CODIGO, out int nivelJerarquia);
                padresPorCodigo.TryGetValue(c.CODIGO, out string codigoPadre);

                return new BalanceGeneral
                {
                    CUENTA_ID = c.CUENTA_ID,
                    Codigo = c.CODIGO,
                    Nombre = c.NOMBRE,
                    Tipo = c.TIPO,
                    SaldoInicial = saldoInicial,
                    TOTAL_DEBE = debe,
                    TOTAL_HABER = haber,
                    Saldo = saldo,
                    TipoSaldo = tipoSaldo,
                    NivelJerarquia = nivelJerarquia,
                    CodigoCuentaPadre = codigoPadre
                };
            }).ToList();

            return Ok(resultado);
        }


        [HttpPost("EstadosFinancieros")]
        public async Task<ActionResult<IEnumerable<EstadosFinancieros>>> GetEstadosFinancieros(RequestConsultaLibros requestConsulta)
        {
            var periodo = await _context.PERIODO
                .Where(p => p.id_periodo == requestConsulta.id_periodo)
                .FirstOrDefaultAsync();

            if (periodo == null)
                return NotFound("Periodo no encontrado");

            var query = @"
-- BALANCE GENERAL
SELECT 
    'Balance General' AS tipo_estado,
    c.cuenta_id,
    c.codigo,
    c.nombre,

    -- Sumas históricas hasta antes del periodo
    IFNULL(SUM(CASE WHEN a.fecha < @FechaInicio THEN d.debe ELSE 0 END), 0) AS total_debe,
    IFNULL(SUM(CASE WHEN a.fecha < @FechaInicio THEN d.haber ELSE 0 END), 0) AS total_haber,
    IFNULL(SUM(CASE WHEN a.fecha < @FechaInicio THEN d.debe - d.haber ELSE 0 END), 0) +
    IFNULL(SUM(CASE WHEN a.fecha BETWEEN @FechaInicio AND @FechaFin THEN d.debe - d.haber ELSE 0 END), 0) AS saldo

FROM Detalle_Asiento d
JOIN Cuentas c ON d.cuenta_id = c.cuenta_id
JOIN Asientos a ON d.asiento_id = a.asiento_id
WHERE 
    c.tipo IN ('Activo', 'Pasivo', 'Capital')
    AND a.fecha <= @FechaFin  -- Limita a asientos hasta el final del periodo
GROUP BY c.cuenta_id, c.codigo, c.nombre

UNION ALL

-- ESTADO DE RESULTADOS
SELECT 
    'Estado de Resultados' AS tipo_estado,
    c.cuenta_id,
    c.codigo,
    c.nombre,

    -- Solo movimientos dentro del periodo
    IFNULL(SUM(CASE WHEN a.fecha BETWEEN @FechaInicio AND @FechaFin THEN d.debe ELSE 0 END), 0) AS total_debe,
    IFNULL(SUM(CASE WHEN a.fecha BETWEEN @FechaInicio AND @FechaFin THEN d.haber ELSE 0 END), 0) AS total_haber,
    IFNULL(SUM(CASE WHEN a.fecha BETWEEN @FechaInicio AND @FechaFin THEN d.haber - d.debe ELSE 0 END), 0) AS saldo

FROM Detalle_Asiento d
JOIN Cuentas c ON d.cuenta_id = c.cuenta_id
JOIN Asientos a ON d.asiento_id = a.asiento_id
WHERE 
    c.tipo IN ('Ingreso', 'Gasto')
    AND a.fecha BETWEEN @FechaInicio AND @FechaFin -- Filtra asientos dentro del periodo
GROUP BY c.cuenta_id, c.codigo, c.nombre
";

            var resultado = await _context.Set<EstadosFinancieros>()
                .FromSqlRaw(query,
                    new MySqlParameter("@FechaInicio", periodo.fecha_inicio),
                    new MySqlParameter("@FechaFin", periodo.fecha_fin))
                .ToListAsync();

            return Ok(resultado);
        }

    }

}
