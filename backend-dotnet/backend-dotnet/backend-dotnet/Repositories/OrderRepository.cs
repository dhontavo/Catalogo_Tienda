using backend_dotnet.Data;
using backend_dotnet.Models;
using Dapper;

namespace backend_dotnet.Repositories;

public interface IOrderRepository
{
    Task<IEnumerable<Order>> GetByStoreIdAsync(string storeId);
    Task<string> SaveAsync(Order order);
}

public class OrderRepository : IOrderRepository
{
    private readonly IDatabaseConnectionFactory _connectionFactory;

    public OrderRepository(IDatabaseConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Order>> GetByStoreIdAsync(string storeId)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT o.id, o.id_store AS StoreId, o.id_product AS ProductId, 
                   DATE_FORMAT(o.create_at, '%Y-%m-%d %H:%i:%s') AS CreateAt,
                   p.name AS ProductName, p.price AS ProductPrice, p.image AS ProductImage
            FROM orders o
            LEFT JOIN products p ON o.id_product = p.id
            WHERE o.id_store = @StoreId
            ORDER BY o.create_at DESC";

        var rows = await connection.QueryAsync(sql, new { StoreId = storeId });
        var orders = new List<Order>();

        foreach (var row in rows)
        {
            ProductDetails? details = null;
            if (!string.IsNullOrEmpty((string?)row.ProductName))
            {
                details = new ProductDetails
                {
                    Name = row.ProductName,
                    Price = row.ProductPrice != null ? Convert.ToDecimal(row.ProductPrice) : 0m,
                    Image = row.ProductImage
                };
            }

            orders.Add(new Order
            {
                Id = (string)row.id,
                StoreId = (string)row.StoreId,
                ProductId = (string)row.ProductId,
                CreateAt = (string)row.CreateAt,
                Product = details
            });
        }

        return orders;
    }

    public async Task<string> SaveAsync(Order order)
    {
        using var connection = _connectionFactory.CreateConnection();
        var id = string.IsNullOrEmpty(order.Id) ? Guid.NewGuid().ToString() : order.Id;
        const string sql = @"
            INSERT INTO orders (id, id_store, id_product)
            VALUES (@Id, @StoreId, @ProductId)";

        await connection.ExecuteAsync(sql, new
        {
            Id = id,
            StoreId = order.StoreId,
            ProductId = order.ProductId
        });

        return id;
    }
}
