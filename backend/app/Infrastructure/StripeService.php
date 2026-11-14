<?php

namespace App\Infrastructure;

use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;
use Stripe\Exception\ApiErrorException;

/**
 * Servicio de infraestructura para la integración con Stripe API.
 * Gestiona pagos únicos, checkout sessions de suscripción/planes y webhooks.
 */
class StripeService
{
    private string $secretKey;
    private string $publishableKey;
    private string $webhookSecret;
    private string $currency;

    public function __construct()
    {
        $this->secretKey = trim($_ENV['STRIPE_SECRET_KEY'] ?? getenv('STRIPE_SECRET_KEY') ?: '');
        $this->publishableKey = trim($_ENV['STRIPE_PUBLISHABLE_KEY'] ?? getenv('STRIPE_PUBLISHABLE_KEY') ?: '');
        $this->webhookSecret = trim($_ENV['STRIPE_WEBHOOK_SECRET'] ?? getenv('STRIPE_WEBHOOK_SECRET') ?: '');
        $this->currency = strtolower(trim($_ENV['STRIPE_CURRENCY'] ?? getenv('STRIPE_CURRENCY') ?: 'mxn'));

        if ($this->isConfigured()) {
            Stripe::setApiKey($this->secretKey);
        }
    }

    /**
     * Verifica si las credenciales de Stripe han sido configuradas.
     */
    public function isConfigured(): bool
    {
        return !empty($this->secretKey) && strpos($this->secretKey, 'PLACEHOLDER') === false;
    }

    /**
     * Obtiene la clave publicable para el frontend.
     */
    public function getPublishableKey(): string
    {
        return $this->publishableKey;
    }

    /**
     * Obtiene la moneda por defecto configurada (ej. mxn, usd).
     */
    public function getCurrency(): string
    {
        return $this->currency;
    }

    /**
     * Crea una Checkout Session de Stripe para actualizar/pagar un Plan SaaS.
     *
     * @param array $params [userId, userEmail, planId, planName, price, successUrl, cancelUrl]
     * @return array [id => string, url => string]
     * @throws \Exception
     */
    public function createPlanCheckoutSession(array $params): array
    {
        if (!$this->isConfigured()) {
            throw new \Exception('Stripe no está configurado. Por favor define STRIPE_SECRET_KEY en el archivo backend/.env.');
        }

        $userId = (string)($params['userId'] ?? '');
        $planId = (int)($params['planId'] ?? 0);
        $planName = (string)($params['planName'] ?? 'Plan');
        $price = (float)($params['price'] ?? 0.0);
        $userEmail = !empty($params['userEmail']) ? (string)$params['userEmail'] : null;
        $successUrl = (string)($params['successUrl'] ?? '');
        $cancelUrl = (string)($params['cancelUrl'] ?? '');

        if ($price <= 0) {
            throw new \InvalidArgumentException('El precio del plan debe ser mayor a 0 para procesar pago con Stripe.');
        }

        // Stripe requiere el monto en centavos (ej: 9.99 -> 999)
        $unitAmount = (int)round($price * 100);

        $sessionData = [
            'payment_method_types' => ['card'],
            'mode' => 'payment',
            'line_items' => [
                [
                    'price_data' => [
                        'currency' => $this->currency,
                        'product_data' => [
                            'name' => 'Suscripción ShoppyCatalog: ' . $planName,
                            'description' => 'Activación de plan para tu catálogo digital en ShoppyCatalog.',
                        ],
                        'unit_amount' => $unitAmount,
                    ],
                    'quantity' => 1,
                ]
            ],
            'metadata' => [
                'type' => 'plan',
                'user_id' => $userId,
                'plan_id' => (string)$planId,
                'plan_name' => $planName,
            ],
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
        ];

        if ($userEmail) {
            $sessionData['customer_email'] = $userEmail;
        }

        $session = Session::create($sessionData);

        return [
            'id' => $session->id,
            'url' => $session->url,
        ];
    }

    /**
     * Crea una Checkout Session de Stripe para el pago del carrito de una tienda.
     *
     * @param array $params [storeId, storeName, items, customerEmail, successUrl, cancelUrl]
     * @return array [id => string, url => string]
     * @throws \Exception
     */
    public function createOrderCheckoutSession(array $params): array
    {
        if (!$this->isConfigured()) {
            throw new \Exception('Stripe no está configurado. Por favor define STRIPE_SECRET_KEY en el archivo backend/.env.');
        }

        $storeId = (string)($params['storeId'] ?? '');
        $storeName = (string)($params['storeName'] ?? 'Tienda');
        $items = $params['items'] ?? [];
        $customerEmail = !empty($params['customerEmail']) ? (string)$params['customerEmail'] : null;
        $successUrl = (string)($params['successUrl'] ?? '');
        $cancelUrl = (string)($params['cancelUrl'] ?? '');

        if (empty($items) || !is_array($items)) {
            throw new \InvalidArgumentException('Debes incluir al menos un producto para pagar con Stripe.');
        }

        $lineItems = [];
        $productSummary = [];

        foreach ($items as $item) {
            $name = (string)($item['name'] ?? 'Producto');
            $price = (float)($item['price'] ?? 0.0);
            $qty = max(1, (int)($item['quantity'] ?? 1));
            $unitAmount = (int)round($price * 100);

            $productData = [
                'name' => $name,
            ];

            // Si tiene imagen con URL absoluta válida http(s), Stripe puede mostrarla
            if (!empty($item['image']) && filter_var($item['image'], FILTER_VALIDATE_URL)) {
                $productData['images'] = [$item['image']];
            }

            $lineItems[] = [
                'price_data' => [
                    'currency' => $this->currency,
                    'product_data' => $productData,
                    'unit_amount' => $unitAmount,
                ],
                'quantity' => $qty,
            ];

            $productSummary[] = [
                'id_product' => (string)($item['id_product'] ?? $item['id'] ?? ''),
                'name' => $name,
                'price' => $price,
                'quantity' => $qty,
            ];
        }

        $sessionData = [
            'payment_method_types' => ['card'],
            'mode' => 'payment',
            'line_items' => $lineItems,
            'metadata' => [
                'type' => 'order',
                'store_id' => $storeId,
                'store_name' => $storeName,
                'products_json' => json_encode($productSummary),
            ],
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
        ];

        if ($customerEmail) {
            $sessionData['customer_email'] = $customerEmail;
        }

        $session = Session::create($sessionData);

        return [
            'id' => $session->id,
            'url' => $session->url,
        ];
    }

    /**
     * Recupera una sesión existente desde Stripe para validar su estado de pago.
     *
     * @param string $sessionId
     * @return Session
     * @throws ApiErrorException
     */
    public function retrieveSession(string $sessionId): Session
    {
        if (!$this->isConfigured()) {
            throw new \Exception('Stripe no está configurado en el servidor.');
        }

        return Session::retrieve($sessionId);
    }

    /**
     * Valida y construye un evento de Webhook firmado por Stripe.
     *
     * @param string $payload Cuerpo crudo de la petición
     * @param string $sigHeader Encabezado Stripe-Signature
     * @return \Stripe\Event
     * @throws \Exception
     */
    public function constructWebhookEvent(string $payload, string $sigHeader): \Stripe\Event
    {
        if (empty($this->webhookSecret) || strpos($this->webhookSecret, 'PLACEHOLDER') !== false) {
            throw new \Exception('STRIPE_WEBHOOK_SECRET no está configurado.');
        }

        return Webhook::constructEvent($payload, $sigHeader, $this->webhookSecret);
    }
}

