<?php
// Composerで stripe/stripe-php を導入後に使用します。
// composer require stripe/stripe-php

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/vendor/autoload.php';

$secretKey = getenv('STRIPE_SECRET_KEY');
if (!$secretKey) {
    http_response_code(500);
    echo json_encode(['error' => 'Stripeのサーバー設定が完了していません。'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);

    $required = ['last_name', 'first_name', 'last_name_kana', 'first_name_kana', 'tel', 'email', 'people', 'privacy_consent'];
    foreach ($required as $key) {
        if (!isset($data[$key]) || trim((string)$data[$key]) === '') {
            throw new InvalidArgumentException('必須項目が不足しています。');
        }
    }

    $quantity = filter_var($data['people'], FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1, 'max_range' => 4]
    ]);
    if ($quantity === false) {
        throw new InvalidArgumentException('申込人数が正しくありません。');
    }
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('メールアドレスが正しくありません。');
    }

    $stripe = new \Stripe\StripeClient($secretKey);
    $baseUrl = rtrim((string)(getenv('APP_BASE_URL') ?: 'https://example.com/LP/form'), '/');

    $session = $stripe->checkout->sessions->create([
        'mode' => 'payment',
        'customer_email' => trim((string)$data['email']),
        'line_items' => [[
            'price_data' => [
                'currency' => 'jpy',
                'unit_amount' => 4180,
                'product_data' => [
                    'name' => '大人のハロウィン in 東中野 チケット',
                    'description' => '2026年10月30日開催・1ドリンク付',
                ],
            ],
            'quantity' => $quantity,
        ]],
        'metadata' => [
            'applicant_name' => trim($data['last_name'] . ' ' . $data['first_name']),
            'applicant_kana' => trim($data['last_name_kana'] . ' ' . $data['first_name_kana']),
            'phone' => trim((string)$data['tel']),
            'ticket_count' => (string)$quantity,
            'gender' => substr((string)($data['gender'] ?? ''), 0, 100),
            'generation' => substr((string)($data['generation'] ?? ''), 0, 100),
            'relationship' => substr((string)($data['relationship'] ?? ''), 0, 100),
        ],
        'success_url' => $baseUrl . '/success/?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => $baseUrl . '/cancel/',
        'locale' => 'ja',
    ]);

    echo json_encode(['url' => $session->url], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
} catch (InvalidArgumentException $e) {
    http_response_code(422);
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => '決済画面の作成に失敗しました。'], JSON_UNESCAPED_UNICODE);
}
