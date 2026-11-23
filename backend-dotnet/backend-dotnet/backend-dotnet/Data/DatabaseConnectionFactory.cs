using System.Data;
using MySqlConnector;

namespace backend_dotnet.Data;

public interface IDatabaseConnectionFactory
{
    IDbConnection CreateConnection();
}

public class DatabaseConnectionFactory : IDatabaseConnectionFactory
{
    private readonly string _connectionString;

    public DatabaseConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Server=localhost;Port=3306;Database=catalogo_tienda;User=root;Password=;CharSet=utf8mb4;";
    }

    public IDbConnection CreateConnection()
    {
        return new MySqlConnection(_connectionString);
    }
}
