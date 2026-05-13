using System.ComponentModel.DataAnnotations;

namespace RecetArreAPI2.DTOs.Identity
{
    public class RespuestaAutenticacion
    {
        [Required]
        public required string Token { get; set; }
        [Required]
        public required DateTime Expiracion { get; set; }
        [Required]
        public required string UsuarioId { get; set; }
    }
}
