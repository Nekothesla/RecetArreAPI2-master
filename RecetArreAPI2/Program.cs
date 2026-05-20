using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RecetArreAPI2.Context;
using RecetArreAPI2.Models;
using Scalar.AspNetCore;
using System.Text;
using System.Text.Json.Serialization;

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Controladores
    builder.Services.AddControllers()
        .AddJsonOptions(x => x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles)
        .AddNewtonsoftJson();

    // OpenAPI
    builder.Services.AddOpenApi();

    // AutoMapper
    builder.Services.AddAutoMapper(cfg => cfg.AddMaps(typeof(Program).Assembly));

    // Identity
    builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

    // Base de datos
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

    // JWT
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(opciones => opciones.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["LlaveJWT"]!)),
            ClockSkew = TimeSpan.Zero
        });

    // CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("PermitirOrigenes", policy =>
        {
            policy.WithOrigins(
    "https://recet-arre-web-master.vercel.app",
    "http://localhost:5000",
    "https://localhost:5001"
)
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
    });

    var app = builder.Build();

    // Pipeline
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

    app.UseHttpsRedirection();

    app.UseCors("PermitirOrigenes");

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"Error al iniciar la aplicación: {ex.Message}");
    Console.WriteLine($"StackTrace: {ex.StackTrace}");
    if (ex.InnerException != null)
    {
        Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
    }
    throw;
}