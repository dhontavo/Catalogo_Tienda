using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace backend_dotnet.Services;

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
    bool ValidatePasswordStrength(string password);
    string GenerateRandomPassword(int length = 8);
}

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 10);
    }

    public bool VerifyPassword(string password, string hash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch
        {
            return false;
        }
    }

    public bool ValidatePasswordStrength(string password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 8) return false;
        if (!Regex.IsMatch(password, "[A-Z]")) return false;
        if (!Regex.IsMatch(password, "[a-z]")) return false;
        if (!Regex.IsMatch(password, "[0-9]")) return false;
        if (!Regex.IsMatch(password, @"[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]")) return false;

        return true;
    }

    public string GenerateRandomPassword(int length = 8)
    {
        const string uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string lowercase = "abcdefghijklmnopqrstuvwxyz";
        const string numbers   = "0123456789";
        const string symbols   = "!@#$%^&*()-_=+[]{}|;:,.<>?";

        var passwordChars = new List<char>
        {
            uppercase[RandomNumberGenerator.GetInt32(uppercase.Length)],
            lowercase[RandomNumberGenerator.GetInt32(lowercase.Length)],
            numbers[RandomNumberGenerator.GetInt32(numbers.Length)],
            symbols[RandomNumberGenerator.GetInt32(symbols.Length)]
        };

        const string all = uppercase + lowercase + numbers + symbols;
        for (int i = passwordChars.Count; i < length; i++)
        {
            passwordChars.Add(all[RandomNumberGenerator.GetInt32(all.Length)]);
        }

        // Shuffle
        for (int i = passwordChars.Count - 1; i > 0; i--)
        {
            int j = RandomNumberGenerator.GetInt32(i + 1);
            (passwordChars[i], passwordChars[j]) = (passwordChars[j], passwordChars[i]);
        }

        return new string(passwordChars.ToArray());
    }
}
