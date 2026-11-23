using System.Text.Json.Serialization;

namespace backend_dotnet.Models;

public class Plan
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("plan")]
    public string? PlanName { get; set; }

    [JsonPropertyName("advertisement")]
    public string? Advertisement { get; set; }

    [JsonPropertyName("max_product")]
    public int? MaxProduct { get; set; }

    [JsonPropertyName("add_user")]
    public string? AddUser { get; set; }

    [JsonPropertyName("max_adduser")]
    public int? MaxAddUser { get; set; }

    [JsonPropertyName("price")]
    public decimal? Price { get; set; }
}
