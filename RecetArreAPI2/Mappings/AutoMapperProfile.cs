using AutoMapper;
using RecetArreAPI2.DTOs;
using RecetArreAPI2.DTOs.Categorias;
using RecetArreAPI2.DTOs.Comentarios;
using RecetArreAPI2.DTOs.Ingredientes;
using RecetArreAPI2.DTOs.Raiting;
using RecetArreAPI2.DTOs.Recetas;
using RecetArreAPI2.Models;

namespace RecetArreAPI2.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // ApplicationUser <-> ApplicationUserDto
            CreateMap<ApplicationUser, ApplicationUserDto>().ReverseMap();

            // Categoria mappings
            CreateMap<Categoria, CategoriaDto>();
            CreateMap<CategoriaCreacionDto, Categoria>();
            CreateMap<CategoriaModificacionDto, Categoria>();

            // Ingrediente mappings
            CreateMap<Ingrediente, IngredienteDto>();
            CreateMap<IngredienteCreacionDto, Ingrediente>();
            CreateMap<IngredienteModificacionDto, Ingrediente>();

            // Receta mappings
            CreateMap<Receta, RecetaDto>()
                .ForMember(dest => dest.CategoriaIds, opt => opt.MapFrom(src => src.Categorias.Select(c => c.Id)))
                .ForMember(dest => dest.IngredienteIds, opt => opt.MapFrom(src => src.Ingredientes.Select(i => i.Id)));
            CreateMap<RecetaCreacionDto, Receta>();
            CreateMap<RecetaModificacionDto, Receta>();

            // Comentario mappings
            CreateMap<Comentario, ComentarioDto>();
            CreateMap<ComentarioCreacionDto, Comentario>();
            CreateMap<ComentarioModificacionDto, Comentario>();

            // Raiting mappings (sistema de medallas)
            CreateMap<Models.Raiting, RaitingDto>()
                .ForMember(dest => dest.NombreUsuario,
                           opt => opt.MapFrom(src => src.Usuario != null ? src.Usuario.UserName : null));
            CreateMap<RaitingCreacionDto, Models.Raiting>();
            CreateMap<RaitingModificacionDto, Models.Raiting>();

            //Receta Mapping
            CreateMap<Receta, RecetaDto>()
                    .ForMember(dest => dest.CategoriaIds, opt => opt.MapFrom(src => src.Categorias.Select(c => c.Id)))
                    .ForMember(dest => dest.IngredienteIds, opt => opt.MapFrom(src => src.Ingredientes.Select(i => i.Id)));
            CreateMap<RecetaCreacionDto, Receta>();
            CreateMap<RecetaModificacionDto, Receta>();
        }
    }
}
