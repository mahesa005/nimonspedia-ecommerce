<?php
namespace App\Core\Middleware;

use App\Core\Middleware\MiddlewareInterface;
use App\Services\FeatureService;

class FeatureFlagMiddleware implements MiddlewareInterface {
    private string $flagName;

    public function __construct(string $flagName) {
        $this->flagName = $flagName;
    }

    public function handle(): bool {
        $status = FeatureService::getStatus($this->flagName);

        if (!$status['enabled']) {
            $reason = $status['reason'] ?? 'Fitur dinonaktifkan sementara.';

            $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
            $isAjax = (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest');
            $wantsJson = strpos($accept, 'application/json') !== false || $isAjax;

            if ($wantsJson) {
                http_response_code(403);
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => false,
                    'error_code' => 'FEATURE_DISABLED',
                    'message' => 'Feature Disabled',
                    'reason' => $reason
                ]);
            } else {
                $paramFeature = urlencode($this->flagName);
                $paramReason = urlencode($reason);
                
                header("Location: /feature-disabled?feature={$paramFeature}&reason={$paramReason}");
            }
            
            return false;
        }

        return true;
    }
}