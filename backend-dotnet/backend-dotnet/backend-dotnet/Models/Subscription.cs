using System.Text.Json.Serialization;

namespace backend_dotnet.Models;

public class Subscription
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("id_user")]
    public string IdUser { get; set; } = string.Empty;

    [JsonPropertyName("id_plan")]
    public int IdPlan { get; set; }

    [JsonPropertyName("id_store")]
    public string? IdStore { get; set; }

    [JsonPropertyName("stripe_customer_id")]
    public string? StripeCustomerId { get; set; }

    [JsonPropertyName("stripe_subscription_id")]
    public string? StripeSubscriptionId { get; set; }

    [JsonPropertyName("stripe_session_id")]
    public string? StripeSessionId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "active";

    [JsonPropertyName("price")]
    public decimal Price { get; set; }

    [JsonPropertyName("currency")]
    public string Currency { get; set; } = "mxn";

    [JsonPropertyName("interval")]
    public string Interval { get; set; } = "month";

    [JsonPropertyName("current_period_start")]
    public DateTime? CurrentPeriodStart { get; set; }

    [JsonPropertyName("current_period_end")]
    public DateTime? CurrentPeriodEnd { get; set; }

    [JsonPropertyName("cancel_at_period_end")]
    public bool CancelAtPeriodEnd { get; set; }

    [JsonPropertyName("canceled_at")]
    public DateTime? CanceledAt { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Campos unidos del plan
    [JsonPropertyName("plan_name")]
    public string? PlanName { get; set; }

    [JsonPropertyName("max_product")]
    public int? MaxProduct { get; set; }

    [JsonPropertyName("advertisement")]
    public string? Advertisement { get; set; }
}
