using System.Text.Json;

namespace backend_dotnet.Middleware;

public class ApiKeyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string _configuredApiKey;

    public ApiKeyMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _configuredApiKey = configuration["Security:ApiKey"] 
            ?? Environment.GetEnvironmentVariable("API_KEY") 
            ?? "tu_api_key_aqui";
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // 1. Responder preflights OPTIONS inmediatamente con 204
        if (HttpMethods.IsOptions(context.Request.Method))
        {
            context.Response.StatusCode = StatusCodes.Status204NoContent;
            return;
        }

        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";

        // 2. Omitir validación de API Key en el webhook de Stripe y en archivos estáticos /uploads
        if (path == "/stripe/webhook" || path.StartsWith("/uploads/"))
        {
            await _next(context);
            return;
        }

        // 3. Extraer header X-API-Key o query param api_key
        string? providedKey = null;
        if (context.Request.Headers.TryGetValue("X-API-Key", out var headerVal))
        {
            providedKey = headerVal.FirstOrDefault();
        }
        else if (context.Request.Query.TryGetValue("api_key", out var queryVal))
        {
            providedKey = queryVal.FirstOrDefault();
        }

        // 4. Validar
        if (string.IsNullOrEmpty(providedKey) || !string.Equals(providedKey, _configuredApiKey, StringComparison.Ordinal))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json; charset=utf-8";

            var responseObj = new { error = "API Key inválida o no proporcionada." };
            await context.Response.WriteAsync(JsonSerializer.Serialize(responseObj));
            return;
        }

        await _next(context);
    }
}
