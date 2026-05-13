using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecetArreAPI2.Context;
using RecetArreAPI2.DTOs.Raiting;
using RecetArreAPI2.Models;

namespace RecetArreAPI2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RaitingController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;
        private readonly UserManager<ApplicationUser> userManager;

        public RaitingController(
            ApplicationDbContext context,
            IMapper mapper,
            UserManager<ApplicationUser> userManager)
        {
            this.context = context;
            this.mapper = mapper;
            this.userManager = userManager;
        }

        // ─────────────────────────────────────────────
        // GET api/raiting/receta/{recetaId}
        // Devuelve todas las valoraciones de una receta
        // ─────────────────────────────────────────────
        [HttpGet("receta/{recetaId:int}")]
        public async Task<ActionResult<IEnumerable<RaitingDto>>> GetRaitingsPorReceta(int recetaId)
        {
            var existeReceta = await context.Recetas.AnyAsync(r => r.Id == recetaId);
            if (!existeReceta)
                return NotFound(new { mensaje = "Receta no encontrada." });

            var raitings = await context.Raitings
                .Include(r => r.Usuario)
                .Where(r => r.RecetaId == recetaId)
                .OrderByDescending(r => r.CreadoUtc)
                .ToListAsync();

            return Ok(mapper.Map<List<RaitingDto>>(raitings));
        }

        // ─────────────────────────────────────────────
        // GET api/raiting/receta/{recetaId}/resumen
        // Devuelve el promedio y distribución de medallas
        // ─────────────────────────────────────────────
        [HttpGet("receta/{recetaId:int}/resumen")]
        public async Task<ActionResult<RaitingResumenDto>> GetResumenPorReceta(int recetaId)
        {
            var existeReceta = await context.Recetas.AnyAsync(r => r.Id == recetaId);
            if (!existeReceta)
                return NotFound(new { mensaje = "Receta no encontrada." });

            var raitings = await context.Raitings
                .Where(r => r.RecetaId == recetaId)
                .ToListAsync();

            var resumen = new RaitingResumenDto
            {
                RecetaId = recetaId,
                TotalVotos = raitings.Count,
                PromedioMedallas = raitings.Count > 0
                    ? Math.Round(raitings.Average(r => r.Puntuacion), 1)
                    : 0,
                DistribucionMedallas = Enumerable.Range(1, 5)
                    .ToDictionary(k => k, k => raitings.Count(r => r.Puntuacion == k))
            };

            return Ok(resumen);
        }

        // ─────────────────────────────────────────────
        // GET api/raiting/mio/{recetaId}
        // Devuelve la valoración del usuario autenticado para una receta
        // ─────────────────────────────────────────────
        [HttpGet("mio/{recetaId:int}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult<RaitingDto>> GetMiRaiting(int recetaId)
        {
            var usuarioId = userManager.GetUserId(User);
            if (string.IsNullOrEmpty(usuarioId))
                return Unauthorized(new { mensaje = "Usuario no autenticado." });

            var raiting = await context.Raitings
                .Include(r => r.Usuario)
                .FirstOrDefaultAsync(r => r.RecetaId == recetaId && r.UsuarioId == usuarioId);

            if (raiting == null)
                return NotFound(new { mensaje = "Aún no has valorado esta receta." });

            return Ok(mapper.Map<RaitingDto>(raiting));
        }

        // ─────────────────────────────────────────────
        // POST api/raiting
        // Crea una nueva valoración (un voto por usuario por receta)
        // ─────────────────────────────────────────────
        [HttpPost]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult<RaitingDto>> CreateRaiting(RaitingCreacionDto dto)
        {
            var usuarioId = userManager.GetUserId(User);
            if (string.IsNullOrEmpty(usuarioId))
                return Unauthorized(new { mensaje = "Usuario no autenticado." });

            var existeReceta = await context.Recetas.AnyAsync(r => r.Id == dto.RecetaId);
            if (!existeReceta)
                return NotFound(new { mensaje = "Receta no encontrada." });

            // Evitar duplicados: un usuario solo puede valorar una vez por receta
            var yaVoto = await context.Raitings
                .AnyAsync(r => r.RecetaId == dto.RecetaId && r.UsuarioId == usuarioId);
            if (yaVoto)
                return Conflict(new { mensaje = "Ya has valorado esta receta. Usa PUT para actualizar tu medalla." });

            var raiting = mapper.Map<Models.Raiting>(dto);
            raiting.UsuarioId = usuarioId;
            raiting.CreadoUtc = DateTime.UtcNow;
            raiting.ModificadoUtc = DateTime.UtcNow;

            context.Raitings.Add(raiting);
            await context.SaveChangesAsync();

            await context.Entry(raiting).Reference(r => r.Usuario).LoadAsync();

            return CreatedAtAction(
                nameof(GetRaitingsPorReceta),
                new { recetaId = raiting.RecetaId },
                mapper.Map<RaitingDto>(raiting));
        }

        // ─────────────────────────────────────────────
        // PUT api/raiting/{id}
        // Actualiza la valoración del usuario autenticado
        // ─────────────────────────────────────────────
        [HttpPut("{id:int}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> UpdateRaiting(int id, RaitingModificacionDto dto)
        {
            var usuarioId = userManager.GetUserId(User);
            if (string.IsNullOrEmpty(usuarioId))
                return Unauthorized(new { mensaje = "Usuario no autenticado." });

            var raiting = await context.Raitings.FirstOrDefaultAsync(r => r.Id == id);
            if (raiting == null)
                return NotFound(new { mensaje = "Valoración no encontrada." });

            if (raiting.UsuarioId != usuarioId)
                return Forbid();

            mapper.Map(dto, raiting);
            raiting.ModificadoUtc = DateTime.UtcNow;

            context.Raitings.Update(raiting);
            await context.SaveChangesAsync();

            await context.Entry(raiting).Reference(r => r.Usuario).LoadAsync();

            return Ok(new
            {
                mensaje = "Valoración actualizada exitosamente.",
                data = mapper.Map<RaitingDto>(raiting)
            });
        }

        // ─────────────────────────────────────────────
        // DELETE api/raiting/{id}
        // Elimina la valoración del usuario autenticado
        // ─────────────────────────────────────────────
        [HttpDelete("{id:int}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> DeleteRaiting(int id)
        {
            var usuarioId = userManager.GetUserId(User);
            if (string.IsNullOrEmpty(usuarioId))
                return Unauthorized(new { mensaje = "Usuario no autenticado." });

            var raiting = await context.Raitings.FirstOrDefaultAsync(r => r.Id == id);
            if (raiting == null)
                return NotFound(new { mensaje = "Valoración no encontrada." });

            if (raiting.UsuarioId != usuarioId)
                return Forbid();

            context.Raitings.Remove(raiting);
            await context.SaveChangesAsync();

            return Ok(new { mensaje = "Valoración eliminada exitosamente." });
        }
    }
}
