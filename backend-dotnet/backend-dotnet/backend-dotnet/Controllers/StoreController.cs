using backend_dotnet.Models;
using backend_dotnet.Repositories;
using backend_dotnet.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend_dotnet.Controllers;

[ApiController]
public class StoreController : ControllerBase
{
    private readonly IStoreRepository _storeRepository;
    private readonly IImageService _imageService;

    public StoreController(IStoreRepository storeRepository, IImageService imageService)
    {
        _storeRepository = storeRepository;
        _imageService = imageService;
    }

    [HttpGet("store")]
    public async Task<IActionResult> Show([FromQuery] string? id, [FromQuery(Name = "id_store")] string? storeId)
    {
        var targetId = !string.IsNullOrWhiteSpace(id) ? id : storeId;

        if (string.IsNullOrWhiteSpace(targetId))
        {
            return BadRequest(new { success = false, error = "Falta el parámetro id o id_store de la tienda." });
        }

        try
        {
            var store = await _storeRepository.FindByIdAsync(targetId);

            // Si no se encuentra por ID, intentar buscar por nombre
            if (store == null)
            {
                store = await _storeRepository.FindByNameAsync(targetId);
            }

            if (store == null)
            {
                return NotFound(new { success = false, error = $"Tienda con ID '{targetId}' no encontrada en la base de datos." });
            }

            return Ok(new { success = true, data = store });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = "Error al obtener la tienda: " + ex.Message });
        }
    }

    [HttpGet("stores")]
    public async Task<IActionResult> Index()
    {
        try
        {
            var stores = await _storeRepository.FindAllAsync();
            return Ok(new { success = true, data = stores });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = "Error al obtener las tiendas: " + ex.Message });
        }
    }

    [HttpPut("store")]
    [HttpPut("stores")]
    public async Task<IActionResult> Update([FromQuery] string? id, [FromQuery(Name = "id_store")] string? queryStoreId, [FromBody] UpdateStoreRequest input)
    {
        var targetId = !string.IsNullOrWhiteSpace(input.Id) 
            ? input.Id 
            : (!string.IsNullOrWhiteSpace(input.StoreId) 
                ? input.StoreId 
                : (!string.IsNullOrWhiteSpace(id) ? id : queryStoreId));

        if (string.IsNullOrWhiteSpace(targetId))
        {
            return BadRequest(new { success = false, error = "Falta el ID de la tienda a actualizar." });
        }

        try
        {
            var existing = await _storeRepository.FindByIdAsync(targetId);
            if (existing == null)
            {
                return NotFound(new { success = false, error = "Tienda no encontrada." });
            }

            if (!string.IsNullOrWhiteSpace(input.Store)) existing.StoreName = input.Store;
            if (input.DialingCode != null) existing.DialingCode = input.DialingCode;
            if (input.Cellphone != null) existing.Cellphone = input.Cellphone;

            if (!string.IsNullOrWhiteSpace(input.Image) && input.Image.StartsWith("data:image"))
            {
                var hostUrl = $"{Request.Scheme}://{Request.Host}";
                var logoResult = await _imageService.ProcessAndSaveImageAsync(input.Image, "logos", hostUrl);
                existing.Image = logoResult.Url;
                if (string.IsNullOrWhiteSpace(input.Colors) && logoResult.Colors != null)
                {
                    existing.Colors = logoResult.Colors;
                }
            }

            if (!string.IsNullOrWhiteSpace(input.Colors))
            {
                existing.Colors = input.Colors;
            }

            await _storeRepository.UpdateAsync(existing);

            return Ok(new
            {
                success = true,
                message = "Tienda actualizada exitosamente.",
                data = existing
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = "Error al actualizar la tienda: " + ex.Message });
        }
    }
}
