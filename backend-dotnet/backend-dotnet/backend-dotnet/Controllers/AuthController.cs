using backend_dotnet.Models;
using backend_dotnet.Repositories;
using backend_dotnet.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend_dotnet.Controllers;

[ApiController]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IStoreRepository _storeRepository;
    private readonly ITemporaryPasswordRepository _tempPasswordRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;
    private readonly IImageService _imageService;
    private readonly IEmailService _emailService;

    public AuthController(
        IUserRepository userRepository,
        IStoreRepository storeRepository,
        ITemporaryPasswordRepository tempPasswordRepository,
        IPasswordHasher passwordHasher,
        IJwtService jwtService,
        IImageService imageService,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _storeRepository = storeRepository;
        _tempPasswordRepository = tempPasswordRepository;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _imageService = imageService;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest input)
    {
        if (string.IsNullOrWhiteSpace(input.Name)) return BadRequest(new { error = "El campo 'name' es obligatorio." });
        if (string.IsNullOrWhiteSpace(input.Lastname)) return BadRequest(new { error = "El campo 'lastname' es obligatorio." });
        if (string.IsNullOrWhiteSpace(input.Birthday)) return BadRequest(new { error = "El campo 'birthday' es obligatorio." });
        if (string.IsNullOrWhiteSpace(input.Email)) return BadRequest(new { error = "El campo 'email' es obligatorio." });
        if (string.IsNullOrWhiteSpace(input.Username)) return BadRequest(new { error = "El campo 'username' es obligatorio." });
        if (string.IsNullOrWhiteSpace(input.Password)) return BadRequest(new { error = "El campo 'password' es obligatorio." });

        if (!_passwordHasher.ValidatePasswordStrength(input.Password))
        {
            return BadRequest(new
            {
                error = "La contraseña no cumple con los requisitos mínimos: al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo."
            });
        }

        try
        {
            var existingUser = await _userRepository.FindByUsernameAsync(input.Username);
            if (existingUser != null)
            {
                return UnprocessableEntity(new { error = "El nombre de usuario ya está en uso." });
            }

            var storeId = input.IdStore;

            // Si no hay id_store, registramos una nueva tienda
            if (string.IsNullOrWhiteSpace(storeId))
            {
                if (string.IsNullOrWhiteSpace(input.Store))
                {
                    return BadRequest(new { error = "El campo 'store' (nombre de la tienda) es obligatorio si no se proporciona 'id_store'." });
                }

                var existingStore = await _storeRepository.FindByNameAsync(input.Store);
                if (existingStore != null)
                {
                    return UnprocessableEntity(new { error = "Ya existe una tienda con ese nombre." });
                }

                string? logoUrl = null;
                string? colors = null;

                if (!string.IsNullOrWhiteSpace(input.Image))
                {
                    var hostUrl = $"{Request.Scheme}://{Request.Host}";
                    var logoResult = await _imageService.ProcessAndSaveImageAsync(input.Image, "logos", hostUrl);
                    logoUrl = logoResult.Url;
                    colors = logoResult.Colors;
                }

                var newStore = new Store
                {
                    StoreName = input.Store,
                    DialingCode = input.DialingCode ?? "+52",
                    Cellphone = input.Cellphone,
                    Image = logoUrl,
                    Colors = colors
                };

                storeId = await _storeRepository.SaveAsync(newStore);
            }

            var hashedPassword = _passwordHasher.HashPassword(input.Password);
            var newUser = new User
            {
                Name = input.Name,
                Lastname = input.Lastname,
                Birthday = input.Birthday,
                Email = input.Email,
                Username = input.Username,
                Password = hashedPassword,
                IdStore = storeId,
                IdPlan = input.IdPlan ?? 0
            };

            var userId = await _userRepository.SaveAsync(newUser);
            var savedUser = await _userRepository.FindByIdAsync(userId);

            return StatusCode(201, new
            {
                message = "Usuario y tienda registrados exitosamente.",
                data = savedUser ?? newUser
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al registrar el usuario: " + ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest input)
    {
        if (string.IsNullOrWhiteSpace(input.Username)) return BadRequest(new { error = "El campo 'username' es obligatorio." });
        if (string.IsNullOrWhiteSpace(input.Password)) return BadRequest(new { error = "El campo 'password' es obligatorio." });

        try
        {
            var user = await _userRepository.FindByUsernameAsync(input.Username);
            if (user == null || !_passwordHasher.VerifyPassword(input.Password, user.Password))
            {
                return Unauthorized(new { error = "Credenciales inválidas." });
            }

            var token = _jwtService.GenerateToken(user.Id, user.Username);

            return Ok(new
            {
                message = "Login exitoso.",
                data = new
                {
                    user = user,
                    token = token
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al iniciar sesión: " + ex.Message });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest input)
    {
        if (string.IsNullOrWhiteSpace(input.Email))
        {
            return BadRequest(new { error = "Por favor ingrese un correo electrónico válido." });
        }

        try
        {
            var user = await _userRepository.FindByEmailAsync(input.Email);
            if (user == null)
            {
                return NotFound(new { error = "No se encontró ninguna cuenta asociada a este correo." });
            }

            var tempPass = _passwordHasher.GenerateRandomPassword(8);

            await _tempPasswordRepository.DeleteForUserAsync(user.Id);
            await _tempPasswordRepository.SaveAsync(user.Id, tempPass, 10);

            await _emailService.SendTemporaryPasswordEmailAsync(user.Email, user.Name, tempPass);

            return Ok(new
            {
                message = "Se ha enviado un correo con tu contraseña temporal. Revisa tu bandeja de entrada.",
                debug_pass = tempPass
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al procesar recuperación: " + ex.Message });
        }
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest input)
    {
        if (string.IsNullOrWhiteSpace(input.UserId) || string.IsNullOrWhiteSpace(input.Password))
        {
            return BadRequest(new { error = "Datos insuficientes." });
        }

        if (!_passwordHasher.ValidatePasswordStrength(input.Password))
        {
            return UnprocessableEntity(new { error = "La contraseña no cumple con los requisitos de seguridad." });
        }

        try
        {
            var user = await _userRepository.FindByIdAsync(input.UserId);
            if (user == null)
            {
                return NotFound(new { error = "Usuario no encontrado." });
            }

            user.Password = _passwordHasher.HashPassword(input.Password);
            await _userRepository.UpdateAsync(user);

            await _tempPasswordRepository.DeleteForUserAsync(input.UserId);

            return Ok(new { message = "Contraseña actualizada exitosamente." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al cambiar la contraseña: " + ex.Message });
        }
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateProfile(string id, [FromBody] UpdateProfileRequest input)
    {
        try
        {
            var user = await _userRepository.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { error = "Usuario no encontrado." });
            }

            if (!string.IsNullOrWhiteSpace(input.Name)) user.Name = input.Name;
            if (!string.IsNullOrWhiteSpace(input.Lastname)) user.Lastname = input.Lastname;
            if (!string.IsNullOrWhiteSpace(input.Birthday)) user.Birthday = input.Birthday;
            if (!string.IsNullOrWhiteSpace(input.Email)) user.Email = input.Email;
            if (!string.IsNullOrWhiteSpace(input.Username)) user.Username = input.Username;
            if (input.IdPlan.HasValue) user.IdPlan = input.IdPlan.Value;

            if (!string.IsNullOrWhiteSpace(user.IdStore))
            {
                var store = await _storeRepository.FindByIdAsync(user.IdStore);
                if (store != null)
                {
                    if (!string.IsNullOrWhiteSpace(input.Store)) store.StoreName = input.Store;
                    if (!string.IsNullOrWhiteSpace(input.DialingCode)) store.DialingCode = input.DialingCode;
                    if (!string.IsNullOrWhiteSpace(input.Cellphone)) store.Cellphone = input.Cellphone;

                    if (!string.IsNullOrWhiteSpace(input.Image) && input.Image.StartsWith("data:image"))
                    {
                        var hostUrl = $"{Request.Scheme}://{Request.Host}";
                        var logoResult = await _imageService.ProcessAndSaveImageAsync(input.Image, "logos", hostUrl);
                        store.Image = logoResult.Url;
                        if (logoResult.Colors != null) store.Colors = logoResult.Colors;
                    }
                    else if (!string.IsNullOrWhiteSpace(input.Colors))
                    {
                        store.Colors = input.Colors;
                    }

                    await _storeRepository.UpdateAsync(store);
                }
            }

            await _userRepository.UpdateAsync(user);
            var updatedUser = await _userRepository.FindByIdAsync(id);

            return Ok(new
            {
                message = "Perfil actualizado exitosamente.",
                data = updatedUser ?? user
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al actualizar el perfil: " + ex.Message });
        }
    }
}
