using backend_dotnet.Data;
using backend_dotnet.Models;
using Dapper;

namespace backend_dotnet.Repositories;

public interface IProductRepository
{
    Task<IEnumerable<Product>> FindByStoreIdAsync(string storeId, int limit = 10, int offset = 0);
    Task<Product?> FindByIdAsync(string id);
    Task<string> SaveAsync(Product product);
    Task<bool> UpdateAsync(Product product);
    Task<bool> DeleteAsync(string id);
    Task<bool> IncrementViewAsync(string id);
}

public class ProductRepository : IProductRepository
{
    private readonly IDatabaseConnectionFactory _connectionFactory;

    public ProductRepository(IDatabaseConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Product>> FindByStoreIdAsync(string storeId, int limit = 10, int offset = 0)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT id, id_store AS StoreId, id_user AS IdUser, name, description, price, image AS ImageUrl, view, created_at AS CreatedAt
            FROM products
            WHERE id_store = @StoreId
            ORDER BY id DESC
            LIMIT @Limit OFFSET @Offset";

        return await connection.QueryAsync<Product>(sql, new { StoreId = storeId, Limit = limit, Offset = offset });
    }

    public async Task<Product?> FindByIdAsync(string id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT id, id_store AS StoreId, id_user AS IdUser, name, description, price, image AS ImageUrl, view, created_at AS CreatedAt
            FROM products
            WHERE id = @Id LIMIT 1";

        return await connection.QueryFirstOrDefaultAsync<Product>(sql, new { Id = id });
    }

    public async Task<string> SaveAsync(Product product)
    {
        using var connection = _connectionFactory.CreateConnection();
        var id = string.IsNullOrEmpty(product.Id) ? Guid.NewGuid().ToString() : product.Id;
        const string sql = @"
            INSERT INTO products (id, id_store, name, description, price, image, id_user)
            VALUES (@Id, @StoreId, @Name, @Description, @Price, @ImageUrl, @IdUser)";

        await connection.ExecuteAsync(sql, new
        {
            Id = id,
            StoreId = product.StoreId,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            ImageUrl = product.ImageUrl,
            IdUser = product.IdUser
        });

        return id;
    }

    public async Task<bool> UpdateAsync(Product product)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE products
            SET name = @Name, description = @Description, price = @Price, image = @ImageUrl
            WHERE id = @Id";

        var affected = await connection.ExecuteAsync(sql, new
        {
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            ImageUrl = product.ImageUrl,
            Id = product.Id
        });

        return affected > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "DELETE FROM products WHERE id = @Id";
        var affected = await connection.ExecuteAsync(sql, new { Id = id });
        return affected > 0;
    }

    public async Task<bool> IncrementViewAsync(string id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "UPDATE products SET view = view + 1 WHERE id = @Id";
        var affected = await connection.ExecuteAsync(sql, new { Id = id });
        return affected > 0;
    }
}
