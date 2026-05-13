using System.ComponentModel.DataAnnotations;

namespace RecetArreAPI2.Models
{
    public class Ingrediente
    {
        public int Id { get; set; }

        [Required]
        [StringLength(80, MinimumLength = 2)]
        public string Nombre { get; set; } = default!;

        [StringLength(250)]
        public string? Notas { get; set; }

        public DateTime CreadoUtc { get; set; } = DateTime.UtcNow;

        public ICollection<Receta> Recetas { get; set; } = new List<Receta>();
    }
}
