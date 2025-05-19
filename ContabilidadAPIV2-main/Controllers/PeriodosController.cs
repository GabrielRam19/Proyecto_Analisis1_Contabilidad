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
        public async Task<ActionResult<IEnumerable<PERIODO>>> GetPeriodos()
        {
            return await _context.PERIODO.ToListAsync();
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

            return CreatedAtAction(nameof(GetPeriodo), new { id = periodo.id_periodo }, periodo);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPeriodo(int id, PERIODO periodo)
        {
            if (id != periodo.id_periodo)
            {
                return BadRequest();
            }

            _context.Entry(periodo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PeriodoExists(id))
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
    }

}