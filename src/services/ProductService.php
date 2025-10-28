<?php
namespace App\Services;

use App\Repositories\ProductRepository;
use App\Repositories\CategoryRepository;
use App\Repositories\StoreRepository;
use Exception;

class ProductService {
    private ProductRepository $productRepo;
    private CategoryRepository $categoryRepo;
    private StoreRepository $storeRepo;

    // Use relative path like AuthService
    private const UPLOAD_DIR = '/uploads/products/';
    private const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    private const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    private const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

    public function __construct() {
        $this->productRepo = new ProductRepository();
        $this->categoryRepo = new CategoryRepository();
        $this->storeRepo = new StoreRepository();

        // Create directory in public folder
        $public_path = __DIR__ . '/../../public' . self::UPLOAD_DIR;
        if (!is_dir($public_path)) {
            mkdir($public_path, 0775, true);
        }
    }

    public function getProductsByUser(
        int $userId,
        ?string $search = null,
        ?int $categoryId = null,
        string $sortBy = 'product_name',
        string $sortOrder = 'ASC'
    ): array {
        $store = $this->storeRepo->getByUserId($userId);
        
        if (!$store) {
            throw new Exception('Store not found for this user');
        }

        $products = $this->productRepo->getByStoreId(
            $store['store_id'],
            $search,
            $categoryId,
            $sortBy,
            $sortOrder
        );

        return $products;
    }

    public function getAllCategories(): array {
        return $this->categoryRepo->getAll();
    }

    public function getStoreByUserId(int $userId): ?array {
        return $this->storeRepo->getByUserId($userId);
    }

    public function createProduct(int $userId, array $data, ?array $file = null): array {
        $store = $this->storeRepo->getByUserId($userId);
        
        if (!$store) {
            return [
                'success' => false,
                'message' => 'Store not found'
            ];
        }

        try {
            // Normalize data
            $normalizedData = [
                'product_name' => $this->normalizeValue($data['product_name'] ?? ''),
                'description' => $this->normalizeValue($data['description'] ?? ''),
                'price' => $this->normalizeValue($data['price'] ?? 0),
                'stock' => $this->normalizeValue($data['stock'] ?? 0),
                'category_id' => $this->normalizeValue($data['category_id'] ?? null),
            ];

            // Validate data
            $this->validateProductData($normalizedData);

            // Handle image upload
            $imagePath = null;
            if ($file && isset($file['tmp_name']) && $file['error'] === UPLOAD_ERR_OK) {
                $imagePath = $this->handleImageUpload($file);
            }

            // Prepare product data
            $productData = [
                'store_id' => $store['store_id'],
                'product_name' => trim($normalizedData['product_name']),
                'description' => trim($normalizedData['description']),
                'price' => (float) $normalizedData['price'],
                'stock' => (int) $normalizedData['stock'],
                'category_id' => (int) $normalizedData['category_id'],
                'main_image_path' => $imagePath //Changed from image_path
            ];

            // Create product
            $productId = $this->productRepo->create($productData);

            return [
                'success' => true,
                'message' => 'Produk berhasil ditambahkan',
                'product_id' => $productId
            ];

        } catch (Exception $e) {
            // Clean up using public path
            if (isset($imagePath) && $imagePath) {
                $fullPath = __DIR__ . '/../../public' . $imagePath;
                if (file_exists($fullPath)) {
                    unlink($fullPath);
                }
            }
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function getProductForEdit(int $userId, int $productId): ?array {
        $store = $this->storeRepo->getByUserId($userId);
        
        if (!$store) {
            return null;
        }

        return $this->productRepo->getByIdAndStoreId($productId, $store['store_id']);
    }

    public function updateProduct(int $userId, int $productId, array $data, ?array $file = null): array {
        $store = $this->storeRepo->getByUserId($userId);
        
        if (!$store) {
            return [
                'success' => false,
                'message' => 'Store not found'
            ];
        }

        $product = $this->productRepo->getByIdAndStoreId($productId, $store['store_id']);
        
        if (!$product) {
            return [
                'success' => false,
                'message' => 'Product not found or does not belong to your store'
            ];
        }

        try {
            // Normalize data
            $normalizedData = [
                'product_name' => $this->normalizeValue($data['product_name'] ?? ''),
                'description' => $this->normalizeValue($data['description'] ?? ''),
                'price' => $this->normalizeValue($data['price'] ?? 0),
                'stock' => $this->normalizeValue($data['stock'] ?? 0),
                'category_id' => $this->normalizeValue($data['category_id'] ?? null),
            ];

            $this->validateProductData($normalizedData);

            // Use main_image_path
            $imagePath = $product['main_image_path'];
            
            if ($file && isset($file['tmp_name']) && $file['error'] === UPLOAD_ERR_OK) {
                $imagePath = $this->handleImageUpload($file);
                
                // Delete old image using public path
                if ($product['main_image_path']) {
                    $oldFile = __DIR__ . '/../../public' . $product['main_image_path'];
                    if (file_exists($oldFile)) {
                        unlink($oldFile);
                    }
                }
            }

            // Prepare product data
            $productData = [
                'product_name' => trim($normalizedData['product_name']),
                'description' => trim($normalizedData['description']),
                'price' => (float) $normalizedData['price'],
                'stock' => (int) $normalizedData['stock'],
                'category_id' => (int) $normalizedData['category_id'],
                'main_image_path' => $imagePath //Changed
            ];

            $this->productRepo->update($productId, $store['store_id'], $productData);

            return [
                'success' => true,
                'message' => 'Product updated successfully'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function deleteProduct(int $userId, int $productId): array {
        $store = $this->storeRepo->getByUserId($userId);
        
        if (!$store) {
            return [
                'success' => false,
                'message' => 'Store not found'
            ];
        }

        $product = $this->productRepo->getByIdAndStoreId($productId, $store['store_id']);
        
        if (!$product) {
            return [
                'success' => false,
                'message' => 'Product not found or does not belong to your store'
            ];
        }

        try {
            // Delete image using public path
            if ($product['main_image_path']) {
                $imagePath = __DIR__ . '/../../public' . $product['main_image_path'];
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }

            $this->productRepo->softDelete($productId, $store['store_id']);

            return [
                'success' => true,
                'message' => 'Product deleted successfully'
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     *   Handle upload like AuthService
     */
    private function handleImageUpload(array $file): string {
        // Validate upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('File upload error: ' . $this->getUploadErrorMessage($file['error']));
        }

        // Validate file size
        if ($file['size'] > self::MAX_FILE_SIZE) {
            throw new Exception('File size exceeds 2MB limit');
        }

        // Validate MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, self::ALLOWED_TYPES)) {
            throw new Exception('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed');
        }

        // Validate extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, self::ALLOWED_EXTENSIONS)) {
            throw new Exception('Invalid file extension');
        }

        //Generate unique filename
        $unique_filename = uniqid('product_', true) . '.' . $extension;
        
        //Full path in public directory
        $public_path = __DIR__ . '/../../public' . self::UPLOAD_DIR;
        $destination = $public_path . $unique_filename;

        //Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            throw new Exception('Failed to save uploaded file');
        }

        //Return relative path (stored in database)
        return self::UPLOAD_DIR . $unique_filename;
    }

    private function getUploadErrorMessage(int $errorCode): string {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                return 'File too large';
            case UPLOAD_ERR_PARTIAL:
                return 'File partially uploaded';
            case UPLOAD_ERR_NO_FILE:
                return 'No file uploaded';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Missing temporary folder';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Failed to write file';
            default:
                return 'Unknown upload error';
        }
    }

    private function validateProductData(array $data): void {
        $errors = [];

        if (empty($data['product_name'])) {
            $errors[] = 'Product name is required';
        } elseif (strlen($data['product_name']) > 200) {
            $errors[] = 'Product name must not exceed 200 characters';
        }

        if (empty($data['description'])) {
            $errors[] = 'Description is required';
        } elseif (strlen($data['description']) > 1000) {
            $errors[] = 'Description must not exceed 1000 characters';
        }

        if (!isset($data['price']) || $data['price'] < 1000) {
            $errors[] = 'Price must be at least Rp 1,000';
        }

        if (!isset($data['stock']) || $data['stock'] < 0) {
            $errors[] = 'Stock cannot be negative';
        }

        if (empty($data['category_id'])) {
            $errors[] = 'Category is required';
        }

        if (!empty($errors)) {
            throw new Exception(implode(', ', $errors));
        }
    }

    private function normalizeValue($value) {
        if (is_array($value)) {
            if (count($value) === 0) {
                return '';
            }
            
            $firstValue = reset($value);
            return $firstValue !== false ? $firstValue : '';
        }
        
        if ($value === null) {
            return '';
        }
        
        return $value;
    }
}