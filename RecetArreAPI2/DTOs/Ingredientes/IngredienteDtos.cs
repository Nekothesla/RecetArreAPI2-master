using System.ComponentModel.DataAnnotations;

namespace RecetArreAPI2.DTOs.Ingredientes
{
    public class IngredienteDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = default!;
        public string? Notas { get; set; }
        public DateTime CreadoUtc { get; set; }
    }

    public class IngredienteCreacionDto
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(80, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 80 caracteres")]
        public string Nombre { get; set; } = default!;

        [StringLength(250, ErrorMessage = "Las notas no pueden exceder 250 caracteres")]
        public string? Notas { get; set; }
    }

    public class IngredienteModificacionDto
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(80, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 80 caracteres")]
        public string Nombre { get; set; } = default!;

        [StringLength(250, ErrorMessage = "Las notas no pueden exceder 250 caracteres")]
        public string? Notas { get; set; }
    }
}
