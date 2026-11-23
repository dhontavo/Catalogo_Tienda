using backend_dotnet.Models;
using backend_dotnet.Repositories;
using backend_dotnet.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend_dotnet.Controllers;

[ApiController]
public class ProductController : ControllerBase
{
    private readonly IProductRepository _productRepository;
    private readonly IImageService _imageService;

    public ProductController(IProductRepository productRepository, IImageService imageService)
    {
        _productRepository = productRepository;
        _imageService = imageService;
    }

    [HttpGet("products")]
    public async Task<IActionResult> Index([FromQuery] string? id, [FromQuery(Name = "id_store")] string? storeId, [FromQuery] int page = 1, [FromQuery] int limit = 10)
    {
        // Si viene un ID específico, buscamos solo ese producto
        if (!string.IsNullOrWhiteSpace(id))
        {
            try
            {
                var product = await _productRepository.FindByIdAsync(id);
                if (product == null)
                {
                    return NotFound(new { error = "Producto no encontrado", success = false });
                }

                // Incrementar vista
                _ = _productRepository.IncrementViewAsync(id);

                return Ok(new { data = product, success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, success = false });
            }
        }

        // Si no viene ID, debe venir id_store para listar
        if (string.IsNullOrWhiteSpace(storeId))
        {
            return BadRequest(new { error = "Falta el parámetro id_store o id.", success = false });
        }

        try
        {
            var p = page < 1 ? 1 : page;
            var l = limit < 1 ? 10 : limit;
            var offset = (p - 1) * l;

            var products = await _productRepository.FindByStoreIdAsync(storeId, l, offset);
            return Ok(new { data = products, success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al obtener los productos: " + ex.Message, success = false });
        }
    }

    [HttpPost("products")]
    public async Task<IActionResult> Store([FromBody] CreateProductRequest input)
    {
        if (string.IsNullOrWhiteSpace(input.StoreId)) return BadRequest(new { error = "El campo id_store es obligatorio." });
        if (string.IsNullOrWhiteSpace(input.Name)) return BadRequest(new { error = "El campo name es obligatorio." });
        if (string.IsNullOrWhiteSpace(input.Description)) return BadRequest(new { error = "El campo description es obligatorio." });
        if (!input.Price.HasValue) return BadRequest(new { error = "El campo price es obligatorio." });
        if (string.IsNullOrWhiteSpace(input.Image)) return BadRequest(new { error = "El campo image es obligatorio." });
        if (string.IsNullOrWhiteSpace(input.IdUser)) return BadRequest(new { error = "El campo id_user es obligatorio." });

        try
        {
            var hostUrl = $"{Request.Scheme}://{Request.Host}";
            var imageResult = await _imageService.ProcessAndSaveImageAsync(input.Image, "products", hostUrl);

            var newProduct = new Product
            {
                StoreId = input.StoreId,
                IdUser = input.IdUser,
                Name = input.Name,
                Description = input.Description,
                Price = input.Price.Value,
                ImageUrl = imageResult.Url ?? ""
            };

            var id = await _productRepository.SaveAsync(newProduct);
            newProduct.Id = id;

            return StatusCode(201, new { data = newProduct, success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al crear el producto: " + ex.Message, success = false });
        }
    }

    [HttpPut("products")]
    public async Task<IActionResult> Update([FromQuery] string? id, [FromBody] UpdateProductRequest input)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return BadRequest(new { error = "Falta el parámetro id." });
        }

        try
        {
            var existingProduct = await _productRepository.FindByIdAsync(id);
            if (existingProduct == null)
            {
                return NotFound(new { error = "Producto no encontrado.", success = false });
            }

            var imageUrl = existingProduct.ImageUrl;

            if (!string.IsNullOrWhiteSpace(input.Image) && input.Image.StartsWith("data:image"))
            {
                var hostUrl = $"{Request.Scheme}://{Request.Host}";
                var imageResult = await _imageService.ProcessAndSaveImageAsync(input.Image, "products", hostUrl);
                if (imageResult.Url != null)
                {
                    imageUrl = imageResult.Url;
                }
            }

            if (!string.IsNullOrWhiteSpace(input.Name)) existingProduct.Name = input.Name;
            if (!string.IsNullOrWhiteSpace(input.Description)) existingProduct.Description = input.Description;
            if (input.Price.HasValue) existingProduct.Price = input.Price.Value;
            existingProduct.ImageUrl = imageUrl;

            var updated = await _productRepository.UpdateAsync(existingProduct);
            return Ok(new { data = updated, success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al actualizar el producto: " + ex.Message, success = false });
        }
    }

    [HttpDelete("products")]
    public async Task<IActionResult> Delete([FromQuery] string? id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return BadRequest(new { error = "Falta el parámetro id." });
        }

        try
        {
            var success = await _productRepository.DeleteAsync(id);
            return Ok(new { data = success, success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al eliminar el producto: " + ex.Message, success = false });
        }
    }
}
