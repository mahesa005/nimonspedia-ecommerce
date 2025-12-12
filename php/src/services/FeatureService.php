<?php
namespace App\Services;

use App\Core\Auth;

class FeatureService {
    private static string $nodeUrl = 'http://node:3000/internal/features/check'; 

    public static function getStatus(string $featureName): array {
        $userId = Auth::id();

        $internalSecret = getenv('INTERNAL_API_KEY');

        if (!$internalSecret) {
            error_log("FeatureService Critical: INTERNAL_API_KEY not set!");
            return ['enabled' => true, 'reason' => null];
        }

        $data = [
            'userId' => $userId ? (int)$userId : null,
            'featureName' => $featureName
        ];

        $ch = curl_init(self::$nodeUrl);
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'x-internal-secret: ' . $internalSecret
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 2);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if ($response === false || $httpCode !== 200) {
            error_log("FeatureService Error: Failed to contact Node.js. " . curl_error($ch));
            curl_close($ch);
            return ['enabled' => true, 'reason' => null];
        }

        curl_close($ch);

        $json = json_decode($response, true);

        if (isset($json['success']) && $json['success'] && isset($json['data'])) {
            $flagData = $json['data'];
            
            if ($flagData['enabled'] === false) {
                return [
                    'enabled' => false,
                    'reason' => $flagData['reason']
                ];
            }
        }

        return ['enabled' => true, 'reason' => null];
    }
}