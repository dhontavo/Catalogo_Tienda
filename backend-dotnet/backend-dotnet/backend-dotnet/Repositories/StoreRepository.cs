using backend_dotnet.Data;
using backend_dotnet.Models;
using Dapper;

namespace backend_dotnet.Repositories;

public interface IStoreRepository
{
    Task<string> SaveAsync(Store store);
    Task<Store?> FindByIdAsync(string id);
    Task<Store?> FindByNameAsync(string name);
    Task<bool> UpdateAsync(Store store);
    Task<IEnumerable<Store>> FindAllAsync();
}

public class StoreRepository : IStoreRepository
{
    private readonly IDatabaseConnectionFactory _connectionFactory;

    public StoreRepository(IDatabaseConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<string> SaveAsync(Store store)
    {
        using var connection = _connectionFactory.CreateConnection();
        var id = string.IsNullOrEmpty(store.Id) ? Guid.NewGuid().ToString() : store.Id;
        const string sql = @"
            INSERT INTO stores (id, `store`, dialing_code, cellphone, image, colors)
            VALUES (@Id, @StoreName, @DialingCode, @Cellphone, @Image, @Colors)";

        await connection.ExecuteAsync(sql, new
        {
            Id = id,
            StoreName = store.StoreName,
            DialingCode = store.DialingCode,
            Cellphone = store.Cellphone,
            Image = store.Image,
            Colors = store.Colors
        });

        return id;
    }

    public async Task<Store?> FindByIdAsync(string id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT id, `store` AS StoreName, dialing_code AS DialingCode, 
                   cellphone AS Cellphone, image AS Image, colors AS Colors, created_at AS CreatedAt 
            FROM stores 
            WHERE id = @Id LIMIT 1";

        return await connection.QueryFirstOrDefaultAsync<Store>(sql, new { Id = id });
    }

    public async Task<Store?> FindByNameAsync(string name)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT id, `store` AS StoreName, dialing_code AS DialingCode, 
                   cellphone AS Cellphone, image AS Image, colors AS Colors, created_at AS CreatedAt 
            FROM stores 
            WHERE `store` = @Name LIMIT 1";

        return await connection.QueryFirstOrDefaultAsync<Store>(sql, new { Name = name });
    }

    public async Task<bool> UpdateAsync(Store store)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE stores 
            SET `store` = @StoreName, 
                dialing_code = @DialingCode, 
                cellphone = @Cellphone, 
                image = @Image, 
                colors = @Colors 
            WHERE id = @Id";

        var affected = await connection.ExecuteAsync(sql, new
        {
            StoreName = store.StoreName,
            DialingCode = store.DialingCode,
            Cellphone = store.Cellphone,
            Image = store.Image,
            Colors = store.Colors,
            Id = store.Id
        });

        return affected > 0;
    }

    public async Task<IEnumerable<Store>> FindAllAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT id, `store` AS StoreName, dialing_code AS DialingCode, 
                   cellphone AS Cellphone, image AS Image, colors AS Colors, created_at AS CreatedAt 
            FROM stores 
            ORDER BY created_at DESC";

        return await connection.QueryAsync<Store>(sql);
    }
}
