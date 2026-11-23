using backend_dotnet.Data;
using backend_dotnet.Middleware;
using backend_dotnet.Repositories;
using backend_dotnet.Services;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar Servicios y Controladores
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Mantiene compatibilidad con nombres exactos si es requerido
    });

builder.Services.AddEndpointsApiExplorer();

// 2. Configuración de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 3. Inyección de Dependencias
// Base de Datos
builder.Services.AddSingleton<IDatabaseConnectionFactory, DatabaseConnectionFactory>();

// Repositorios
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IStoreRepository, StoreRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IPlanRepository, PlanRepository>();
builder.Services.AddScoped<IConfigRepository, ConfigRepository>();
builder.Services.AddScoped<ITemporaryPasswordRepository, TemporaryPasswordRepository>();
builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();

// Servicios de Infraestructura
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IStripeService, StripeService>();

var app = builder.Build();

// Soporte para clientes con prefijo legacy /Catalogo_Tienda/backend/public
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value;
    if (!string.IsNullOrEmpty(path) && path.StartsWith("/Catalogo_Tienda/backend/public", StringComparison.OrdinalIgnoreCase))
    {
        var newPath = path.Substring("/Catalogo_Tienda/backend/public".Length);
        context.Request.Path = string.IsNullOrEmpty(newPath) ? "/" : newPath;
    }
    await next();
});

// 4. Configuración del Pipeline HTTP
app.UseCors("AllowAll");

// Servir archivos estáticos (uploads: logos, productos)
var uploadsPath = Path.Combine(app.Environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(); // Para servir wwwroot

// También mapear /uploads explícitamente si se solicita directamente
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// Middleware de Seguridad (Validación de API Key excepto webhook y preflight)
app.UseMiddleware<ApiKeyMiddleware>();

app.MapControllers();

app.Run();
