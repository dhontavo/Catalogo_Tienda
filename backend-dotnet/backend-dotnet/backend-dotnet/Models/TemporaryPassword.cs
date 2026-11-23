using System.Text.Json.Serialization;

namespace backend_dotnet.Models;

public class TemporaryPassword
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("id_user")]
    public string IdUser { get; set; } = string.Empty;

    [JsonPropertyName("pass")]
    public string Pass { get; set; } = string.Empty;

    [JsonPropertyName("exp")]
    public long Exp { get; set; }

    [JsonPropertyName("date")]
    public DateTime? Date { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }
}
