using System.ComponentModel.DataAnnotations;

namespace RecetArreAPI2.Models
{
    public class Receta
    {
        public int Id { get; set; }

        [Required]
        [StringLength(120, MinimumLength = 3)]
        public string Titulo { get; set; } = default!;

        [StringLength(1000)]
        public string? Descripcion { get; set; }

        [Required]
        [StringLength(15000)]
        public string Instrucciones { get; set; } = default!;

        [Range(0, 24 * 60)]
        public int TiempoPreparacionMinutos { get; set; }

        [Range(0, 24 * 60)]
        public int TiempoCoccionMinutos { get; set; }

        [Range(1, 100)]
        public int Porciones { get; set; } = 1;

        public bool EstaPublicado { get; set; } = true;

        public DateTime CreadoUtc { get; set; } = DateTime.UtcNow;
        public DateTime ModificadoUtc { get; set; } = DateTime.UtcNow;

        [Required]
        public string AutorId { get; set; } = default!;

        public ApplicationUser Autor { get; set; } = default!;
        public ICollection<Categoria> Categorias { get; set; } = new List<Categoria>();
        public ICollection<Ingrediente> Ingredientes { get; set; } = new List<Ingrediente>();
        public ICollection<Comentario> Comentarios { get; set; } = new List<Comentario>();
        public ICollection<Raiting> Raitings { get; set; } = new List<Raiting>();
    }
}
