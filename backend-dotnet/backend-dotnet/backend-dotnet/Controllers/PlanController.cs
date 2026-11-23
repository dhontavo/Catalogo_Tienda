using backend_dotnet.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace backend_dotnet.Controllers;

[ApiController]
public class PlanController : ControllerBase
{
    private readonly IPlanRepository _planRepository;

    public PlanController(IPlanRepository planRepository)
    {
        _planRepository = planRepository;
    }

    [HttpGet("plans")]
    public async Task<IActionResult> Index()
    {
        try
        {
            var plans = await _planRepository.FindAllAsync();
            return Ok(new { success = true, data = plans });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = "Error al obtener los planes: " + ex.Message });
        }
    }
}
