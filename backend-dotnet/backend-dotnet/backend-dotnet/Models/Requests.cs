using System.Text.Json.Serialization;

namespace backend_dotnet.Models;

public class RegisterRequest
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("lastname")]
    public string? Lastname { get; set; }

    [JsonPropertyName("birthday")]
    public string? Birthday { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("password")]
    public string? Password { get; set; }

    [JsonPropertyName("id_store")]
    public string? IdStore { get; set; }

    [JsonPropertyName("id_plan")]
    public int? IdPlan { get; set; }

    [JsonPropertyName("store")]
    public string? Store { get; set; }

    [JsonPropertyName("dialing_code")]
    public string? DialingCode { get; set; }

    [JsonPropertyName("cellphone")]
    public string? Cellphone { get; set; }

    [JsonPropertyName("image")]
    public string? Image { get; set; }
}

public class LoginRequest
{
    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("password")]
    public string? Password { get; set; }
}

public class ForgotPasswordRequest
{
    [JsonPropertyName("email")]
    public string? Email { get; set; }
}

public class ChangePasswordRequest
{
    [JsonPropertyName("user_id")]
    public string? UserId { get; set; }

    [JsonPropertyName("password")]
    public string? Password { get; set; }
}

public class UpdateProfileRequest
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("lastname")]
    public string? Lastname { get; set; }

    [JsonPropertyName("birthday")]
    public string? Birthday { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("id_plan")]
    public int? IdPlan { get; set; }

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

public class CreateProductRequest
{
    [JsonPropertyName("id_store")]
    public string? StoreId { get; set; }

    [JsonPropertyName("id_user")]
    public string? IdUser { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("price")]
    public decimal? Price { get; set; }

    [JsonPropertyName("image")]
    public string? Image { get; set; }
}

public class UpdateProductRequest
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("price")]
    public decimal? Price { get; set; }

    [JsonPropertyName("image")]
    public string? Image { get; set; }
}

public class UpdateStoreRequest
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("id_store")]
    public string? StoreId { get; set; }

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

public class OrderItemRequest
{
    [JsonPropertyName("id_product")]
    public string? ProductId { get; set; }

    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("price")]
    public decimal? Price { get; set; }

    [JsonPropertyName("quantity")]
    public int? Quantity { get; set; }

    [JsonPropertyName("image")]
    public string? Image { get; set; }
}

public class OrderCreateRequest
{
    [JsonPropertyName("id_store")]
    public string? StoreId { get; set; }

    [JsonPropertyName("id_product")]
    public string? ProductId { get; set; }

    [JsonPropertyName("products")]
    public List<OrderItemRequest>? Products { get; set; }
}

public class StripeCheckoutRequest
{
    [JsonPropertyName("type")]
    public string? Type { get; set; } // "plan" o "order"

    // Parámetros de plan
    [JsonPropertyName("userId")]
    public string? UserId { get; set; }

    [JsonPropertyName("userEmail")]
    public string? UserEmail { get; set; }

    [JsonPropertyName("planId")]
    public int? PlanId { get; set; }

    [JsonPropertyName("planName")]
    public string? PlanName { get; set; }

    [JsonPropertyName("price")]
    public decimal? Price { get; set; }

    // Parámetros de orden
    [JsonPropertyName("storeId")]
    public string? StoreId { get; set; }

    [JsonPropertyName("storeName")]
    public string? StoreName { get; set; }

    [JsonPropertyName("items")]
    public List<OrderItemRequest>? Items { get; set; }

    [JsonPropertyName("customerEmail")]
    public string? CustomerEmail { get; set; }

    // URLs comunes
    [JsonPropertyName("successUrl")]
    public string? SuccessUrl { get; set; }

    [JsonPropertyName("cancelUrl")]
    public string? CancelUrl { get; set; }
}
