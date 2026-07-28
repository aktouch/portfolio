<?php
// StripeダッシュボードでこのURLをWebhookエンドポイントに登録し、
// checkout.session.completed を受信します。

declare(strict_types=1);
require_once __DIR__ . '/vendor/autoload.php';

$secret = getenv('STRIPE_WEBHOOK_SECRET');
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

try {
    $event = \Stripe\Webhook::constructEvent($payload, $signature, $secret);
    if ($event->type === 'checkout.session.completed') {
        $session = $event->data->object;
        // TODO: ここで申込情報をDBへ保存、または管理者通知を送信します。
        // $session->metadata / $session->customer_details / $session->payment_status を利用できます。
        error_log('Paid checkout session: ' . $session->id);
    }
    http_response_code(200);
} catch (UnexpectedValueException | \Stripe\Exception\SignatureVerificationException $e) {
    http_response_code(400);
}
