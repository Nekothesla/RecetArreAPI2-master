using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecetArreAPI2.Context;
using RecetArreAPI2.DTOs.Comentarios;
using RecetArreAPI2.Models;

namespace RecetArreAPI2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComentariosController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;
        private readonly UserManager<ApplicationUser> userManager;

        public ComentariosController(
            ApplicationDbContext context,
            IMapper mapper,
            UserManager<ApplicationUser> userManager)
        {
            this.context = context;
            this.mapper = mapper;
            this.userManager = userManager;
        }

        [HttpGet("receta/{recetaId:int}")]
        public async Task<ActionResult<IEnumerable<ComentarioDto>>> GetComentariosPorReceta(int recetaId)
        {
            var existeReceta = await context.Recetas.AnyAsync(r => r.Id == recetaId);
            if (!existeReceta)
            {
                return NotFound(new { mensaje = "Receta no encontrada" });
            }

            var comentarios = await context.Comentarios
                .Where(c => c.RecetaId == recetaId)
                .OrderByDescending(c => c.CreadoUtc)
                .ToListAsync();

            return Ok(mapper.Map<List<ComentarioDto>>(comentarios));
        }

        [HttpPost]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult<ComentarioDto>> CreateComentario(ComentarioCreacionDto comentarioCreacionDto)
        {
            var usuarioId = userManager.GetUserId(User);
            if (string.IsNullOrEmpty(usuarioId))
            {
                return Unauthorized(new { mensaje = "Usuario no autenticado" });
            }

            var recetaExiste = await context.Recetas.AnyAsync(r => r.Id == comentarioCreacionDto.RecetaId);
            if (!recetaExiste)
            {
                return NotFound(new { mensaje = "Receta no encontrada" });
            }

            var comentario = mapper.Map<Comentario>(comentarioCreacionDto);
            comentario.UsuarioId = usuarioId;
            comentario.CreadoUtc = DateTime.UtcNow;

            context.Comentarios.Add(comentario);
            await context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetComentariosPorReceta), new { recetaId = comentario.RecetaId }, mapper.Map<ComentarioDto>(comentario));
        }

        [HttpPut("{id:int}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> UpdateComentario(int id, ComentarioModificacionDto comentarioModificacionDto)
        {
            var usuarioId = userManager.GetUserId(User);
            if (string.IsNullOrEmpty(usuarioId))
            {
                return Unauthorized(new { mensaje = "Usuario no autenticado" });
            }

            var comentario = await context.Comentarios.FirstOrDefaultAsync(c => c.Id == id);
            if (comentario == null)
            {
                return NotFound(new { mensaje = "Comentario no encontrado" });
            }

            if (comentario.UsuarioId != usuarioId)
            {
                return Forbid();
            }

            mapper.Map(comentarioModificacionDto, comentario);
            context.Comentarios.Update(comentario);
            await context.SaveChangesAsync();

            return Ok(new { mensaje = "Comentario actualizado exitosamente", data = mapper.Map<ComentarioDto>(comentario) });
        }

        [HttpDelete("{id:int}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> DeleteComentario(int id)
        {
            var usuarioId = userManager.GetUserId(User);
            if (string.IsNullOrEmpty(usuarioId))
            {
                return Unauthorized(new { mensaje = "Usuario no autenticado" });
            }

            var comentario = await context.Comentarios.FirstOrDefaultAsync(c => c.Id == id);
            if (comentario == null)
            {
                return NotFound(new { mensaje = "Comentario no encontrado" });
            }

            if (comentario.UsuarioId != usuarioId)
            {
                return Forbid();
            }

            context.Comentarios.Remove(comentario);
            await context.SaveChangesAsync();

            return Ok(new { mensaje = "Comentario eliminado exitosamente" });
        }
    }
}
