using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RecetArreAPI2.Models
{
    public class Categoria
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Nombre { get; set; } = default!;

        [StringLength(500)]
        public string? Descripcion { get; set; }

        public DateTime CreadoUtc { get; set; } = DateTime.UtcNow;

        // Relación con ApplicationUser (quién creó la categoría)
        [ForeignKey("ApplicationUser")]
        public string? CreadoPorUsuarioId { get; set; }


        public ApplicationUser? CreadoPorUsuario { get; set; }
        public ICollection<Receta> Recetas { get; set; } = new List<Receta>();
    }
}
