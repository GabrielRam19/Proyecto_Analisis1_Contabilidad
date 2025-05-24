
using ContabilidadAPIV2.Controllers;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

public static class Startup
{
    public static WebApplication InicializaApp(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        ConfigureService(builder);

        // Cadena de conexión para MySQL
        var stringConexion = "Server=localhost;Database=DB_CONTABILIDAD;User=root;Password=1234;";

        // Configurar el DbContext para MySQL usando Pomelo
        builder.Services.AddDbContext<ContabilidadContext>(options =>
            options.UseMySql(
                stringConexion,
                new MySqlServerVersion(new Version(8, 0, 36)) // Cambia esta versión según la que tengas instalada
            )
        );

        var app = builder.Build();
        Configure(app);

        return app;
    }

    private static void ConfigureService(WebApplicationBuilder builder)
    {
        builder.Services.AddControllers().AddJsonOptions(x =>
                x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

        builder.Services.AddCors(o =>
        {
            o.AddPolicy("CorsPolicy", builder =>
             builder.WithOrigins("http://localhost:3000")
                   .AllowAnyMethod()
                   .AllowAnyHeader()
            );
        });

        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();


    }

    private static void Configure(WebApplication app)
    {

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseCors("CorsPolicy");
        app.UseAuthorization();

        app.MapControllers();
    }


}
