using System.Text.Json.Serialization;

namespace backend_dotnet.Models;

public class Product
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("id_store")]
    public string StoreId { get; set; } = string.Empty;

    [JsonPropertyName("id_user")]
    public string? IdUser { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("price")]
    public decimal Price { get; set; }

    [JsonPropertyName("image")]
    public string? ImageUrl { get; set; }

    [JsonPropertyName("view")]
    public int View { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }
}
