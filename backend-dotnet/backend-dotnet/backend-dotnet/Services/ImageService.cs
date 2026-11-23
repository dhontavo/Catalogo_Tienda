using System.Text.RegularExpressions;
using SkiaSharp;

namespace backend_dotnet.Services;

public record ImageProcessResult(string? Url, string? Colors);

public interface IImageService
{
    Task<ImageProcessResult> ProcessAndSaveImageAsync(string base64Data, string subFolder = "uploads", string? hostUrl = null);
    List<string> GetDominantColors(string filePath, int count = 5);
}

public class ImageService : IImageService
{
    private readonly IWebHostEnvironment _env;

    public ImageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<ImageProcessResult> ProcessAndSaveImageAsync(string base64Data, string subFolder = "uploads", string? hostUrl = null)
    {
        if (string.IsNullOrWhiteSpace(base64Data))
        {
            return new ImageProcessResult(null, null);
        }

        var extension = "jpg";
        var match = Regex.Match(base64Data, @"^data:image/(\w+);base64,");
        if (match.Success)
        {
            extension = match.Groups[1].Value.ToLowerInvariant();
            base64Data = base64Data.Substring(base64Data.IndexOf(',') + 1);
        }

        byte[] imageBytes;
        try
        {
            imageBytes = Convert.FromBase64String(base64Data);
        }
        catch
        {
            return new ImageProcessResult(null, null);
        }

        var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", subFolder);
        if (!Directory.Exists(uploadsRoot))
        {
            Directory.CreateDirectory(uploadsRoot);
        }

        var fileName = $"{Guid.NewGuid():N}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{extension}";
        var filePath = Path.Combine(uploadsRoot, fileName);

        await File.WriteAllBytesAsync(filePath, imageBytes);

        var dominantColors = GetDominantColors(filePath, 5);
        var colorsString = dominantColors.Count > 0 ? string.Join(",", dominantColors) : null;

        var baseUrl = hostUrl?.TrimEnd('/') ?? "http://localhost:5000";
        var url = $"{baseUrl}/uploads/{subFolder}/{fileName}";

        return new ImageProcessResult(url, colorsString);
    }

    public List<string> GetDominantColors(string filePath, int count = 5)
    {
        try
        {
            if (!File.Exists(filePath)) return new List<string>();

            using var original = SKBitmap.Decode(filePath);
            if (original == null) return new List<string>();

            var info = new SKImageInfo(100, 100);
            using var resized = original.Resize(info, SKSamplingOptions.Default);
            if (resized == null) return new List<string>();

            var colorCounts = new Dictionary<string, int>();

            for (int x = 0; x < resized.Width; x++)
            {
                for (int y = 0; y < resized.Height; y++)
                {
                    var pixel = resized.GetPixel(x, y);

                    // Ignorar píxeles casi transparentes
                    if (pixel.Alpha < 145) continue;

                    // Agrupar colores similares redondeando a múltiplos de 16 (igual que en PHP)
                    int r = (pixel.Red / 16) * 16;
                    int g = (pixel.Green / 16) * 16;
                    int b = (pixel.Blue / 16) * 16;

                    var hex = $"#{r:x2}{g:x2}{b:x2}";
                    if (!colorCounts.ContainsKey(hex))
                    {
                        colorCounts[hex] = 0;
                    }
                    colorCounts[hex]++;
                }
            }

            return colorCounts
                .OrderByDescending(kv => kv.Value)
                .Take(count)
                .Select(kv => kv.Key)
                .ToList();
        }
        catch
        {
            return new List<string>();
        }
    }
}
