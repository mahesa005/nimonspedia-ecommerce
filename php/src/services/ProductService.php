<?php
namespace App\Services;

use App\Core\Database;
use App\Repositories\ProductRepository;
use App\Repositories\CategoryRepository;
use App\Repositories\StoreRepository;
use Exception;
use PDO;

class ProductService {
    private ProductRepository $productRepo;
    private CategoryRepository $categoryRepo;
    private StoreRepository $storeRepo;
    private PDO $db;

    // Use relative path like AuthService
    private const UPLOAD_DIR = '/uploads/products/';
    private const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    private const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    private const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

    public function __construct() {
        $this->productRepo = new ProductRepository();
        $this->categoryRepo = new CategoryRepository();
        $this->storeRepo = new StoreRepository();
        $this->db = Database::getInstance();

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
            'product_name' => $this->purifyProductName($data['product_name'] ?? ''),
            'description' => $this->purifyDescription($data['description'] ?? ''),
            'price' => $this->normalizeNumber($data['price'] ?? 0),
            'stock' => $this->normalizeNumber($data['stock'] ?? 0),
            'category_id' => $this->normalizeNumber($data['category_id'] ?? null),
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

    private function purifyProductName(string $name): string {
        $name = strip_tags($name);
        
        $name = preg_replace('/[\x00-\x1F\x7F\xA0\xAD]/u', '', $name);
        
        $name = html_entity_decode($name, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $name = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        
        $name = trim($name);
        
        return mb_substr($name, 0, 200);
    }

    private function purifyDescription(string $html): string {
        if (empty($html)) {
            return '';
        }

        $html = preg_replace('#<script[^>]*?>.*?</script>#is', '', $html);
        $html = preg_replace('#<style[^>]*?>.*?</style>#is', '', $html);
        $html = preg_replace('/\s*on\w+\s*=\s*["\'][^"\']*["\']/i', '', $html);
        $html = preg_replace('/javascript:/i', '', $html);
        $html = preg_replace('/data:/i', '', $html);       
        $allowedTags = '<p><br><b><strong><i><em><u><ul><ol><li><h1><h2><h3><h4><h5><h6><a><span><div>';
        $html = strip_tags($html, $allowedTags);        
        $html = preg_replace_callback(
            '/<a\s+([^>]*?)href\s*=\s*["\']([^"\']*)["\']([^>]*?)>/i',
            function($matches) {
                $href = $matches[2];
                if (preg_match('#^(https?://|/)#i', $href)) {
                    return "<a {$matches[1]}href=\"" . htmlspecialchars($href, ENT_QUOTES) . "\"{$matches[3]}>";
                }
                return "<a {$matches[1]}{$matches[3]}>";
            },
            $html
        );        
        $dangerousAttrs = ['formaction', 'action', 'xlink:href', 'FSCommand', 'seekSegmentTime'];
        foreach ($dangerousAttrs as $attr) {
            $html = preg_replace('/\s*' . preg_quote($attr, '/') . '\s*=\s*["\'][^"\']*["\']/i', '', $html);
        }        
        $html = trim($html);
        
        return mb_substr($html, 0, 10000);
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

        // Check if product has active auction
        if ($this->hasActiveAuction($productId)) {
            return [
                'success' => false,
                'message' => 'Produk ini sedang diikutkan dalam lelang dan tidak dapat diubah'
            ];
        }

        try {
            // Normalize data
            $normalizedData = [
            'product_name' => $this->normalizeString($data['product_name'] ?? ''),
            'description' => $this->normalizeString($data['description'] ?? ''),
            'price' => $this->normalizeNumber($data['price'] ?? 0),
            'stock' => $this->normalizeNumber($data['stock'] ?? 0),
            'category_id' => $this->normalizeNumber($data['category_id'] ?? null),
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

        // Check if product has active auction
        if ($this->hasActiveAuction($productId)) {
            return [
                'success' => false,
                'message' => 'Produk ini sedang diikutkan dalam lelang dan tidak dapat dihapus'
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

    private function normalizeString($value): string {
        // Handle array (take first element)
        if (is_array($value)) {
            if (empty($value)) {
                return '';
            }
            $value = reset($value);
        }
        
        // Convert to string
        return (string) ($value ?? '');
    }

    /**
     * Normalize numeric values
     */
    private function normalizeNumber($value) {
        // Handle array (take first element)
        if (is_array($value)) {
            if (empty($value)) {
                return 0;
            }
            $value = reset($value);
        }
        
        // Handle null or empty string
        if ($value === null || $value === '') {
            return 0;
        }
        
        // Return numeric value
        return is_numeric($value) ? $value : 0;
    }

    public function getAllVisibleProducts(): array {
        return $this->productRepo->findAllVisible();
    }

    public function getPaginatedProducts(
        int $page, 
        int $limit, 
        string $search = '', 
        array $category_ids = [], 
        ?int $min_price = null, 
        ?int $max_price = null,
        string $sort = 'newest',
        ?int $store_id = null
    ): array {
        $offset = max(0, ($page - 1) * $limit);

        $sort_by = 'created_at';
        $sort_order = 'DESC';
        if ($sort === 'price-low') {
            $sort_by = 'price';
            $sort_order = 'ASC';
        } elseif ($sort === 'price-high') {
            $sort_by = 'price';
            $sort_order = 'DESC';
        }

        $products = $this->productRepo->findPaginated(
            $limit, $offset, $search, $category_ids, $min_price, $max_price, $sort_by, $sort_order, $store_id
        );
        $total_count = $this->productRepo->countAllVisible(
            $search, $category_ids, $min_price, $max_price, $store_id
        );
        $total_pages = ($limit > 0) ? ceil($total_count / $limit) : 0;

        return [
            'data' => $products,
            'current_page' => $page,
            'total_pages' => $total_pages,
            'limit' => $limit,
            'total_items' => $total_count
        ];
    }

    public function getProductDetailsById(int $product_id): ?array {
        $product = $this->productRepo->findById($product_id);
        if (!$product) {
            return null;
        }

        $store = $this->storeRepo->findById($product->store_id);

        $categories = $this->categoryRepo->findByProductId($product_id);

        return [
            'product' => $product,
            'store' => $store,
            'categories' => $categories
        ];
    }

    //cek barangnya dilelang atau ga
    public function getActiveAuctionByProductId($productId) {
        try {
            // Status yang dianggap "ada lelang" ketika scheduled atau active
            $sql = "SELECT * FROM auctions 
                    WHERE product_id = :pid 
                    AND status IN ('scheduled', 'active', 'ongoing') 
                    LIMIT 1";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':pid' => $productId]);
            
            return $stmt->fetch();
        } catch (Exception $e) {
            // Log error but return false (no auction found)
            error_log("Error querying auctions table: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if product has an active auction
     */
    private function hasActiveAuction(int $productId): bool {
        try {
            $auction = $this->getActiveAuctionByProductId($productId);
            return $auction !== false;
        } catch (Exception $e) {
            // Log error but don't crash - auctions table might not exist or DB issue
            error_log("Error checking active auction for product {$productId}: " . $e->getMessage());
            return false;
        }
    }
}