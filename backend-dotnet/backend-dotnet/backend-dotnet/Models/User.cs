using System.Text.Json.Serialization;

namespace backend_dotnet.Models;

public class User
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("lastname")]
    public string Lastname { get; set; } = string.Empty;

    [JsonPropertyName("birthday")]
    public string? Birthday { get; set; }

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;

    [JsonPropertyName("id_store")]
    public string? IdStore { get; set; }

    [JsonPropertyName("id_plan")]
    public int IdPlan { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }

    [JsonPropertyName("update_at")]
    public DateTime? UpdateAt { get; set; }

    // Campos unidos de store para compatibilidad con AuthController de PHP
    [JsonPropertyName("store")]
    public string? Store { get; set; }

    [JsonPropertyName("dialing_code")]
    public string? DialingCode { get; set; }

    [JsonPropertyName("cellphone")]
    public string? Cellphone { get; set; }

    [JsonPropertyName("image")]
    public string? Image { get; set; }

    [JsonPropertyName("colors")]
    public string? Colors { get; set; }
}
