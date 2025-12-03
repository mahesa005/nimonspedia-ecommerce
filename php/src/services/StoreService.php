<?php
namespace App\Services;

require_once __DIR__ . '/../../lib/htmlpurifier-4.15.0/library/HTMLPurifier.auto.php';

use App\Repositories\StoreRepository;
use App\Models\Store;
use Exception;
use HTMLPurifier;
use HTMLPurifier_Config;

class StoreService {
    private StoreRepository $storeRepo;
    private HTMLPurifier $html_purifier;

    public function __construct() {
        $this->storeRepo = new StoreRepository();

        $config = HTMLPurifier_Config::createDefault();
        $this->html_purifier = new HTMLPurifier($config);
    }


    // Get store by ID
    public function getStoreById(int $store_id): ?Store {
        return $this->storeRepo->findById($store_id);
    }

    // Get store by user ID
    public function getStoreByUserId(int $user_id): ?array {
        return $this->storeRepo->getByUserId($user_id);
    }

    // Update store balance
    public function updateStoreBalance(int $store_id, float $amount): bool {
        return $this->storeRepo->updateBalance($store_id, $amount);
    }

    public function updateStoreInfo(int $seller_id, ?string $store_name, ?string $store_description, ?array $logo_file): array {
        $store = $this->storeRepo->findByUserId($seller_id);
        if (!$store) {
            throw new Exception("Toko tidak ditemukan.", 404);
        }

        if (empty(trim($store_name))) {
            throw new Exception("Nama toko tidak boleh kosong.");
        }
        if (strlen($store_name) > 100) {
            throw new Exception("Nama toko tidak boleh lebih dari 100 karakter.");
        }

        $clean_description = $this->html_purifier->purify($store_description ?? '');
        
        $new_logo_path = null;
        if ($logo_file && $logo_file['error'] === UPLOAD_ERR_OK) {
            $this->validateLogo($logo_file);
            
            $old_logo_path = $store->store_logo_path;
            if ($old_logo_path && file_exists(__DIR__ . '/../../public' . $old_logo_path)) {
                unlink(__DIR__ . '/../../public' . $old_logo_path);
            }

            $new_logo_path = $this->handleLogoUpload($logo_file);
        }

        try {
            $success = $this->storeRepo->update(
                $store->store_id,
                $store_name,
                $clean_description,
                $new_logo_path
            );

            if (!$success) {
                throw new Exception("Gagal memperbarui database.");
            }            

            return [
                'logo_url' => $new_logo_path ? $new_logo_path : ($logo_file ? null : $store->store_logo_path)
            ];
            
        } catch (PDOException $e) {
            if ($e->getCode() == 23505) {
                throw new Exception("Nama toko tersebut sudah digunakan.");
            }
            error_log("Gagal update toko: " . $e->getMessage());
            throw new Exception("Gagal memperbarui toko karena masalah database.");
        }
    }

    private function validateLogo(array $file): void {
        if ($file['size'] > 2 * 1024 * 1024) {
            throw new Exception("Ukuran file logo tidak boleh melebihi 2MB.");
        }
        $allowed_types = ['image/jpeg', 'image/png', 'image/webp'];
        $file_type = mime_content_type($file['tmp_name']);
        if (!in_array($file_type, $allowed_types)) {
             throw new Exception("Tipe file logo tidak valid. Hanya JPG, PNG, atau WEBP.");
        }
    }

    private function handleLogoUpload(array $file): string {
        $upload_dir = '/uploads/logos/';
        $public_path = __DIR__ . '/../../public' . $upload_dir;

        if (!is_dir($public_path)) {
            mkdir($public_path, 0775, true);
        }

        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $unique_filename = uniqid('storelogo_', true) . '.' . $extension;
        $destination = $public_path . $unique_filename;

        if (move_uploaded_file($file['tmp_name'], $destination)) {
            return $upload_dir . $unique_filename;
        } else {
            throw new Exception("Gagal menyimpan file yang di-upload.");
        }
    }
}