using ContabilidadAPIV2.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ContabilidadAPIV2.Controllers
{


    [Route("api/[controller]")]
    [ApiController]
    public class CUENTASController : ControllerBase
    {
        private readonly ContabilidadContext _context;

        public CUENTASController(ContabilidadContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CUENTAS>>> GetCUENTAS()
        {
            return await _context.CUENTAS.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CUENTAS>> GetCuenta(int id)
        {
            var cuenta = await _context.CUENTAS.FindAsync(id);

            if (cuenta == null)
            {
                return NotFound();
            }

            return cuenta;
        }

        [HttpGet("tipoCuenta/{tipo}")]
        public async Task<ActionResult<IEnumerable<CUENTAS>>> GetCuentasPorTipo(string tipo)
        {
            var cuentasFiltradas = await _context.CUENTAS
                .Where(c => c.TIPO == tipo)
                .ToListAsync();

            // Ya no retornamos NotFound, devolvemos siempre la lista, aunque esté vacía
            return cuentasFiltradas;
        }

        [HttpPost]
        public async Task<ActionResult<CUENTAS>> PostCuenta(CUENTAS cuenta)
        {
            _context.CUENTAS.Add(cuenta);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCuenta), new { id = cuenta.CUENTA_ID }, cuenta);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCuenta(int id, CUENTAS cuenta)
        {
            if (id != cuenta.CUENTA_ID)
            {
                return BadRequest();
            }

            _context.Entry(cuenta).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CuentaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCuenta(int id)
        {
            var cuenta = await _context.CUENTAS.FindAsync(id);
            if (cuenta == null)
            {
                return NotFound();
            }

            _context.CUENTAS.Remove(cuenta);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CuentaExists(int id)
        {
            return _context.CUENTAS.Any(e => e.CUENTA_ID == id);
        }
    }

}
