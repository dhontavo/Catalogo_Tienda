using System.Text.Json.Serialization;

namespace backend_dotnet.Models;

public class Config
{
    [JsonPropertyName("id")]
    public int? Id { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; } = "ShoppyCatalog";

    [JsonPropertyName("email")]
    public string? Email { get; set; } = "admin@shoppycatalog.com";

    [JsonPropertyName("password")]
    public string? Password { get; set; } = "";

    [JsonPropertyName("port")]
    public int? Port { get; set; } = 587;

    [JsonPropertyName("api_whatsapp")]
    public string? ApiWhatsapp { get; set; } = "";

    [JsonPropertyName("logo")]
    public string? Logo { get; set; } = "";

    [JsonPropertyName("logo_path")]
    public string? LogoPath { get; set; } = "uploads/logos/";

    [JsonPropertyName("product_path")]
    public string? ProductPath { get; set; } = "uploads/products/";

    [JsonPropertyName("host")]
    public string? Host { get; set; } = "";
}
