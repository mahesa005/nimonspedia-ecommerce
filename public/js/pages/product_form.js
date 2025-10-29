/**
 * Product Form Handler
 * Handles validation, image upload preview, and form submission
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('productForm');
    if (!form) {
        console.warn('Product form not found on this page');
        return;
    }
    
    // Input elements
    const nameInput = document.getElementById('product_name');
    const categoryInput = document.getElementById('category_id');
    const priceInput = document.getElementById('price');
    const stockInput = document.getElementById('stock');
    const descInput = document.getElementById('description');
    const imageInput = document.getElementById('image');
    
    // Image upload elements
    const uploadArea = document.getElementById('uploadArea');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const imagePreview = document.getElementById('imagePreview');
    const btnChangeImage = document.getElementById('btnChangeImage');
    
    // Character counters
    const nameCount = document.getElementById('nameCount');
    const descCount = document.getElementById('descCount');

    // ✅ Helper functions FIRST (before event listeners)
    /**
     * Show error
     */
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        
        if (!errorElement) {
            console.warn(`Error element not found: ${elementId}`);
            return;
        }
        
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    /**
     * Hide error
     */
    function hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        
        if (!errorElement) {
            console.warn(`Error element not found: ${elementId}`);
            return;
        }
        
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }

    /**
     * Validate product name
     */
    function validateProductName() {
        if (!nameInput) return true;
        
        const name = nameInput.value.trim();
        
        if (!name) {
            showError('nameError', 'Product name is required');
            return false;
        }
        
        if (name.length < 3) {
            showError('nameError', 'Product name must be at least 3 characters');
            return false;
        }
        
        if (name.length > 200) {
            showError('nameError', 'Product name must not exceed 200 characters');
            return false;
        }
        
        hideError('nameError');
        return true;
    }

    /**
     * Validate category
     */
    function validateCategory() {
        if (!categoryInput) return true;
        
        if (!categoryInput.value) {
            showError('categoryError', 'Please select a category');
            return false;
        }
        
        hideError('categoryError');
        return true;
    }

    /**
     * Validate price
     */
    function validatePrice() {
        if (!priceInput) return true;
        
        const price = parseFloat(priceInput.value);
        
        if (!price || price < 1000) {
            showError('priceError', 'Price must be at least Rp 1,000');
            return false;
        }
        
        hideError('priceError');
        return true;
    }

    /**
     * Validate stock
     */
    function validateStock() {
        if (!stockInput) return true;
        
        const stock = parseInt(stockInput.value);
        
        if (isNaN(stock) || stock < 0) {
            showError('stockError', 'Stock cannot be negative');
            return false;
        }
        
        hideError('stockError');
        return true;
    }

    /**
     * Validate description
     */
    function validateDescription() {
        if (!descInput) return true;
        
        const desc = descInput.value.trim();
        
        if (!desc) {
            showError('descError', 'Description is required');
            return false;
        }
        
        if (desc.length < 10) {
            showError('descError', 'Description must be at least 10 characters');
            return false;
        }
        
        if (desc.length > 1000) {
            showError('descError', 'Description must not exceed 1000 characters');
            return false;
        }
        
        hideError('descError');
        return true;
    }

    /**
     * Validate image
     */
    function validateImage() {
        if (!imageInput) return true;
        
        // If no file selected, skip validation (optional for edit)
        if (!imageInput.files || imageInput.files.length === 0) {
            hideError('imageError');
            return true;
        }
        
        const file = imageInput.files[0];
        const maxSize = 2 * 1024 * 1024; // 2MB
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        
        // Validate file type
        if (!validTypes.includes(file.type)) {
            showError('imageError', 'Please upload a valid image (JPG, PNG, or WEBP)');
            return false;
        }
        
        // Validate file size
        if (file.size > maxSize) {
            showError('imageError', 'Image size must not exceed 2MB');
            return false;
        }
        
        hideError('imageError');
        return true;
    }

    /**
     * Handle image selection
     */
    function handleImageSelect(e) {
        const file = e.target.files[0];
        
        if (!file) return;
        
        // Validate first
        if (!validateImage()) {
            e.target.value = '';
            return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(event) {
            if (imagePreview && uploadPlaceholder) {
                const previewImg = document.getElementById('previewImg');
                if (previewImg) {
                    previewImg.src = event.target.result;
                }
                uploadPlaceholder.style.display = 'none';
                imagePreview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }

    /**
     * Validate all fields
     */
    function validateAll() {
        let isValid = true;
        
        isValid = validateProductName() && isValid;
        isValid = validateCategory() && isValid;
        isValid = validatePrice() && isValid;
        isValid = validateStock() && isValid;
        isValid = validateDescription() && isValid;
        isValid = validateImage() && isValid;
        
        return isValid;
    }

    // ✅ Event listeners
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            validateProductName();
            if (nameCount) {
                nameCount.textContent = this.value.length;
            }
        });
        nameInput.addEventListener('blur', validateProductName);
        
        if (nameCount) {
            nameCount.textContent = nameInput.value.length;
        }
    }
    
    if (categoryInput) {
        categoryInput.addEventListener('change', validateCategory);
        categoryInput.addEventListener('blur', validateCategory);
    }
    
    if (priceInput) {
        priceInput.addEventListener('input', validatePrice);
        priceInput.addEventListener('blur', validatePrice);
    }
    
    if (stockInput) {
        stockInput.addEventListener('input', validateStock);
        stockInput.addEventListener('blur', validateStock);
    }
    
    if (descInput) {
        descInput.addEventListener('input', function() {
            validateDescription();
            if (descCount) {
                descCount.textContent = this.value.length;
            }
        });
        descInput.addEventListener('blur', validateDescription);
        
        if (descCount) {
            descCount.textContent = descInput.value.length;
        }
    }
    
    // Image upload handling
    if (imageInput && uploadArea) {
        uploadArea.addEventListener('click', function(e) {
            if (e.target !== btnChangeImage && !btnChangeImage?.contains(e.target)) {
                imageInput.click();
            }
        });
        
        imageInput.addEventListener('change', handleImageSelect);
        
        if (btnChangeImage) {
            btnChangeImage.addEventListener('click', function(e) {
                e.stopPropagation();
                imageInput.click();
            });
        }
        
        // Drag and drop
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                imageInput.files = e.dataTransfer.files;
                handleImageSelect({ target: imageInput });
            }
        });
    }
    
    // Form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateAll()) {
            console.log('Validation failed');
            return false;
        }
        
        // Show loading
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
        
        // Disable submit button
        const submitBtn = document.getElementById('btnSubmit');
        if (submitBtn) {
            submitBtn.disabled = true;
        }
        
        // Submit form
        form.submit();
    });

    console.log('Product form initialized');
});