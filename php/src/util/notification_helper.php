<?php

function sendPushNotification($userId, $title, $body, $url = '/orders', $type = 'order') {
    $nodeUrl = getenv('NOTIFICATION_TRIGGER_URL');
    $apiKey = getenv('INTERNAL_API_KEY');

    $data = [
        'userId' => (int)$userId,
        'title'  => $title,
        'body'   => $body,
        'url'    => $url,
        'type'   => $type,
    ];

    $ch = curl_init($nodeUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-Internal-Secret: ' . $apiKey
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if ($httpCode !== 200) {
        error_log("Failed to send push notification: " . $response);
    }

    curl_close($ch);
}
?>