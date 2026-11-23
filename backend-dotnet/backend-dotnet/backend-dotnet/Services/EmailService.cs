using backend_dotnet.Repositories;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace backend_dotnet.Services;

public interface IEmailService
{
    Task<bool> SendTemporaryPasswordEmailAsync(string recipientEmail, string recipientName, string tempPassword);
}

public class EmailService : IEmailService
{
    private readonly IConfigRepository _configRepository;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IConfigRepository configRepository,
        IConfiguration configuration,
        IWebHostEnvironment env,
        ILogger<EmailService> logger)
    {
        _configRepository = configRepository;
        _configuration = configuration;
        _env = env;
        _logger = logger;
    }

    public async Task<bool> SendTemporaryPasswordEmailAsync(string recipientEmail, string recipientName, string tempPassword)
    {
        try
        {
            var config = await _configRepository.GetAsync();

            var storeName = !string.IsNullOrWhiteSpace(config.Name) ? config.Name : "ShoppyCatalog";
            var logo = !string.IsNullOrWhiteSpace(config.Logo) ? config.Logo : "https://shoppycatalog.com/assets/icon/favicon.png";
            var fromEmail = !string.IsNullOrWhiteSpace(config.Email) ? config.Email : (_configuration["Smtp:FromEmail"] ?? "no-reply@shoppycatalog.com");
            var fromName = storeName;
            var smtpHost = _configuration["Smtp:Host"] ?? (string.IsNullOrWhiteSpace(config.Host) ? "localhost" : config.Host);
            var smtpPort = config.Port ?? int.Parse(_configuration["Smtp:Port"] ?? "587");
            var smtpPassword = !string.IsNullOrWhiteSpace(config.Password) ? config.Password : (_configuration["Smtp:Password"] ?? "");

            // Detección automática del host si es localhost y hay dominio en fromEmail
            if (smtpHost == "localhost" && !string.IsNullOrWhiteSpace(fromEmail) && fromEmail.Contains('@'))
            {
                var domain = fromEmail.Split('@')[1].ToLowerInvariant();
                if (domain == "gmail.com") smtpHost = "smtp.gmail.com";
                else if (domain == "hotmail.com" || domain == "outlook.com" || domain == "live.com") smtpHost = "smtp.office365.com";
                else if (domain == "yahoo.com") smtpHost = "smtp.mail.yahoo.com";
            }

            // Cargar template
            var templatePath = Path.Combine(_env.ContentRootPath, "Templates", "email_temp_password.html");
            string htmlContent;

            if (File.Exists(templatePath))
            {
                htmlContent = await File.ReadAllTextAsync(templatePath);
            }
            else
            {
                htmlContent = $@"
                    <!DOCTYPE html>
                    <html>
                    <body style='font-family: sans-serif; text-align: center; padding: 40px;'>
                        <img src='{logo}' style='width: 80px; height: 80px; border-radius: 15px;'>
                        <h2>Recuperación de Contraseña - {storeName}</h2>
                        <p>Hola <strong>{recipientName}</strong>,</p>
                        <p>Tu contraseña temporal es: <strong style='font-size: 20px; background: #eee; padding: 5px 10px; border-radius: 5px;'>{tempPassword}</strong></p>
                        <p>Por favor cámbiala al iniciar sesión.</p>
                    </body>
                    </html>";
            }

            var domainUrl = "http://localhost/Catalogo_Tienda/catalog-web/";
            var loginUrl = "http://localhost/Catalogo_Tienda/catalog-web/login";

            htmlContent = htmlContent.Replace("{{name}}", recipientName);
            htmlContent = htmlContent.Replace("{{password}}", tempPassword);
            htmlContent = htmlContent.Replace("{{logo}}", logo);
            htmlContent = htmlContent.Replace("{{domain}}", domainUrl);
            htmlContent = htmlContent.Replace("{{login_url}}", loginUrl);

            if (storeName != "ShoppyCatalog")
            {
                htmlContent = htmlContent.Replace("ShoppyCatalog", storeName);
                htmlContent = htmlContent.Replace("Shoppy<span>Catalog</span>", storeName);
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress(recipientName, recipientEmail));
            message.Subject = $"Recuperación de contraseña - {fromName}";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlContent,
                TextBody = $"Hola {recipientName}, tu contraseña temporal es: {tempPassword}. Por favor cámbiala al iniciar sesión."
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            // Aceptar todos los certificados en localhost para emular el comportamiento PHP
            client.ServerCertificateValidationCallback = (s, c, h, e) => true;

            var secureSocketOptions = smtpPort == 465 
                ? SecureSocketOptions.SslOnConnect 
                : SecureSocketOptions.StartTlsWhenAvailable;

            await client.ConnectAsync(smtpHost, smtpPort, secureSocketOptions);

            if (!string.IsNullOrEmpty(smtpPassword))
            {
                await client.AuthenticateAsync(fromEmail, smtpPassword);
            }

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al enviar correo con MailKit");
            return false;
        }
    }
}
