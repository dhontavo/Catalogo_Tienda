using backend_dotnet.Models;
using backend_dotnet.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace backend_dotnet.Controllers;

[ApiController]
public class ConfigController : ControllerBase
{
    private readonly IConfigRepository _configRepository;

    public ConfigController(IConfigRepository configRepository)
    {
        _configRepository = configRepository;
    }

    [HttpGet("config")]
    public async Task<IActionResult> Show()
    {
        try
        {
            var config = await _configRepository.GetAsync();
            return Ok(new { success = true, data = config });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = "Error al obtener la configuración: " + ex.Message });
        }
    }

    [HttpPut("config")]
    public async Task<IActionResult> Update([FromBody] Config input)
    {
        try
        {
            var current = await _configRepository.GetAsync();

            if (!string.IsNullOrWhiteSpace(input.Name)) current.Name = input.Name;
            if (!string.IsNullOrWhiteSpace(input.Email)) current.Email = input.Email;
            if (input.Password != null) current.Password = input.Password;
            if (input.Port.HasValue) current.Port = input.Port;
            if (input.ApiWhatsapp != null) current.ApiWhatsapp = input.ApiWhatsapp;
            if (input.Logo != null) current.Logo = input.Logo;
            if (!string.IsNullOrWhiteSpace(input.LogoPath)) current.LogoPath = input.LogoPath;
            if (!string.IsNullOrWhiteSpace(input.ProductPath)) current.ProductPath = input.ProductPath;
            if (input.Host != null) current.Host = input.Host;

            await _configRepository.UpdateAsync(current);

            return Ok(new
            {
                success = true,
                message = "Configuración actualizada correctamente.",
                data = current
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = "Error al actualizar la configuración: " + ex.Message });
        }
    }
}
