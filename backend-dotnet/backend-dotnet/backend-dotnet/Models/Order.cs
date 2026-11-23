using System.Text.Json.Serialization;

namespace backend_dotnet.Models;

public class ProductDetails
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("price")]
    public decimal Price { get; set; }

    [JsonPropertyName("image")]
    public string? Image { get; set; }
}

public class Order
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("id_store")]
    public string StoreId { get; set; } = string.Empty;

    [JsonPropertyName("id_product")]
    public string ProductId { get; set; } = string.Empty;

    [JsonPropertyName("create_at")]
    public string CreateAt { get; set; } = string.Empty;

    [JsonPropertyName("product")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public ProductDetails? Product { get; set; }
}
