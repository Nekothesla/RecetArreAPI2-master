using System.ComponentModel.DataAnnotations;

namespace RecetArreAPI2.Models
{
    public class Comentario
    {
        public int Id { get; set; }

        [Required]
        [StringLength(1000, MinimumLength = 1)]
        public string Contenido { get; set; } = default!;

        public DateTime CreadoUtc { get; set; } = DateTime.UtcNow;

        public int RecetaId { get; set; }

        [Required]
        public string UsuarioId { get; set; } = default!;

        public Receta Receta { get; set; } = default!;
        public ApplicationUser Usuario { get; set; } = default!;
    }
}
