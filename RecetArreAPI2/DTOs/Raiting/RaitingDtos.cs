using System.ComponentModel.DataAnnotations;

namespace RecetArreAPI2.DTOs.Raiting
{
    /// <summary>
    /// DTO de lectura: devuelve una valoración existente.
    /// </summary>
    public class RaitingDto
    {
        public int Id { get; set; }

        /// <summary>
        /// Valor de 1 a 5 medallas.
        /// 1 = Bronce · 2 = Bronce-Plata · 3 = Plata · 4 = Plata-Oro · 5 = Oro
        /// </summary>
        public int Puntuacion { get; set; }

        public int RecetaId { get; set; }
        public string UsuarioId { get; set; } = default!;
        public string? NombreUsuario { get; set; }
        public DateTime CreadoUtc { get; set; }
        public DateTime ModificadoUtc { get; set; }
    }

    /// <summary>
    /// DTO para crear una nueva valoración.
    /// </summary>
    public class RaitingCreacionDto
    {
        [Required(ErrorMessage = "El Id de la receta es obligatorio.")]
        public int RecetaId { get; set; }

        [Required(ErrorMessage = "La puntuación es obligatoria.")]
        [Range(1, 5, ErrorMessage = "La puntuación debe ser entre 1 y 5 medallas.")]
        public int Puntuacion { get; set; }
    }

    /// <summary>
    /// DTO para actualizar una valoración existente.
    /// </summary>
    public class RaitingModificacionDto
    {
        [Required(ErrorMessage = "La puntuación es obligatoria.")]
        [Range(1, 5, ErrorMessage = "La puntuación debe ser entre 1 y 5 medallas.")]
        public int Puntuacion { get; set; }
    }

    /// <summary>
    /// DTO con el resumen de puntuaciones de una receta.
    /// </summary>
    public class RaitingResumenDto
    {
        public int RecetaId { get; set; }

        /// <summary>
        /// Promedio de medallas con un decimal de precisión.
        /// </summary>
        public double PromedioMedallas { get; set; }

        public int TotalVotos { get; set; }

        /// <summary>
        /// Distribución: clave = nivel de medalla (1-5), valor = cantidad de votos.
        /// </summary>
        public Dictionary<int, int> DistribucionMedallas { get; set; } = new();
    }
}
