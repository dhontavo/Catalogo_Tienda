using backend_dotnet.Data;
using backend_dotnet.Models;
using Dapper;

namespace backend_dotnet.Repositories;

public interface IUserRepository
{
    Task<User?> FindByIdAsync(string id);
    Task<User?> FindByUsernameAsync(string username);
    Task<User?> FindByEmailAsync(string email);
    Task<string> SaveAsync(User user);
    Task<bool> UpdateAsync(User user);
}

public class UserRepository : IUserRepository
{
    private readonly IDatabaseConnectionFactory _connectionFactory;

    public UserRepository(IDatabaseConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<User?> FindByIdAsync(string id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT us.id, us.name, us.lastname, us.birthday, us.email, us.username, 
                   us.password, us.id_store AS IdStore, us.id_plan AS IdPlan, 
                   us.created_at AS CreatedAt, us.update_at AS UpdateAt,
                   st.`store` AS Store, st.dialing_code AS DialingCode, 
                   st.cellphone AS Cellphone, st.image AS Image, st.colors AS Colors
            FROM users AS us 
            LEFT JOIN stores AS st ON us.id_store = st.id
            WHERE us.id = @Id LIMIT 1";

        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<User?> FindByUsernameAsync(string username)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT us.id, us.name, us.lastname, us.birthday, us.email, us.username, 
                   us.password, us.id_store AS IdStore, us.id_plan AS IdPlan, 
                   us.created_at AS CreatedAt, us.update_at AS UpdateAt,
                   st.`store` AS Store, st.dialing_code AS DialingCode, 
                   st.cellphone AS Cellphone, st.image AS Image, st.colors AS Colors
            FROM users AS us 
            LEFT JOIN stores AS st ON us.id_store = st.id
            WHERE us.username = @Username LIMIT 1";

        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Username = username });
    }

    public async Task<User?> FindByEmailAsync(string email)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT us.id, us.name, us.lastname, us.birthday, us.email, us.username, 
                   us.password, us.id_store AS IdStore, us.id_plan AS IdPlan, 
                   us.created_at AS CreatedAt, us.update_at AS UpdateAt,
                   st.`store` AS Store, st.dialing_code AS DialingCode, 
                   st.cellphone AS Cellphone, st.image AS Image, st.colors AS Colors
            FROM users AS us 
            LEFT JOIN stores AS st ON us.id_store = st.id
            WHERE us.email = @Email LIMIT 1";

        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
    }

    public async Task<string> SaveAsync(User user)
    {
        using var connection = _connectionFactory.CreateConnection();
        var id = string.IsNullOrEmpty(user.Id) ? Guid.NewGuid().ToString() : user.Id;
        const string sql = @"
            INSERT INTO users (id, name, lastname, birthday, email, username, password, id_store, id_plan)
            VALUES (@Id, @Name, @Lastname, @Birthday, @Email, @Username, @Password, @IdStore, @IdPlan)";

        await connection.ExecuteAsync(sql, new
        {
            Id = id,
            Name = user.Name,
            Lastname = user.Lastname,
            Birthday = user.Birthday,
            Email = user.Email,
            Username = user.Username,
            Password = user.Password,
            IdStore = user.IdStore,
            IdPlan = user.IdPlan
        });

        return id;
    }

    public async Task<bool> UpdateAsync(User user)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE users SET 
                name = @Name, 
                lastname = @Lastname, 
                birthday = @Birthday, 
                email = @Email, 
                username = @Username,
                password = @Password,
                id_plan = @IdPlan
            WHERE id = @Id";

        var affected = await connection.ExecuteAsync(sql, new
        {
            Name = user.Name,
            Lastname = user.Lastname,
            Birthday = user.Birthday,
            Email = user.Email,
            Username = user.Username,
            Password = user.Password,
            IdPlan = user.IdPlan,
            Id = user.Id
        });

        return affected > 0;
    }
}
