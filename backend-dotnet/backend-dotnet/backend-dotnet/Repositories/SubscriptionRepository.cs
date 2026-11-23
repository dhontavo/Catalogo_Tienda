using backend_dotnet.Data;
using backend_dotnet.Models;
using Dapper;

namespace backend_dotnet.Repositories;

public interface ISubscriptionRepository
{
    Task<IEnumerable<Subscription>> GetByUserIdAsync(string userId);
    Task<string> SaveAsync(Subscription subscription);
    Task<bool> DeactivateActiveSubscriptionsAsync(string userId);
}

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly IDatabaseConnectionFactory _connectionFactory;

    public SubscriptionRepository(IDatabaseConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Subscription>> GetByUserIdAsync(string userId)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT s.id, s.id_user AS IdUser, s.id_plan AS IdPlan, s.id_store AS IdStore,
                   s.stripe_customer_id AS StripeCustomerId, s.stripe_subscription_id AS StripeSubscriptionId,
                   s.stripe_session_id AS StripeSessionId, s.status, s.price, s.currency, s.interval,
                   s.current_period_start AS CurrentPeriodStart, s.current_period_end AS CurrentPeriodEnd,
                   s.cancel_at_period_end AS CancelAtPeriodEnd, s.canceled_at AS CanceledAt,
                   s.created_at AS CreatedAt, s.updated_at AS UpdatedAt,
                   p.plan AS PlanName, p.max_product AS MaxProduct, p.advertisement AS Advertisement
            FROM subscriptions s
            LEFT JOIN plans p ON s.id_plan = p.id
            WHERE s.id_user = @UserId
            ORDER BY s.created_at DESC";

        return await connection.QueryAsync<Subscription>(sql, new { UserId = userId });
    }

    public async Task<string> SaveAsync(Subscription subscription)
    {
        using var connection = _connectionFactory.CreateConnection();
        var id = string.IsNullOrEmpty(subscription.Id) ? Guid.NewGuid().ToString() : subscription.Id;
        const string sql = @"
            INSERT INTO subscriptions (
                id, id_user, id_plan, id_store,
                stripe_customer_id, stripe_subscription_id, stripe_session_id,
                status, price, currency, `interval`,
                current_period_start, current_period_end
            ) VALUES (
                @Id, @IdUser, @IdPlan, @IdStore,
                @StripeCustomerId, @StripeSubscriptionId, @StripeSessionId,
                @Status, @Price, @Currency, @Interval,
                NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH)
            )";

        await connection.ExecuteAsync(sql, new
        {
            Id = id,
            IdUser = subscription.IdUser,
            IdPlan = subscription.IdPlan,
            IdStore = subscription.IdStore,
            StripeCustomerId = subscription.StripeCustomerId,
            StripeSubscriptionId = subscription.StripeSubscriptionId,
            StripeSessionId = subscription.StripeSessionId,
            Status = subscription.Status,
            Price = subscription.Price,
            Currency = subscription.Currency,
            Interval = subscription.Interval
        });

        return id;
    }

    public async Task<bool> DeactivateActiveSubscriptionsAsync(string userId)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "UPDATE subscriptions SET status = 'canceled', canceled_at = NOW() WHERE id_user = @UserId AND status = 'active'";
        var affected = await connection.ExecuteAsync(sql, new { UserId = userId });
        return affected > 0;
    }
}
