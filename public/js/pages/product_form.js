/**
 * Product Form Handler
 * Handles validation, image upload preview, and form submission
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Product form JS loaded');

    // Elements
    const form = document.getElementById('productForm');
    const imageInput = document.getElementById('image');
    const uploadArea = document.getElementById('uploadArea');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const btnChangeImage = document.getElementById('btnChangeImage');
    const btnSubmit = document.getElementById('btnSubmit');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Form fields
    const productName = document.getElementById('product_name');
    const description = document.getElementById('description');
    const price = document.getElementById('price');
    const stock = document.getElementById('stock');
    const categoryId = document.getElementById('category_id');

    // Character counters
    const nameCount = document.getElementById('nameCount');
    const descCount = document.getElementById('descCount');

    // Check if all elements exist
    if (!form || !productName || !description) {
        console.error('Required form elements not found!');
        return;
    }

    console.log('All elements found, initializing...'); 

    // Validation state
    let isValid = {
        name: false,
        description: false,
        price: false,
        stock: false,
        category: false,
        image: false
    };

    updateCharCount(productName, nameCount);
    updateCharCount(description, descCount);

    productName.addEventListener('input', function() {
        console.log('Product name input:', this.value.length); 
        updateCharCount(this, nameCount);
        validateProductName();
        updateSubmitButton();
    });

    productName.addEventListener('keyup', function() {
        updateCharCount(this, nameCount);
    });

    description.addEventListener('input', function() {
        console.log('Description input:', this.value.length); 
        updateCharCount(this, descCount);
        validateDescription();
        updateSubmitButton();
    });

    description.addEventListener('keyup', function() {
        updateCharCount(this, descCount);
    });

    price.addEventListener('input', function() {
        validatePrice();
        updateSubmitButton();
    });

    stock.addEventListener('input', function() {
        validateStock();
        updateSubmitButton();
    });

    categoryId.addEventListener('change', function() {
        validateCategory();
        updateSubmitButton();
    });

    // ✅ FIX: Image upload handling - Multiple ways to trigger
    uploadArea.addEventListener('click', function(e) {
        console.log('Upload area clicked'); 
        if (e.target.id !== 'btnChangeImage') {
            imageInput.click();
        }
    });

    uploadPlaceholder.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('Upload placeholder clicked'); 
        imageInput.click();
    });

    imageInput.addEventListener('change', function() {
        console.log('File selected:', this.files[0]); 
        handleImageSelect();
    });

    btnChangeImage.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Change image clicked'); 
        imageInput.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            imageInput.files = files;
            handleImageSelect();
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate all fields
        const allValid = validateAll();

        if (!allValid) {
            showToast('Please fix all errors before submitting', 'error');
            return;
        }

        // Show loading
        loadingOverlay.style.display = 'flex';
        btnSubmit.disabled = true;

        // Submit form
        this.submit();
    });

    /**
     * Update character count
     */
    function updateCharCount(input, counter) {
        if (counter) {
            counter.textContent = input.value.length;
        }
    }

    /**
     * Validate product name
     */
    function validateProductName() {
        const value = productName.value.trim();
        const error = document.getElementById('nameError');

        if (value.length === 0) {
            showError(productName, error, 'Product name is required');
            isValid.name = false;
            return false;
        }

        if (value.length > 200) {
            showError(productName, error, 'Product name must not exceed 200 characters');
            isValid.name = false;
            return false;
        }

        hideError(productName, error);
        isValid.name = true;
        return true;
    }

    /**
     * Validate description
     */
    function validateDescription() {
        const value = description.value.trim();
        const error = document.getElementById('descError');

        if (value.length === 0) {
            showError(description, error, 'Description is required');
            isValid.description = false;
            return false;
        }

        if (value.length > 1000) {
            showError(description, error, 'Description must not exceed 1000 characters');
            isValid.description = false;
            return false;
        }

        hideError(description, error);
        isValid.description = true;
        return true;
    }

    /**
     * Validate price
     */
    function validatePrice() {
        const value = parseFloat(price.value);
        const error = document.getElementById('priceError');

        if (isNaN(value) || value < 1000) {
            showError(price, error, 'Price must be at least Rp 1,000');
            isValid.price = false;
            return false;
        }

        hideError(price, error);
        isValid.price = true;
        return true;
    }

    /**
     * Validate stock
     */
    function validateStock() {
        const value = parseInt(stock.value);
        const error = document.getElementById('stockError');

        if (isNaN(value) || value < 0) {
            showError(stock, error, 'Stock cannot be negative');
            isValid.stock = false;
            return false;
        }

        hideError(stock, error);
        isValid.stock = true;
        return true;
    }

    /**
     * Validate category
     */
    function validateCategory() {
        const value = categoryId.value;
        const error = document.getElementById('categoryError');

        if (!value) {
            showError(categoryId, error, 'Please select a category');
            isValid.category = false;
            return false;
        }

        hideError(categoryId, error);
        isValid.category = true;
        return true;
    }

    /**
     * Validate image
     */
    function validateImage(file) {
        const error = document.getElementById('imageError');

        if (!file) {
            showErrorMessage(error, 'Product image is required');
            isValid.image = false;
            return false;
        }

        // Check file size (2MB)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            showErrorMessage(error, 'File size must not exceed 2MB');
            isValid.image = false;
            return false;
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showErrorMessage(error, 'Only JPG, PNG, and WEBP files are allowed');
            isValid.image = false;
            return false;
        }

        hideErrorMessage(error);
        isValid.image = true;
        return true;
    }

    /**
     * Handle image selection
     */
    function handleImageSelect() {
        const file = imageInput.files[0];
        console.log('Handling image:', file); 

        if (!validateImage(file)) {
            imageInput.value = '';
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            console.log('Image loaded'); 
            previewImg.src = e.target.result;
            uploadPlaceholder.style.display = 'none';
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);

        updateSubmitButton();
    }

    /**
     * Validate all fields
     */
    function validateAll() {
        validateProductName();
        validateDescription();
        validatePrice();
        validateStock();
        validateCategory();
        
        const file = imageInput.files[0];
        validateImage(file);

        return Object.values(isValid).every(v => v === true);
    }

    /**
     * Update submit button state
     */
    function updateSubmitButton() {
        const allValid = Object.values(isValid).every(v => v === true);
        btnSubmit.disabled = !allValid;
    }

    /**
     * Show error
     */
    function showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    /**
     * Hide error
     */
    function hideError(input, errorElement) {
        input.classList.remove('error');
        errorElement.classList.remove('show');
    }

    /**
     * Show error message (for non-input elements)
     */
    function showErrorMessage(errorElement, message) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    /**
     * Hide error message
     */
    function hideErrorMessage(errorElement) {
        errorElement.classList.remove('show');
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast ' + type;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // Initial validation on page load (for edit form with existing data)
    if (productName.value) validateProductName();
    if (description.value) validateDescription();
    if (price.value) validatePrice();
    if (stock.value) validateStock();
    if (categoryId.value) validateCategory();
    
    updateSubmitButton();

    console.log('Form initialized successfully'); 
});