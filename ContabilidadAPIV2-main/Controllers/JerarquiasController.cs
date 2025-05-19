using ContabilidadAPIV2.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ContabilidadAPIV2.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class JERARQUIASController : ControllerBase
    {
        private readonly ContabilidadContext _context;

        public JERARQUIASController(ContabilidadContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<JERARQUIA>>> GetJerarquias()
        {
            return await _context.JERARQUIA.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<JERARQUIA>> GetJerarquia(int id)
        {
            var jerarquia = await _context.JERARQUIA.FirstOrDefaultAsync(a => a.id_jerarquia == id);

            if (jerarquia == null)
            {
                return NotFound();
            }

            return jerarquia;
        }

        [HttpPost]
        public async Task<ActionResult<JERARQUIA>> PostJerarquia(JERARQUIA jerarquia)
        {
            _context.JERARQUIA.Add(jerarquia);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetJerarquia), new { id = jerarquia.id_jerarquia }, jerarquia);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutJerarquia(int id, JERARQUIA jerarquia)
        {
            if (id != jerarquia.id_jerarquia)
            {
                return BadRequest();
            }

            _context.Entry(jerarquia).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!JerarquiaExists(id))
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
        public async Task<IActionResult> DeleteJerarquia(int id)
        {
            var jerarquia = await _context.JERARQUIA.FindAsync(id);
            if (jerarquia == null)
            {
                return NotFound();
            }

            _context.JERARQUIA.Remove(jerarquia);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool JerarquiaExists(int id)
        {
            return _context.JERARQUIA.Any(e => e.id_jerarquia == id);
        }
    }

}