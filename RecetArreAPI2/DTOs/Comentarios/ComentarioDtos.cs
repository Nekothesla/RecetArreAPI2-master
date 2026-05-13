using System.ComponentModel.DataAnnotations;

namespace RecetArreAPI2.DTOs.Comentarios
{
    public class ComentarioDto
    {
        public int Id { get; set; }
        public string Contenido { get; set; } = default!;
        public DateTime CreadoUtc { get; set; }
        public int RecetaId { get; set; }
        public string UsuarioId { get; set; } = default!;
    }

    public class ComentarioCreacionDto
    {
        [Required]
        [StringLength(1000, MinimumLength = 1)]
        public string Contenido { get; set; } = default!;

        [Required]
        public int RecetaId { get; set; }
    }

    public class ComentarioModificacionDto
    {
        [Required]
        [StringLength(1000, MinimumLength = 1)]
        public string Contenido { get; set; } = default!;
    }
}
