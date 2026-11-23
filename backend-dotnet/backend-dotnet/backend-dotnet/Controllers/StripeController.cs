using System.Text.Json;
using backend_dotnet.Models;
using backend_dotnet.Repositories;
using backend_dotnet.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend_dotnet.Controllers;

[ApiController]
public class StripeController : ControllerBase
{
    private readonly IStripeService _stripeService;
    private readonly IUserRepository _userRepository;
    private readonly IPlanRepository _planRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger<StripeController> _logger;

    public StripeController(
        IStripeService stripeService,
        IUserRepository userRepository,
        IPlanRepository planRepository,
        ISubscriptionRepository subscriptionRepository,
        IOrderRepository orderRepository,
        ILogger<StripeController> logger)
    {
        _stripeService = stripeService;
        _userRepository = userRepository;
        _planRepository = planRepository;
        _subscriptionRepository = subscriptionRepository;
        _orderRepository = orderRepository;
        _logger = logger;
    }

    [HttpGet("stripe/config")]
    public IActionResult GetConfig()
    {
        return Ok(new
        {
            success = true,
            data = new
            {
                publishableKey = _stripeService.GetPublishableKey(),
                currency = _stripeService.GetCurrency(),
                isConfigured = _stripeService.IsConfigured()
            }
        });
    }

    [HttpPost("stripe/create-checkout-session")]
    public async Task<IActionResult> CreateCheckoutSession([FromBody] StripeCheckoutRequest input)
    {
        var type = input.Type ?? "order";

        try
        {
            if (type == "plan")
            {
                if (string.IsNullOrWhiteSpace(input.UserId)) return BadRequest(new { error = "El campo 'userId' es obligatorio." });
                if (!input.PlanId.HasValue) return BadRequest(new { error = "El campo 'planId' es obligatorio." });
                if (string.IsNullOrWhiteSpace(input.PlanName)) return BadRequest(new { error = "El campo 'planName' es obligatorio." });
                if (!input.Price.HasValue) return BadRequest(new { error = "El campo 'price' es obligatorio." });

                var session = await _stripeService.CreatePlanCheckoutSessionAsync(input);
                return Ok(new { success = true, data = session });
            }

            if (type == "order")
            {
                if (string.IsNullOrWhiteSpace(input.StoreId)) return BadRequest(new { error = "El campo 'storeId' es obligatorio." });
                if (input.Items == null || input.Items.Count == 0) return BadRequest(new { error = "El campo 'items' es obligatorio." });

                var session = await _stripeService.CreateOrderCheckoutSessionAsync(input);
                return Ok(new { success = true, data = session });
            }

            return BadRequest(new { error = $"Tipo de checkout '{type}' no soportado." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear sesión de checkout");
            return StatusCode(500, new { success = false, error = "Error al crear la sesión de Stripe: " + ex.Message });
        }
    }

    [HttpGet("stripe/verify-session")]
    public async Task<IActionResult> VerifySession([FromQuery(Name = "session_id")] string? sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            return BadRequest(new { error = "Falta el parámetro session_id." });
        }

        try
        {
            var session = await _stripeService.RetrieveSessionAsync(sessionId);

            if (session.PaymentStatus != "paid")
            {
                return Ok(new
                {
                    success = false,
                    paid = false,
                    status = session.PaymentStatus,
                    message = "El pago no ha sido completado aún."
                });
            }

            var metadata = session.Metadata ?? new Dictionary<string, string>();
            metadata.TryGetValue("type", out var type);
            type ??= "unknown";

            // Si es actualización de Plan SaaS
            if (type == "plan" && metadata.TryGetValue("user_id", out var userId) && metadata.TryGetValue("plan_id", out var planIdStr))
            {
                if (int.TryParse(planIdStr, out var planId))
                {
                    var customerId = session.CustomerId;
                    var subId = session.SubscriptionId;

                    await FulfillPlanUpgradeAsync(userId, planId, sessionId, customerId, subId);

                    return Ok(new
                    {
                        success = true,
                        paid = true,
                        type = "plan",
                        message = "¡Plan mejorado y suscripción activada exitosamente!",
                        data = metadata
                    });
                }
            }

            // Si es pago de Carrito / Orden
            if (type == "order" && metadata.TryGetValue("store_id", out var storeId))
            {
                var createdOrders = new List<Order>();
                if (metadata.TryGetValue("products_json", out var productsJson) && !string.IsNullOrWhiteSpace(productsJson))
                {
                    try
                    {
                        var products = JsonSerializer.Deserialize<List<OrderItemRequest>>(productsJson);
                        if (products != null)
                        {
                            createdOrders = await FulfillStoreOrdersAsync(storeId, products);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error al deserializar productos de la orden en verificación");
                    }
                }

                return Ok(new
                {
                    success = true,
                    paid = true,
                    type = "order",
                    message = "¡Pago recibido exitosamente! Pedido registrado.",
                    orders = createdOrders,
                    data = metadata
                });
            }

            return Ok(new
            {
                success = true,
                paid = true,
                type = type,
                data = metadata
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = "Error al verificar la sesión de Stripe: " + ex.Message });
        }
    }

    [HttpGet("subscriptions")]
    public async Task<IActionResult> GetSubscriptions([FromQuery(Name = "id_user")] string? userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(new { error = "Falta el parámetro id_user." });
        }

        try
        {
            var subs = await _subscriptionRepository.GetByUserIdAsync(userId);
            return Ok(new { success = true, data = subs });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = "Error al obtener suscripciones: " + ex.Message });
        }
    }

    [HttpPost("stripe/webhook")]
    public async Task<IActionResult> Webhook()
    {
        string json;
        using (var reader = new StreamReader(HttpContext.Request.Body))
        {
            json = await reader.ReadToEndAsync();
        }

        var stripeSignature = Request.Headers["Stripe-Signature"].FirstOrDefault() ?? "";

        try
        {
            var stripeEvent = _stripeService.ConstructWebhookEvent(json, stripeSignature);

            if (stripeEvent.Type == "checkout.session.completed")
            {
                var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
                if (session != null && session.PaymentStatus == "paid" && session.Metadata != null)
                {
                    session.Metadata.TryGetValue("type", out var type);

                    if (type == "plan" && session.Metadata.TryGetValue("user_id", out var userId) && session.Metadata.TryGetValue("plan_id", out var planIdStr))
                    {
                        if (int.TryParse(planIdStr, out var planId))
                        {
                            await FulfillPlanUpgradeAsync(userId, planId, session.Id, session.CustomerId, session.SubscriptionId);
                        }
                    }
                    else if (type == "order" && session.Metadata.TryGetValue("store_id", out var storeId) && session.Metadata.TryGetValue("products_json", out var productsJson))
                    {
                        var products = JsonSerializer.Deserialize<List<OrderItemRequest>>(productsJson);
                        if (products != null)
                        {
                            await FulfillStoreOrdersAsync(storeId, products);
                        }
                    }
                }
            }

            return Ok(new { received = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en webhook de Stripe");
            return BadRequest(new { error = "Webhook error: " + ex.Message });
        }
    }

    private async Task FulfillPlanUpgradeAsync(string userId, int planId, string? sessionId, string? customerId, string? subscriptionId)
    {
        var user = await _userRepository.FindByIdAsync(userId);
        if (user != null)
        {
            user.IdPlan = planId;
            await _userRepository.UpdateAsync(user);

            try
            {
                var plan = await _planRepository.FindByIdAsync(planId);
                var planPrice = plan?.Price ?? 0m;

                await _subscriptionRepository.DeactivateActiveSubscriptionsAsync(userId);

                var sub = new Subscription
                {
                    IdUser = userId,
                    IdPlan = planId,
                    IdStore = user.IdStore,
                    StripeCustomerId = customerId,
                    StripeSubscriptionId = subscriptionId,
                    StripeSessionId = sessionId,
                    Status = "active",
                    Price = planPrice,
                    Currency = _stripeService.GetCurrency(),
                    Interval = "month"
                };

                await _subscriptionRepository.SaveAsync(sub);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar suscripción en fulfillment");
            }
        }
    }

    private async Task<List<Order>> FulfillStoreOrdersAsync(string storeId, List<OrderItemRequest> products)
    {
        var created = new List<Order>();
        foreach (var p in products)
        {
            var pid = p.ProductId ?? p.Id;
            if (!string.IsNullOrWhiteSpace(pid))
            {
                var qty = Math.Max(1, p.Quantity ?? 1);
                for (int i = 0; i < qty; i++)
                {
                    var order = new Order
                    {
                        StoreId = storeId,
                        ProductId = pid,
                        CreateAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                    };
                    order.Id = await _orderRepository.SaveAsync(order);
                    created.Add(order);
                }
            }
        }
        return created;
    }
}
