using backend_dotnet.Data;
using backend_dotnet.Models;
using Dapper;

namespace backend_dotnet.Repositories;

public interface ITemporaryPasswordRepository
{
    Task<bool> SaveAsync(string userId, string password, int minutes = 10);
    Task<bool> FindValidAsync(string userId, string password);
    Task<bool> DeleteForUserAsync(string userId);
}

public class TemporaryPasswordRepository : ITemporaryPasswordRepository
{
    private readonly IDatabaseConnectionFactory _connectionFactory;

    public TemporaryPasswordRepository(IDatabaseConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<bool> SaveAsync(string userId, string password, int minutes = 10)
    {
        using var connection = _connectionFactory.CreateConnection();
        var exp = DateTimeOffset.UtcNow.ToUnixTimeSeconds() + (minutes * 60);

        // Intentar primero con la estructura (pass, exp, id_user, date) o fallback a (id_user, pass, expire_at)
        try
        {
            const string sql = @"
                INSERT INTO tmp_pass (pass, exp, id_user, date)
                VALUES (@Pass, @Exp, @UserId, NOW())";

            var affected = await connection.ExecuteAsync(sql, new
            {
                Pass = password,
                Exp = exp,
                UserId = userId
            });

            return affected > 0;
        }
        catch
        {
            const string sqlFallback = @"
                INSERT INTO tmp_pass (id_user, pass, expire_at)
                VALUES (@UserId, @Pass, DATE_ADD(NOW(), INTERVAL @Minutes MINUTE))";

            var affected = await connection.ExecuteAsync(sqlFallback, new
            {
                UserId = userId,
                Pass = password,
                Minutes = minutes
            });

            return affected > 0;
        }
    }

    public async Task<bool> FindValidAsync(string userId, string password)
    {
        using var connection = _connectionFactory.CreateConnection();
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        try
        {
            const string sql = @"
                SELECT id FROM tmp_pass 
                WHERE id_user = @UserId AND pass = @Pass AND exp > @Now
                ORDER BY date DESC LIMIT 1";

            var id = await connection.QueryFirstOrDefaultAsync<int?>(sql, new
            {
                UserId = userId,
                Pass = password,
                Now = now
            });

            return id.HasValue;
        }
        catch
        {
            const string sqlFallback = @"
                SELECT id FROM tmp_pass 
                WHERE id_user = @UserId AND pass = @Pass AND expire_at > NOW()
                ORDER BY created_at DESC LIMIT 1";

            var id = await connection.QueryFirstOrDefaultAsync<int?>(sqlFallback, new
            {
                UserId = userId,
                Pass = password
            });

            return id.HasValue;
        }
    }

    public async Task<bool> DeleteForUserAsync(string userId)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "DELETE FROM tmp_pass WHERE id_user = @UserId";
        var affected = await connection.ExecuteAsync(sql, new { UserId = userId });
        return affected > 0;
    }
}
