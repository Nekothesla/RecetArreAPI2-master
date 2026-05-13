using System.ComponentModel.DataAnnotations;

namespace RecetArreAPI2.Models
{
    /// <summary>
    /// Representa la valoración (medalla) que un usuario otorga a una receta.
    /// Escala: 1 = Bronce | 2 = Bronce-Plata | 3 = Plata | 4 = Plata-Oro | 5 = Oro
    /// </summary>
    public class Raiting
    {
        public int Id { get; set; }

        /// <summary>
        /// Puntuación en medallas: mínimo 1, máximo 5.
        /// </summary>
        [Required]
        [Range(1, 5, ErrorMessage = "La puntuación debe estar entre 1 y 5 medallas.")]
        public int Puntuacion { get; set; }

        public DateTime CreadoUtc { get; set; } = DateTime.UtcNow;
        public DateTime ModificadoUtc { get; set; } = DateTime.UtcNow;

        // FK → Receta
        [Required]
        public int RecetaId { get; set; }
        public Receta Receta { get; set; } = default!;

        // FK → Usuario
        [Required]
        public string UsuarioId { get; set; } = default!;
        public ApplicationUser Usuario { get; set; } = default!;
    }
}
