using backend_dotnet.Models;
using Stripe;
using Stripe.Checkout;

namespace backend_dotnet.Services;

public record CheckoutSessionResult(string Id, string Url);

public interface IStripeService
{
    bool IsConfigured();
    string GetPublishableKey();
    string GetCurrency();
    Task<CheckoutSessionResult> CreatePlanCheckoutSessionAsync(StripeCheckoutRequest request);
    Task<CheckoutSessionResult> CreateOrderCheckoutSessionAsync(StripeCheckoutRequest request);
    Task<Session> RetrieveSessionAsync(string sessionId);
    Event ConstructWebhookEvent(string json, string stripeSignature);
}

public class StripeService : IStripeService
{
    private readonly string _secretKey;
    private readonly string _publishableKey;
    private readonly string _webhookSecret;
    private readonly string _currency;

    public StripeService(IConfiguration configuration)
    {
        _secretKey = configuration["Stripe:SecretKey"] 
            ?? Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY") ?? "";
        _publishableKey = configuration["Stripe:PublishableKey"] 
            ?? Environment.GetEnvironmentVariable("STRIPE_PUBLISHABLE_KEY") ?? "";
        _webhookSecret = configuration["Stripe:WebhookSecret"] 
            ?? Environment.GetEnvironmentVariable("STRIPE_WEBHOOK_SECRET") ?? "";
        _currency = (configuration["Stripe:Currency"] 
            ?? Environment.GetEnvironmentVariable("STRIPE_CURRENCY") ?? "mxn").ToLowerInvariant();

        if (IsConfigured())
        {
            StripeConfiguration.ApiKey = _secretKey;
        }
    }

    public bool IsConfigured()
    {
        return !string.IsNullOrWhiteSpace(_secretKey) && !_secretKey.Contains("PLACEHOLDER") && !_secretKey.Contains("tu_clave");
    }

    public string GetPublishableKey() => _publishableKey;

    public string GetCurrency() => _currency;

    public async Task<CheckoutSessionResult> CreatePlanCheckoutSessionAsync(StripeCheckoutRequest request)
    {
        if (!IsConfigured())
        {
            throw new InvalidOperationException("Stripe no está configurado en el servidor.");
        }

        var price = request.Price ?? 0m;
        if (price <= 0)
        {
            throw new ArgumentException("El precio del plan debe ser mayor a 0 para procesar pago con Stripe.");
        }

        long unitAmount = (long)Math.Round(price * 100);

        var options = new SessionCreateOptions
        {
            Mode = "payment",
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = _currency,
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = $"Suscripción ShoppyCatalog: {request.PlanName ?? "Plan"}",
                            Description = "Activación de plan para tu catálogo digital en ShoppyCatalog."
                        },
                        UnitAmount = unitAmount
                    },
                    Quantity = 1
                }
            },
            Metadata = new Dictionary<string, string>
            {
                { "type", "plan" },
                { "user_id", request.UserId ?? "" },
                { "plan_id", request.PlanId?.ToString() ?? "0" },
                { "plan_name", request.PlanName ?? "Plan" }
            },
            SuccessUrl = request.SuccessUrl ?? "http://localhost/Catalogo_Tienda/catalog-web/admin?tab=plan&session_id={CHECKOUT_SESSION_ID}&plan_upgraded=true",
            CancelUrl = request.CancelUrl ?? "http://localhost/Catalogo_Tienda/catalog-web/admin?tab=plan&canceled=true"
        };

        if (!string.IsNullOrWhiteSpace(request.UserEmail))
        {
            options.CustomerEmail = request.UserEmail;
        }

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        return new CheckoutSessionResult(session.Id, session.Url);
    }

    public async Task<CheckoutSessionResult> CreateOrderCheckoutSessionAsync(StripeCheckoutRequest request)
    {
        if (!IsConfigured())
        {
            throw new InvalidOperationException("Stripe no está configurado en el servidor.");
        }

        if (request.Items == null || request.Items.Count == 0)
        {
            throw new ArgumentException("Debes incluir al menos un producto para pagar con Stripe.");
        }

        var lineItems = new List<SessionLineItemOptions>();
        var productSummary = new List<object>();

        foreach (var item in request.Items)
        {
            var name = item.Name ?? "Producto";
            var price = item.Price ?? 0m;
            var qty = Math.Max(1, item.Quantity ?? 1);
            long unitAmount = (long)Math.Round(price * 100);

            var productData = new SessionLineItemPriceDataProductDataOptions
            {
                Name = name
            };

            if (!string.IsNullOrWhiteSpace(item.Image) && Uri.TryCreate(item.Image, UriKind.Absolute, out _))
            {
                productData.Images = new List<string> { item.Image };
            }

            lineItems.Add(new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = _currency,
                    ProductData = productData,
                    UnitAmount = unitAmount
                },
                Quantity = qty
            });

            productSummary.Add(new
            {
                id_product = item.ProductId ?? item.Id ?? "",
                name = name,
                price = price,
                quantity = qty
            });
        }

        var storeId = request.StoreId ?? "";
        var storeName = request.StoreName ?? "Catálogo";

        var options = new SessionCreateOptions
        {
            Mode = "payment",
            LineItems = lineItems,
            Metadata = new Dictionary<string, string>
            {
                { "type", "order" },
                { "store_id", storeId },
                { "store_name", storeName },
                { "products_json", System.Text.Json.JsonSerializer.Serialize(productSummary) }
            },
            SuccessUrl = request.SuccessUrl ?? $"http://localhost/Catalogo_Tienda/catalog-web/store/{storeId}?payment_status=success&session_id={{CHECKOUT_SESSION_ID}}",
            CancelUrl = request.CancelUrl ?? $"http://localhost/Catalogo_Tienda/catalog-web/store/{storeId}?payment_status=canceled"
        };

        if (!string.IsNullOrWhiteSpace(request.CustomerEmail))
        {
            options.CustomerEmail = request.CustomerEmail;
        }

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        return new CheckoutSessionResult(session.Id, session.Url);
    }

    public async Task<Session> RetrieveSessionAsync(string sessionId)
    {
        if (!IsConfigured())
        {
            throw new InvalidOperationException("Stripe no está configurado en el servidor.");
        }

        var service = new SessionService();
        return await service.GetAsync(sessionId);
    }

    public Event ConstructWebhookEvent(string json, string stripeSignature)
    {
        if (string.IsNullOrWhiteSpace(_webhookSecret) || _webhookSecret.Contains("PLACEHOLDER"))
        {
            throw new InvalidOperationException("STRIPE_WEBHOOK_SECRET no está configurado.");
        }

        return EventUtility.ConstructEvent(json, stripeSignature, _webhookSecret);
    }
}
