using Microsoft.AspNetCore.Mvc;
using ContabilidadAPIV2.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;


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
            // Obtener el período según el id_periodo
            var periodo = await _context.PERIODO
                .Where(p => p.id_periodo == requestConsulta.id_periodo)
                .FirstOrDefaultAsync();

            if (periodo == null)
                return NotFound("Periodo no encontrado");

            var query = @"
SELECT 
    d.detalle_id, -- clave
    c.cuenta_id,
    c.codigo,
    c.nombre,
    a.asiento_id,
    a.descripcion,
    a.fecha,
    d.debe,
    d.haber,
    SUM(d.debe - d.haber) OVER (PARTITION BY c.cuenta_id ORDER BY a.fecha, a.asiento_id, d.detalle_id) AS saldo
FROM 
    DETALLE_ASIENTO d
JOIN 
    ASIENTOS a ON d.asiento_id = a.asiento_id
JOIN 
    CUENTAS c ON d.cuenta_id = c.cuenta_id
WHERE
    a.fecha BETWEEN @FechaInicio AND @FechaFin
ORDER BY
    c.cuenta_id, a.fecha, a.asiento_id";

            var movimientos = await _context.Set<LibroMayorMovimientoDto>()
                .FromSqlRaw(query,
                    new SqlParameter("@FechaInicio", periodo.fecha_inicio.ToDateTime(TimeOnly.MinValue)),
                    new SqlParameter("@FechaFin", periodo.fecha_fin.ToDateTime(TimeOnly.MinValue)))
                .ToListAsync();

            // Agrupar por cuenta
            var agrupado = movimientos
                .GroupBy(m => new { m.Cuenta_Id, m.Codigo, m.Nombre })
                .Select(g => new LibroMayorAgrupado
                {
                    CuentaId = g.Key.Cuenta_Id,
                    Codigo = g.Key.Codigo,
                    Nombre = g.Key.Nombre,
                    Movimientos = g.ToList()
                })
                .ToList();

            return agrupado;
        }

        [HttpPost("BalanceSaldos")]
        public async Task<ActionResult<IEnumerable<BalanceSaldosDto>>> GetBalanceSaldos(RequestConsultaLibros requestConsulta)
        {
            var periodo = await _context.PERIODO
                .Where(p => p.id_periodo == requestConsulta.id_periodo)
                .FirstOrDefaultAsync();

            if (periodo == null)
                return NotFound("Periodo no encontrado");

            var query = @"
    SELECT 
        c.cuenta_id,
        c.codigo,
        c.nombre,

        -- Saldo inicial antes del periodo
        ISNULL(SUM(CASE WHEN a.fecha < @FechaInicio THEN d.debe - d.haber ELSE 0 END), 0) AS saldo_inicial,

        -- Movimientos dentro del periodo
        ISNULL(SUM(CASE WHEN a.fecha BETWEEN @FechaInicio AND @FechaFin THEN d.debe ELSE 0 END), 0) AS total_debe,
        ISNULL(SUM(CASE WHEN a.fecha BETWEEN @FechaInicio AND @FechaFin THEN d.haber ELSE 0 END), 0) AS total_haber,

        -- Saldo final = saldo inicial + movimientos periodo
        ISNULL(SUM(CASE WHEN a.fecha < @FechaInicio THEN d.debe - d.haber ELSE 0 END), 0) +
        ISNULL(SUM(CASE WHEN a.fecha BETWEEN @FechaInicio AND @FechaFin THEN d.debe - d.haber ELSE 0 END), 0) AS saldo_final

    FROM Detalle_Asiento d
    JOIN Cuentas c ON d.cuenta_id = c.cuenta_id
    JOIN Asientos a ON d.asiento_id = a.asiento_id
    GROUP BY c.cuenta_id, c.codigo, c.nombre
    ORDER BY c.codigo";

            var resultado = await _context.Set<BalanceSaldosDto>()
                .FromSqlRaw(query,
                    new SqlParameter("@FechaInicio", periodo.fecha_inicio),
                    new SqlParameter("@FechaFin", periodo.fecha_fin))
                .ToListAsync();

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
                    SUM(d.haber - d.debe) AS resultado
                FROM 
                    Detalle_Asiento d
                JOIN 
                    Cuentas c ON d.cuenta_id = c.cuenta_id
                JOIN 
                    Asientos a ON d.asiento_id = a.asiento_id
                WHERE 
                    c.tipo IN ('Ingreso', 'Gasto') AND
                    a.id_periodo = @IdPeriodo
                GROUP BY 
                    c.cuenta_id, c.codigo, c.nombre
                ORDER BY 
                    c.codigo";

            var resultado = await _context.Set<EstadoResultadosDto>()
                .FromSqlRaw(query, new SqlParameter("@IdPeriodo", requestConsulta.id_periodo))
                .ToListAsync();

            return resultado;
        }

        [HttpPost("BalanceGeneral")]
        public async Task<ActionResult<IEnumerable<BalanceGeneral>>> GetBalanceGeneral(RequestConsultaLibros requestConsulta)
        {
            var query = @"
                SELECT 
                    c.cuenta_id,
                    c.codigo,
                    c.nombre,
                    SUM(d.debe) AS total_debe,
                    SUM(d.haber) AS total_haber,
                    SUM(d.debe - d.haber) AS saldo,
                    c.tipo
                FROM 
                    Detalle_Asiento d
                JOIN 
                    Cuentas c ON d.cuenta_id = c.cuenta_id
                JOIN 
                    Asientos a ON d.asiento_id = a.asiento_id
                WHERE 
                    c.tipo IN ('Activo', 'Pasivo', 'Capital') AND
                    a.id_periodo = @PeriodoId
                GROUP BY 
                    c.cuenta_id, c.codigo, c.nombre, c.tipo
                ORDER BY 
                    c.codigo";

            return await _context.Set<BalanceGeneral>()
                .FromSqlRaw(query, new SqlParameter("@PeriodoId", requestConsulta.id_periodo))
                .ToListAsync();
        }

        [HttpPost("EstadosFinancieros")]
        public async Task<ActionResult<IEnumerable<EstadosFinancieros>>> GetEstadosFinancieros(RequestConsultaLibros requestConsulta)
        {
            var query = @"
    SELECT 
        'Balance General' AS tipo_estado,
        c.cuenta_id,
        c.codigo,
        c.nombre,
        SUM(d.debe) AS total_debe,
        SUM(d.haber) AS total_haber,
        SUM(d.debe - d.haber) AS saldo
    FROM 
        Detalle_Asiento d
    JOIN 
        Cuentas c ON d.cuenta_id = c.cuenta_id
    JOIN 
        Asientos a ON d.asiento_id = a.asiento_id
    WHERE 
        c.tipo IN ('Activo', 'Pasivo', 'Capital') AND
        a.id_periodo = @PeriodoId
    GROUP BY 
        c.cuenta_id, c.codigo, c.nombre

    UNION ALL

    SELECT 
        'Estado de Resultados' AS tipo_estado,
        c.cuenta_id,
        c.codigo,
        c.nombre,
        SUM(d.debe) AS total_debe,
        SUM(d.haber) AS total_haber,
        SUM(d.haber - d.debe) AS saldo
    FROM 
        Detalle_Asiento d
    JOIN 
        Cuentas c ON d.cuenta_id = c.cuenta_id
    JOIN 
        Asientos a ON d.asiento_id = a.asiento_id
    WHERE 
        c.tipo IN ('Ingreso', 'Gasto') AND
        a.id_periodo = @PeriodoId
    GROUP BY 
        c.cuenta_id, c.codigo, c.nombre";

            return await _context.Set<EstadosFinancieros>()
                .FromSqlRaw(query,
                    new SqlParameter("@PeriodoId", requestConsulta.id_periodo))
                .ToListAsync();
        }

    }

}
