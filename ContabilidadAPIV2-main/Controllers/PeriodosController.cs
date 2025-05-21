using ContabilidadAPIV2.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ContabilidadAPIV2.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class PERIODOSController : ControllerBase
    {
        private readonly ContabilidadContext _context;

        public PERIODOSController(ContabilidadContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PERIODO>>> GetPeriodos([FromQuery] bool? cerrado)
        {
            IQueryable<PERIODO> query = _context.PERIODO;

            if (cerrado.HasValue)
            {
                query = query.Where(p => p.estado == cerrado.Value);
            }

            return await query.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PERIODO>> GetPeriodo(int id)
        {
            var periodo = await _context.PERIODO.FirstOrDefaultAsync(a => a.id_periodo == id);

            if (periodo == null)
            {
                return NotFound();
            }

            return periodo;
        }

        [HttpPost]
        public async Task<ActionResult<PERIODO>> PostPeriodo(PERIODO periodo)
        {
            _context.PERIODO.Add(periodo);
            await _context.SaveChangesAsync();

            // Si el periodo se creó cerrado, calcular saldos
            if (periodo.estado == true)
            {
                await CerrarPeriodoAsync(periodo);
            }

            return CreatedAtAction(nameof(GetPeriodo), new { id = periodo.id_periodo }, periodo);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPeriodo(int id, PERIODO periodo)
        {
            if (id != periodo.id_periodo)
                return BadRequest();

            var existing = await _context.PERIODO.FindAsync(id);
            if (existing == null)
                return NotFound();

            // Detectar cambio de estado
            bool seCerro = existing.estado == false && periodo.estado == true;

            // Aplicar cambios
            _context.Entry(existing).CurrentValues.SetValues(periodo);
            await _context.SaveChangesAsync();

            // Si se cerró, calcular saldos
            if (seCerro)
            {
                await CerrarPeriodoAsync(existing);
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePeriodo(int id)
        {
            var periodo = await _context.PERIODO.FindAsync(id);
            if (periodo == null)
            {
                return NotFound();
            }

            _context.PERIODO.Remove(periodo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PeriodoExists(int id)
        {
            return _context.PERIODO.Any(e => e.id_periodo == id);
        }

        private async Task CerrarPeriodoAsync(PERIODO periodo)
        {
            // Obtener saldos del periodo anterior
            Dictionary<int, decimal> saldosAnteriores = new();
            if (periodo.id_periodo_anterior.HasValue)
            {
                saldosAnteriores = await _context.SALDOCUENTAPERIODO
                    .Where(s => s.id_periodo == periodo.id_periodo_anterior.Value)
                    .ToDictionaryAsync(s => s.cuenta_id, s => s.saldo_final);
            }

            // Obtener saldos de este periodo
            var saldosActuales = await _context.DETALLE_ASIENTO
                .Where(d => d.Asiento.id_periodo == periodo.id_periodo)
                .GroupBy(d => d.CUENTA_ID)
                .Select(g => new
                {
                    CuentaId = g.Key,
                    TotalDebe = g.Sum(d => d.DEBE),
                    TotalHaber = g.Sum(d => d.HABER),
                    SaldoFinal = g.Sum(d => d.DEBE - d.HABER)
                })
                .ToListAsync();

            // Guardar en tabla de saldos
            foreach (var saldo in saldosActuales)
            {
                var saldoInicial = saldosAnteriores.ContainsKey(saldo.CuentaId) ? saldosAnteriores[saldo.CuentaId] : 0m;

                // Buscar si ya existe el registro con ese id_periodo y cuenta_id
                var saldoPeriodoExistente = await _context.SALDOCUENTAPERIODO
                    .FirstOrDefaultAsync(s => s.id_periodo == periodo.id_periodo && s.cuenta_id == saldo.CuentaId);

                if (saldoPeriodoExistente != null)
                {
                    // Actualizar los campos del registro existente
                    saldoPeriodoExistente.saldo_inicial = saldoInicial;
                    saldoPeriodoExistente.total_debe = saldo.TotalDebe;
                    saldoPeriodoExistente.total_haber = saldo.TotalHaber;
                    saldoPeriodoExistente.saldo_final = saldoInicial + saldo.SaldoFinal;

                    // No es necesario llamar a _context.Update porque el objeto está trackeado
                }
                else
                {
                    // Crear un nuevo registro porque no existe
                    var saldoPeriodo = new SALDOCUENTAPERIODO
                    {
                        id_periodo = periodo.id_periodo,
                        cuenta_id = saldo.CuentaId,
                        saldo_inicial = saldoInicial,
                        total_debe = saldo.TotalDebe,
                        total_haber = saldo.TotalHaber,
                        saldo_final = saldoInicial + saldo.SaldoFinal
                    };

                    _context.SALDOCUENTAPERIODO.Add(saldoPeriodo);
                }
            }

            await _context.SaveChangesAsync();
        }

    }

}