<?php

namespace App\Controllers;

use App\Infrastructure\StripeService;
use App\Infrastructure\SecurityHelper;
use App\Infrastructure\Database;
use App\Infrastructure\Logger;
use App\Infrastructure\MySQLOrderRepository;
use App\UseCases\Order as OrderUseCase;
use Throwable;

/**
 * Controlador REST para operaciones con la pasarela de pagos Stripe y suscripciones SaaS.
 */
class StripeController
{
    private StripeService $stripeService;

    public function __construct()
    {
        $this->stripeService = new StripeService();
    }

    /**
     * GET /stripe/config
     * Devuelve la clave pública y configuración para el frontend.
     */
    public function getConfig(): void
    {
        SecurityHelper::jsonResponse([
            'success' => true,
            'data' => [
                'publishableKey' => $this->stripeService->getPublishableKey(),
                'currency'       => $this->stripeService->getCurrency(),
                'isConfigured'   => $this->stripeService->isConfigured(),
            ]
        ]);
    }

    /**
     * POST /stripe/create-checkout-session
     * Genera una sesión de pago redireccionable a Stripe Checkout.
     */
    public function createCheckoutSession(): void
    {
        $input = SecurityHelper::getJsonInput();
        $type = $input['type'] ?? 'order';

        try {
            if ($type === 'plan') {
                $required = ['userId', 'planId', 'planName', 'price'];
                foreach ($required as $field) {
                    if (!isset($input[$field])) {
                        SecurityHelper::jsonResponse(['error' => "El campo '$field' es obligatorio."], 400);
                        return;
                    }
                }

                $session = $this->stripeService->createPlanCheckoutSession([
                    'userId'     => $input['userId'],
                    'userEmail'  => $input['userEmail'] ?? null,
                    'planId'     => (int)$input['planId'],
                    'planName'   => $input['planName'],
                    'price'      => (float)$input['price'],
                    'successUrl' => $input['successUrl'] ?? 'http://localhost/Catalogo_Tienda/catalog-web/admin?tab=plan&session_id={CHECKOUT_SESSION_ID}&plan_upgraded=true',
                    'cancelUrl'  => $input['cancelUrl'] ?? 'http://localhost/Catalogo_Tienda/catalog-web/admin?tab=plan&canceled=true',
                ]);

                SecurityHelper::jsonResponse([
                    'success' => true,
                    'data'    => $session
                ]);
                return;
            }

            if ($type === 'order') {
                $required = ['storeId', 'items'];
                foreach ($required as $field) {
                    if (!isset($input[$field]) || empty($input[$field])) {
                        SecurityHelper::jsonResponse(['error' => "El campo '$field' es obligatorio."], 400);
                        return;
                    }
                }

                $storeId = (string)$input['storeId'];
                $session = $this->stripeService->createOrderCheckoutSession([
                    'storeId'       => $storeId,
                    'storeName'     => $input['storeName'] ?? 'Catálogo',
                    'items'         => $input['items'],
                    'customerEmail' => $input['customerEmail'] ?? null,
                    'successUrl'    => $input['successUrl'] ?? "http://localhost/Catalogo_Tienda/catalog-web/store/{$storeId}?payment_status=success&session_id={CHECKOUT_SESSION_ID}",
                    'cancelUrl'     => $input['cancelUrl'] ?? "http://localhost/Catalogo_Tienda/catalog-web/store/{$storeId}?payment_status=canceled",
                ]);

                SecurityHelper::jsonResponse([
                    'success' => true,
                    'data'    => $session
                ]);
                return;
            }

            SecurityHelper::jsonResponse(['error' => "Tipo de checkout '$type' no soportado."], 400);

        } catch (Throwable $e) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error'   => 'Error al crear la sesión de Stripe: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /stripe/verify-session?session_id=cs_test_...
     * Verifica en el servidor el estado de una sesión de checkout y aplica la acción correspondiente.
     */
    public function verifySession(): void
    {
        $sessionId = $_GET['session_id'] ?? '';

        if (empty($sessionId)) {
            SecurityHelper::jsonResponse(['error' => 'Falta el parámetro session_id.'], 400);
            return;
        }

        try {
            $session = $this->stripeService->retrieveSession($sessionId);

            if ($session->payment_status !== 'paid') {
                SecurityHelper::jsonResponse([
                    'success' => false,
                    'paid'    => false,
                    'status'  => $session->payment_status,
                    'message' => 'El pago no ha sido completado aún.'
                ]);
                return;
            }

            $metadata = $session->metadata ? $session->metadata->toArray() : [];
            $type = $metadata['type'] ?? 'unknown';

            // Si es actualización de Plan SaaS
            if ($type === 'plan' && !empty($metadata['user_id']) && !empty($metadata['plan_id'])) {
                $customerId = $session->customer ? (string)$session->customer : null;
                $subId = $session->subscription ? (string)$session->subscription : null;

                $this->fulfillPlanUpgrade(
                    $metadata['user_id'],
                    (int)$metadata['plan_id'],
                    $sessionId,
                    $customerId,
                    $subId
                );

                SecurityHelper::jsonResponse([
                    'success' => true,
                    'paid'    => true,
                    'type'    => 'plan',
                    'message' => '¡Plan mejorado y suscripción activada exitosamente!',
                    'data'    => $metadata
                ]);
                return;
            }

            // Si es pago de Carrito / Orden
            if ($type === 'order' && !empty($metadata['store_id'])) {
                $createdOrders = [];
                if (!empty($metadata['products_json'])) {
                    $products = json_decode($metadata['products_json'], true);
                    if (is_array($products)) {
                        $createdOrders = $this->fulfillStoreOrders($metadata['store_id'], $products);
                    }
                }

                SecurityHelper::jsonResponse([
                    'success' => true,
                    'paid'    => true,
                    'type'    => 'order',
                    'message' => '¡Pago recibido exitosamente! Pedido registrado.',
                    'orders'  => $createdOrders,
                    'data'    => $metadata
                ]);
                return;
            }

            SecurityHelper::jsonResponse([
                'success' => true,
                'paid'    => true,
                'type'    => $type,
                'data'    => $metadata
            ]);

        } catch (Throwable $e) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error'   => 'Error al verificar la sesión de Stripe: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /subscriptions?id_user={id}
     * Lista las suscripciones registradas de un usuario.
     */
    public function getSubscriptions(): void
    {
        $userId = $_GET['id_user'] ?? null;
        if (!$userId) {
            SecurityHelper::jsonResponse(['error' => 'Falta el parámetro id_user.'], 400);
            return;
        }

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("
                SELECT s.*, p.plan AS plan_name, p.max_product, p.advertisement
                FROM subscriptions s
                LEFT JOIN plans p ON s.id_plan = p.id
                WHERE s.id_user = :id_user
                ORDER BY s.created_at DESC
            ");
            $stmt->execute([':id_user' => $userId]);
            $subs = $stmt->fetchAll();

            SecurityHelper::jsonResponse([
                'success' => true,
                'data'    => $subs
            ]);
        } catch (Throwable $e) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error'   => 'Error al obtener suscripciones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /stripe/webhook
     * Escucha eventos asíncronos enviados directamente por Stripe.
     */
    public function webhook(): void
    {
        $payload = @file_get_contents('php://input');
        $sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

        try {
            $event = $this->stripeService->constructWebhookEvent($payload, $sigHeader);

            if ($event->type === 'checkout.session.completed') {
                $session = $event->data->object;

                if ($session->payment_status === 'paid' && $session->metadata) {
                    $meta = $session->metadata->toArray();
                    if (($meta['type'] ?? '') === 'plan' && !empty($meta['user_id']) && !empty($meta['plan_id'])) {
                        $customerId = $session->customer ? (string)$session->customer : null;
                        $subId = $session->subscription ? (string)$session->subscription : null;
                        $this->fulfillPlanUpgrade(
                            $meta['user_id'],
                            (int)$meta['plan_id'],
                            $session->id,
                            $customerId,
                            $subId
                        );
                    } elseif (($meta['type'] ?? '') === 'order' && !empty($meta['store_id']) && !empty($meta['products_json'])) {
                        $products = json_decode($meta['products_json'], true);
                        if (is_array($products)) {
                            $this->fulfillStoreOrders($meta['store_id'], $products);
                        }
                    }
                }
            }

            SecurityHelper::jsonResponse(['received' => true]);

        } catch (Throwable $e) {
            SecurityHelper::jsonResponse(['error' => 'Webhook error: ' . $e->getMessage()], 400);
        }
    }

    /**
     * Actualiza el plan del usuario y registra la suscripción en la tabla `subscriptions`.
     */
    private function fulfillPlanUpgrade(
        string $userId,
        int $planId,
        ?string $sessionId = null,
        ?string $customerId = null,
        ?string $subscriptionId = null
    ): bool {
        $db = Database::getConnection();

        // 1. Actualizar id_plan en la tabla users
        $stmtUser = $db->prepare('UPDATE users SET id_plan = :id_plan WHERE id = :id');
        $updatedUser = $stmtUser->execute([
            ':id_plan' => $planId,
            ':id'      => $userId
        ]);

        // 2. Registrar la suscripción en la tabla `subscriptions`
        try {
            $stmtPlan = $db->prepare('SELECT price FROM plans WHERE id = :id');
            $stmtPlan->execute([':id' => $planId]);
            $planRow = $stmtPlan->fetch();
            $planPrice = $planRow ? (float)$planRow['price'] : 0.0;

            $stmtUserStore = $db->prepare('SELECT id_store FROM users WHERE id = :id');
            $stmtUserStore->execute([':id' => $userId]);
            $userRow = $stmtUserStore->fetch();
            $storeId = $userRow ? $userRow['id_store'] : null;

            // Desactivar suscripciones activas anteriores si existieran
            $stmtDeactivate = $db->prepare("UPDATE subscriptions SET status = 'canceled', canceled_at = NOW() WHERE id_user = :id_user AND status = 'active'");
            $stmtDeactivate->execute([':id_user' => $userId]);

            // Insertar la nueva suscripción
            $stmtSub = $db->prepare("
                INSERT INTO subscriptions (
                    id, id_user, id_plan, id_store,
                    stripe_customer_id, stripe_subscription_id, stripe_session_id,
                    status, price, currency, `interval`,
                    current_period_start, current_period_end
                ) VALUES (
                    UUID(), :id_user, :id_plan, :id_store,
                    :stripe_customer_id, :stripe_subscription_id, :stripe_session_id,
                    'active', :price, :currency, 'month',
                    NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH)
                )
            ");

            $stmtSub->execute([
                ':id_user'                => $userId,
                ':id_plan'                => $planId,
                ':id_store'               => $storeId,
                ':stripe_customer_id'     => $customerId,
                ':stripe_subscription_id' => $subscriptionId,
                ':stripe_session_id'      => $sessionId,
                ':price'                  => $planPrice,
                ':currency'               => $this->stripeService->getCurrency()
            ]);
        } catch (Throwable $e) {
            // El fallo al registrar en suscripciones no bloquea la activación del plan
            Logger::log("Error registrando en tabla subscriptions: " . $e->getMessage(), 'STRIPE');
        }

        return $updatedUser;
    }

    /**
     * Inserta las órdenes de la tienda tras un pago de carrito confirmado.
     */
    private function fulfillStoreOrders(string $storeId, array $products): array
    {
        $orderRepo = new MySQLOrderRepository();
        $orderUseCase = new OrderUseCase($orderRepo);
        $results = [];

        foreach ($products as $p) {
            $prodId = $p['id_product'] ?? $p['id'] ?? null;
            if ($prodId) {
                $qty = max(1, (int)($p['quantity'] ?? 1));
                for ($i = 0; $i < $qty; $i++) {
                    $results[] = $orderUseCase->execute($storeId, (string)$prodId);
                }
            }
        }

        return $results;
    }
}
