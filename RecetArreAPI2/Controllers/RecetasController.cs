using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecetArreAPI2.Context;
using RecetArreAPI2.DTOs.Recetas;
using RecetArreAPI2.Models;

namespace RecetArreAPI2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecetasController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;
        private readonly UserManager<ApplicationUser> userManager;

        public RecetasController(
            ApplicationDbContext context,
            IMapper mapper,
            UserManager<ApplicationUser> userManager)
        {
            this.context = context;
            this.mapper = mapper;
            this.userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecetaDto>>> GetRecetas()
        {
            var recetas = await context.Recetas
                .Include(r => r.Categorias)
                .Include(r => r.Ingredientes)
                .OrderByDescending(r => r.CreadoUtc)
                .ToListAsync();

            return Ok(mapper.Map<List<RecetaDto>>(recetas));
        }

        //Filtrar por categorias
        [HttpGet("filtrar/categorias")]
        public async Task<ActionResult<IEnumerable<RecetaDto>>> FiltrarPorCategorias([FromQuery] List<int> categoriaIds)
        {
            if (categoriaIds == null || categoriaIds.Count == 0)
            {
                return BadRequest(new { mensaje = "Debe enviar al menos un id de categoría" });
            }

            var ids = categoriaIds.Distinct().ToList();
            var recetas = await context.Recetas
                .Include(r => r.Categorias)
                .Include(r => r.Ingredientes)
                .Where(r => r.Categorias.Any(c => ids.Contains(c.Id)))
                .OrderByDescending(r => r.CreadoUtc)
                .ToListAsync();

            return Ok(mapper.Map<List<RecetaDto>>(recetas));
        }

        [HttpGet("filtrar/ingredientes")]
        public async Task<ActionResult<IEnumerable<RecetaDto>>> FiltrarPorIngredientes([FromQuery] List<int> ingredienteIds)
        {
            if (ingredienteIds == null || ingredienteIds.Count == 0)
            {
                return BadRequest(new { mensaje = "Debe enviar al menos un id de ingrediente" });
            }

            var ids = ingredienteIds.Distinct().ToList();
            var recetas = await context.Recetas
                .Include(r => r.Categorias)
                .Include(r => r.Ingredientes)
                .Where(r => r.Ingredientes.Any(i => ids.Contains(i.Id)))
                .OrderByDescending(r => r.CreadoUtc)
                .ToListAsync();

            return Ok(mapper.Map<List<RecetaDto>>(recetas));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<RecetaDto>> GetReceta(int id)
        {
            var receta = await context.Recetas
                .Include(r => r.Categorias)
                .Include(r => r.Ingredientes)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (receta == null)
            {
                return NotFound(new { mensaje = "Receta no encontrada" });
            }

            return Ok(mapper.Map<RecetaDto>(receta));
        }

        [HttpPost]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult<RecetaDto>> CreateReceta(RecetaCreacionDto recetaCreacionDto)
        {
            var usuarioId = userManager.GetUserId(User);
            if (string.IsNullOrEmpty(usuarioId))
            {
                return Unauthorized(new { mensaje = "Usuario no autenticado" });
            }

            var categoriaIds = recetaCreacionDto.CategoriaIds.Distinct().ToList();
            var categorias = await context.Categorias
                .Where(c => categoriaIds.Contains(c.Id))
                .ToListAsync();

            if (categorias.Count != categoriaIds.Count)
            {
                return BadRequest(new { mensaje = "Una o más categorías no existen" });
            }

            var ingredienteIds = recetaCreacionDto.IngredienteIds.Distinct().ToList();
            var ingredientes = await context.Ingredientes
                .Where(i => ingredienteIds.Contains(i.Id))
                .ToListAsync();

            if (ingredientes.Count != ingredienteIds.Count)
            {
                return BadRequest(new { mensaje = "Uno o más ingredientes no existen" });
            }

            var receta = mapper.Map<Receta>(recetaCreacionDto);
            receta.AutorId = usuarioId;
            receta.CreadoUtc = DateTime.UtcNow;
            receta.ModificadoUtc = DateTime.UtcNow;
            receta.Categorias = categorias;
            receta.Ingredientes = ingredientes;

            context.Recetas.Add(receta);
            await context.SaveChangesAsync();

            receta = await context.Recetas
                .Include(r => r.Categorias)
                .Include(r => r.Ingredientes)
                .FirstAsync(r => r.Id == receta.Id);

            return CreatedAtAction(nameof(GetReceta), new { id = receta.Id }, mapper.Map<RecetaDto>(receta));
        }

        [HttpPut("{id:int}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> UpdateReceta(int id, RecetaModificacionDto recetaModificacionDto)
        {
            var usuarioId = userManager.GetUserId(User);
            if (string.IsNullOrEmpty(usuarioId))
            {
                return Unauthorized(new { mensaje = "Usuario no autenticado" });
            }

            var receta = await context.Recetas
                .Include(r => r.Categorias)
                .Include(r => r.Ingredientes)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (receta == null)
            {
                return NotFound(new { mensaje = "Receta no encontrada" });
            }

            if (receta.AutorId != usuarioId)
            {
                return Forbid();
            }

            var categoriaIds = recetaModificacionDto.CategoriaIds.Distinct().ToList();
            var categorias = await context.Categorias
                .Where(c => categoriaIds.Contains(c.Id))
                .ToListAsync();

            if (categorias.Count != categoriaIds.Count)
            {
                return BadRequest(new { mensaje = "Una o más categorías no existen" });
            }

            var ingredienteIds = recetaModificacionDto.IngredienteIds.Distinct().ToList();
            var ingredientes = await context.Ingredientes
                .Where(i => ingredienteIds.Contains(i.Id))
                .ToListAsync();

            if (ingredientes.Count != ingredienteIds.Count)
            {
                return BadRequest(new { mensaje = "Uno o más ingredientes no existen" });
            }

            mapper.Map(recetaModificacionDto, receta);
            receta.ModificadoUtc = DateTime.UtcNow;
            receta.Categorias = categorias;
            receta.Ingredientes = ingredientes;

            context.Recetas.Update(receta);
            await context.SaveChangesAsync();

            return Ok(new { mensaje = "Receta actualizada exitosamente", data = mapper.Map<RecetaDto>(receta) });
        }

        [HttpDelete("{id:int}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> DeleteReceta(int id)
        {
            var usuarioId = userManager.GetUserId(User);
            if (string.IsNullOrEmpty(usuarioId))
            {
                return Unauthorized(new { mensaje = "Usuario no autenticado" });
            }

            var receta = await context.Recetas.FirstOrDefaultAsync(r => r.Id == id);
            if (receta == null)
            {
                return NotFound(new { mensaje = "Receta no encontrada" });
            }

            if (receta.AutorId != usuarioId)
            {
                return Forbid();
            }

            context.Recetas.Remove(receta);
            await context.SaveChangesAsync();

            return Ok(new { mensaje = "Receta eliminada exitosamente" });
        }
    }
}
