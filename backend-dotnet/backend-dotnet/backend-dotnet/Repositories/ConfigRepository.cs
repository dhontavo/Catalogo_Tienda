using backend_dotnet.Data;
using backend_dotnet.Models;
using Dapper;

namespace backend_dotnet.Repositories;

public interface IConfigRepository
{
    Task<Config> GetAsync();
    Task<bool> UpdateAsync(Config config);
}

public class ConfigRepository : IConfigRepository
{
    private readonly IDatabaseConnectionFactory _connectionFactory;

    public ConfigRepository(IDatabaseConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Config> GetAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "SELECT * FROM config LIMIT 1";
        var row = await connection.QueryFirstOrDefaultAsync<dynamic>(sql);

        if (row == null)
        {
            return new Config
            {
                Name = "ShoppyCatalog",
                Email = "admin@shoppycatalog.com",
                Password = "",
                Port = 587,
                ApiWhatsapp = "",
                Logo = "",
                LogoPath = "uploads/logos/",
                ProductPath = "uploads/products/",
                Host = ""
            };
        }

        return new Config
        {
            Id = row.id != null ? (int)row.id : null,
            Name = row.name ?? "ShoppyCatalog",
            Email = row.email ?? "admin@shoppycatalog.com",
            Password = row.password ?? "",
            Port = row.port != null ? (int)row.port : 587,
            ApiWhatsapp = row.api_whatsapp ?? "",
            Logo = row.logo ?? "",
            LogoPath = row.logo_path ?? "uploads/logos/",
            ProductPath = row.product_path ?? "uploads/products/",
            Host = row.host ?? ""
        };
    }

    public async Task<bool> UpdateAsync(Config config)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string countSql = "SELECT COUNT(*) FROM config";
        var count = await connection.ExecuteScalarAsync<int>(countSql);

        if (count > 0)
        {
            const string updateSql = @"
                UPDATE config SET 
                    `name` = @Name, 
                    email = @Email, 
                    password = @Password, 
                    port = @Port, 
                    api_whatsapp = @ApiWhatsapp, 
                    logo = @Logo, 
                    logo_path = @LogoPath, 
                    product_path = @ProductPath, 
                    host = @Host";

            var affected = await connection.ExecuteAsync(updateSql, new
            {
                Name = config.Name,
                Email = config.Email,
                Password = config.Password,
                Port = config.Port,
                ApiWhatsapp = config.ApiWhatsapp,
                Logo = config.Logo,
                LogoPath = config.LogoPath,
                ProductPath = config.ProductPath,
                Host = config.Host
            });

            return affected > 0;
        }
        else
        {
            const string insertSql = @"
                INSERT INTO config (`name`, email, password, port, api_whatsapp, logo, logo_path, product_path, host)
                VALUES (@Name, @Email, @Password, @Port, @ApiWhatsapp, @Logo, @LogoPath, @ProductPath, @Host)";

            var affected = await connection.ExecuteAsync(insertSql, new
            {
                Name = config.Name,
                Email = config.Email,
                Password = config.Password,
                Port = config.Port,
                ApiWhatsapp = config.ApiWhatsapp,
                Logo = config.Logo,
                LogoPath = config.LogoPath,
                ProductPath = config.ProductPath,
                Host = config.Host
            });

            return affected > 0;
        }
    }
}
