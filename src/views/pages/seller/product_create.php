<?php

function getSessionValue($key, $default = '') {
    if (!isset($_SESSION['form_data'][$key])) {
        return $default;
    }
    
    $value = $_SESSION['form_data'][$key];
    
    // If it's an array, take first element
    if (is_array($value)) {
        return !empty($value) ? $value[0] : $default;
    }
    
    return $value;
}
?>

<link rel="stylesheet" href="/css/pages/product_form.css">

<div class="form-page">
    <div class="form-container card">
        <!-- Header -->
        <div class="form-header">
            <h1>Add New Product</h1>
            <p class="subtitle">Fill in the details to add a new product to your store</p>
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

        <!-- Form -->
        <form id="productForm" action="/seller/products/store" method="POST" enctype="multipart/form-data">
            
            <!-- Product Name -->
            <div class="form-group">
                <label for="product_name" class="required">Product Name</label>
                <input 
                    type="text" 
                    id="product_name" 
                    name="product_name" 
                    class="form-control"
                    maxlength="200"
                    value="<?php echo htmlspecialchars(getSessionValue('product_name')); ?>"
                    required>
                <span class="char-count"><span id="nameCount">0</span>/200</span>
                <div class="error-message" id="nameError"></div>
            </div>

            <!-- Category -->
            <div class="form-group">
                <label for="category_id" class="required">Category</label>
                <select id="category_id" name="category_id" class="form-control" required>
                    <option value="">Select a category</option>
                    <?php 
                    $selectedCategory = getSessionValue('category_id');
                    foreach ($categories as $category): 
                    ?>
                        <option value="<?php echo $category['category_id']; ?>"
                                <?php echo ($selectedCategory == $category['category_id']) ? 'selected' : ''; ?>>
                            <?php echo htmlspecialchars($category['name']); ?>
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
                        value="<?php echo htmlspecialchars(getSessionValue('price')); ?>"
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
                        value="<?php echo htmlspecialchars(getSessionValue('stock')); ?>"
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
                    required><?php echo htmlspecialchars(getSessionValue('description')); ?></textarea>
                <span class="char-count"><span id="descCount">0</span>/1000</span>
                <div class="error-message" id="descError"></div>
            </div>

            <!-- Image Upload -->
            <div class="form-group">
                <label for="image" class="required">Product Image</label>
                <div class="upload-area" id="uploadArea">
                    <input 
                        type="file" 
                        id="image" 
                        name="image" 
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        hidden
                        required>
                    
                    <div class="upload-placeholder" id="uploadPlaceholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <p class="upload-text">Click to upload or drag and drop</p>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Save Product
                </button>
            </div>

            <!-- Loading Overlay -->
            <div class="loading-overlay" id="loadingOverlay" style="display: none;">
                <div class="spinner"></div>
                <p>Uploading product...</p>
            </div>
        </form>
    </div>
</div>

<!-- Toast Notification -->
<div class="toast" id="toast" style="display: none;"></div>

<?php 
// Clean up session data
unset($_SESSION['form_data']); 
?>

<script src="/js/pages/product_form.js"></script>