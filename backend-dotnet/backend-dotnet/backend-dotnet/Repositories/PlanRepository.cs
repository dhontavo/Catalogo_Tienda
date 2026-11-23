using backend_dotnet.Data;
using backend_dotnet.Models;
using Dapper;

namespace backend_dotnet.Repositories;

public interface IPlanRepository
{
    Task<IEnumerable<Plan>> FindAllAsync();
    Task<Plan?> FindByIdAsync(int id);
}

public class PlanRepository : IPlanRepository
{
    private readonly IDatabaseConnectionFactory _connectionFactory;

    public PlanRepository(IDatabaseConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Plan>> FindAllAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT id, `plan` AS PlanName, advertisement, max_product AS MaxProduct, 
                   add_user AS AddUser, max_adduser AS MaxAddUser, price 
            FROM plans 
            ORDER BY id ASC";

        return await connection.QueryAsync<Plan>(sql);
    }

    public async Task<Plan?> FindByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT id, `plan` AS PlanName, advertisement, max_product AS MaxProduct, 
                   add_user AS AddUser, max_adduser AS MaxAddUser, price 
            FROM plans 
            WHERE id = @Id LIMIT 1";

        return await connection.QueryFirstOrDefaultAsync<Plan>(sql, new { Id = id });
    }
}
