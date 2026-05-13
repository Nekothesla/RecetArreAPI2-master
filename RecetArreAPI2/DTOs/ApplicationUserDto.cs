namespace RecetArreAPI2.DTOs
{
    public class ApplicationUserDto
    {
        public string? Id { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Biografia { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Localidad { get; set; }
        public DateOnly? FechaNacimiento { get; set; }
        public string? PaginaWebUrl { get; set; }
        public string? Dietas { get; set; }
        public DateTime CreadoUtc { get; set; }
        public DateTime ModificadoUtc { get; set; }
    }
}
