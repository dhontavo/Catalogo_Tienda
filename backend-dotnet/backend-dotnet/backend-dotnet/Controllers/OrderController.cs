using backend_dotnet.Models;
using backend_dotnet.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace backend_dotnet.Controllers;

[ApiController]
public class OrderController : ControllerBase
{
    private readonly IOrderRepository _orderRepository;

    public OrderController(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    [HttpPost("orders")]
    public async Task<IActionResult> Order([FromBody] OrderCreateRequest input)
    {
        if (string.IsNullOrWhiteSpace(input.StoreId))
        {
            return BadRequest(new { error = "El campo 'id_store' es obligatorio." });
        }

        // Si se envió un arreglo de productos (ej. desde el carrito de compras)
        if (input.Products != null && input.Products.Count > 0)
        {
            try
            {
                var created = new List<Order>();
                foreach (var prod in input.Products)
                {
                    var pid = prod.ProductId ?? prod.Id;
                    if (!string.IsNullOrWhiteSpace(pid))
                    {
                        var qty = Math.Max(1, prod.Quantity ?? 1);
                        for (int i = 0; i < qty; i++)
                        {
                            var order = new Order
                            {
                                StoreId = input.StoreId,
                                ProductId = pid,
                                CreateAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                            };
                            var orderId = await _orderRepository.SaveAsync(order);
                            order.Id = orderId;
                            created.Add(order);
                        }
                    }
                }

                return Ok(new
                {
                    success = true,
                    message = "Órdenes creadas exitosamente.",
                    data = created
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al crear las órdenes: " + ex.Message });
            }
        }

        // Si se envió un único id_product
        if (string.IsNullOrWhiteSpace(input.ProductId))
        {
            return BadRequest(new { error = "El campo 'id_product' o 'products' es obligatorio." });
        }

        try
        {
            var singleOrder = new Order
            {
                StoreId = input.StoreId,
                ProductId = input.ProductId,
                CreateAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };

            var id = await _orderRepository.SaveAsync(singleOrder);
            singleOrder.Id = id;

            return Ok(new
            {
                success = true,
                message = "Orden creada exitosamente.",
                data = singleOrder
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al crear la orden: " + ex.Message });
        }
    }

    [HttpGet("orders")]
    public async Task<IActionResult> Index([FromQuery(Name = "id_store")] string? storeId)
    {
        if (string.IsNullOrWhiteSpace(storeId))
        {
            return BadRequest(new { success = false, error = "Falta el parámetro id_store de la tienda." });
        }

        try
        {
            var orders = await _orderRepository.GetByStoreIdAsync(storeId);
            return Ok(new { success = true, data = orders });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = "Error al obtener las órdenes: " + ex.Message });
        }
    }
}
