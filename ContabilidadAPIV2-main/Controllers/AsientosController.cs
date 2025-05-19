using ContabilidadAPIV2.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ContabilidadAPIV2.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class ASIENTOSController : ControllerBase
    {
        private readonly ContabilidadContext _context;

        public ASIENTOSController(ContabilidadContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ASIENTOS>>> GetASIENTOS()
        {
            return await _context.ASIENTOS.Include(a => a.Detalles).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ASIENTOS>> GetAsiento(int id)
        {
            var asiento = await _context.ASIENTOS.Include(a => a.Detalles).FirstOrDefaultAsync(a => a.ASIENTO_ID == id);

            if (asiento == null)
            {
                return NotFound();
            }

            return asiento;
        }

        [HttpGet("periodo/{id}")]
        public async Task<ActionResult<List<ASIENTOS>>> GetAsientosByPeriodo(int id)
        {
            var asientos = await _context.ASIENTOS
                .Include(a => a.Detalles)
                .Where(a => a.id_periodo == id)
                .ToListAsync();

            if (asientos == null || asientos.Count == 0)
            {
                return NotFound($"No se encontraron asientos para el periodo con id {id}");
            }

            return asientos;
        }

        [HttpPost]
        public async Task<ActionResult<ASIENTOS>> PostAsiento(ASIENTOS asiento)
        {
            _context.ASIENTOS.Add(asiento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAsiento), new { id = asiento.ASIENTO_ID }, asiento);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAsiento(int id, ASIENTOS asiento)
        {
            if (id != asiento.ASIENTO_ID)
            {
                return BadRequest();
            }

            _context.Entry(asiento).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AsientoExists(id))
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
        public async Task<IActionResult> DeleteAsiento(int id)
        {
            var asiento = await _context.ASIENTOS.Include(a => a.Detalles).FirstOrDefaultAsync(a => a.ASIENTO_ID == id);
            if (asiento == null)
            {
                return NotFound();
            }

            _context.ASIENTOS.Remove(asiento);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AsientoExists(int id)
        {
            return _context.ASIENTOS.Any(e => e.ASIENTO_ID == id);
        }
    }

}
