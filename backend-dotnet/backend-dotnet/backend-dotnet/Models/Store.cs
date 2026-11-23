using System.Text.Json.Serialization;

namespace backend_dotnet.Models;

public class Store
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("store")]
    public string StoreName { get; set; } = string.Empty;

    [JsonPropertyName("dialing_code")]
    public string? DialingCode { get; set; }

    [JsonPropertyName("cellphone")]
    public string? Cellphone { get; set; }

    [JsonPropertyName("image")]
    public string? Image { get; set; }

    [JsonPropertyName("colors")]
    public string? Colors { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }
}
