<?php
/**
 * Helper function to get session value (for validation errors)
 */
function getSessionValue($key, $default = '') {
    if (!isset($_SESSION['form_data'][$key])) {
        return $default;
    }
    
    $value = $_SESSION['form_data'][$key];
    
    if (is_array($value)) {
        $first = reset($value);
        return $first !== false ? $first : $default;
    }
    
    return $value ?? $default;
}

// Use session data if validation failed, otherwise use product data
$productName = getSessionValue('product_name', $product['product_name'] ?? '');
$description = getSessionValue('description', $product['description'] ?? '');
$price = getSessionValue('price', $product['price'] ?? '');
$stock = getSessionValue('stock', $product['stock'] ?? '');
$categoryId = getSessionValue('category_id', $product['category_id'] ?? '');
?>

<link rel="stylesheet" href="/css/pages/product_form.css">

<div class="form-page">
    <div class="form-container card">
        <!-- Header -->
        <div class="form-header">
            <h1>Edit Product</h1>
            <p class="subtitle">Update product information</p>
        </div>

        <!-- Error Message -->
        <?php if (isset($_SESSION['form_error'])): ?>
            <div class="alert alert-danger">
                <?php 
                    echo htmlspecialchars($_SESSION['form_error']); 
                    unset($_SESSION['form_error']);
                ?>
            </div>
        <?php endif; ?>

        <!-- Success Message -->
        <?php if (isset($_SESSION['success_message'])): ?>
            <div class="alert alert-success">
                <?php 
                    echo htmlspecialchars($_SESSION['success_message']); 
                    unset($_SESSION['success_message']);
                ?>
            </div>
        <?php endif; ?>

        <!-- Form - POST to update endpoint -->
        <form id="productForm" action="/seller/products/<?= $product['product_id'] ?>/update" method="POST" enctype="multipart/form-data">
            
            <!-- Product Name -->
            <div class="form-group">
                <label for="product_name" class="required">Product Name</label>
                <input 
                    type="text" 
                    id="product_name" 
                    name="product_name" 
                    class="form-control"
                    maxlength="200"
                    value="<?= htmlspecialchars($productName) ?>"
                    required>
                <span class="char-count"><span id="nameCount">0</span>/200</span>
                <div class="error-message" id="nameError"></div>
            </div>

            <!-- Category -->
            <div class="form-group">
                <label for="category_id" class="required">Category</label>
                <select id="category_id" name="category_id" class="form-control" required>
                    <option value="">Select a category</option>
                    <?php foreach ($categories as $category): ?>
                        <option value="<?= $category['category_id'] ?>"
                                <?= ($categoryId == $category['category_id']) ? 'selected' : '' ?>>
                            <?= htmlspecialchars($category['name']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <div class="error-message" id="categoryError"></div>
            </div>

            <!-- Price & Stock -->
            <div class="form-row">
                <div class="form-group">
                    <label for="price" class="required">Price (Rp)</label>
                    <input 
                        type="number" 
                        id="price" 
                        name="price" 
                        class="form-control"
                        min="1000"
                        step="100"
                        value="<?= htmlspecialchars($price) ?>"
                        required>
                    <div class="error-message" id="priceError"></div> 
                </div>

                <div class="form-group">
                    <label for="stock" class="required">Stock</label>
                    <input 
                        type="number" 
                        id="stock" 
                        name="stock" 
                        class="form-control"
                        min="0"
                        value="<?= htmlspecialchars($stock) ?>"
                        required>
                    <div class="error-message" id="stockError"></div> 
                </div>
            </div>

            <!-- Description -->
            <div class="form-group">
                <label for="description" class="required">Description</label>
                <textarea 
                    id="description" 
                    name="description" 
                    class="form-control"
                    rows="6"
                    maxlength="1000"
                    required><?= htmlspecialchars($description) ?></textarea>
                <span class="char-count"><span id="descCount">0</span>/1000</span>
                <div class="error-message" id="descError"></div> 
            </div>

            <!-- Image Upload (Optional) -->
            <div class="form-group">
                <label for="image">Product Image (Optional)</label>
                <p class="text-muted" style="font-size: 0.875rem; margin-bottom: 0.5rem;">
                    Leave empty to keep current image
                </p>
                
                <!-- Show current image -->
                <?php if (!empty($product['main_image_path'])): ?>
                    <div class="current-image" style="margin-bottom: 1rem;">
                        <p style="margin-bottom: 0.5rem; color: #666; font-weight: 500;">Current Image:</p>
                        <img src="<?= htmlspecialchars($product['main_image_path']) ?>" 
                            alt="Current product" 
                            style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 1px solid #ddd; object-fit: cover;">
                    </div>
                <?php endif; ?>

                <div class="upload-area" id="uploadArea">
                    <input 
                        type="file" 
                        id="image" 
                        name="image" 
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        hidden>
                    
                    <div class="upload-placeholder" id="uploadPlaceholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <p class="upload-text">Click to upload new image (optional)</p>
                        <p class="upload-hint">JPG, PNG or WEBP (max. 2MB)</p>
                    </div>

                    <div class="image-preview" id="imagePreview" style="display: none;">
                        <img id="previewImg" src="" alt="Preview">
                        <button type="button" class="btn-change-image" id="btnChangeImage">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Change Image
                        </button>
                    </div>
                </div>
                <div class="error-message" id="imageError"></div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
                <a href="/seller/products" class="btn btn-ghost">Cancel</a>
                <button type="submit" class="btn btn-primary" id="btnSubmit">
                    Update Product
                </button>
            </div>

            <!-- Loading Overlay -->
            <div class="loading-overlay" id="loadingOverlay" style="display: none;">
                <div class="spinner"></div>
                <p>Updating product...</p>
            </div>
        </form>
    </div>
</div>

<?php 
// Clean up session data
unset($_SESSION['form_data']); 
?>

<script src="/js/pages/product_form.js"></script>