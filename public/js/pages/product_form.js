/**
 * Product Form Handler
 * Handles validation, image upload preview, and form submission
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('productForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            clearAllErrors();
            
            // Validate all fields
            const isNameValid = validateProductName();
            const isCategoryValid = validateCategory();
            const isPriceValid = validatePrice();
            const isStockValid = validateStock();
            const isDescValid = validateDescription();
            const isImageValid = validateImage();
            
            // If all valid, ensure hidden input has latest content
            if (isNameValid && isCategoryValid && isPriceValid && isStockValid && isDescValid && isImageValid) {
                if (quillEditor) {
                    document.getElementById('description').value = quillEditor.root.innerHTML;
                }
                
                // Show loading
                const loadingOverlay = document.getElementById('loadingOverlay');
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'flex';
                }
                
                // Submit form
                form.submit();
            } else {
                // Scroll to first error
                const firstError = document.querySelector('.error-message:not(:empty)');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }

    let quillEditor = null;
    initQuillEditor();
    
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

    //  Helper functions FIRST (before event listeners)
    /**
     * Show error
     */
    function showError(input, errorElement, message) {
        if (input) {
            input.classList.add('error');
            // For hidden input (description), highlight the editor
            if (input.id === 'description') {
                const editor = document.getElementById('descriptionEditor');
                if (editor) editor.classList.add('error');
            }
        }
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * Hide error
     */
    function hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        
        if (!errorElement) {
            console.warn(`Error element tidak ditemukan: ${elementId}`);
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
            showError('nameError', 'Nama produk dibutuhkan');
            return false;
        }
        
        if (name.length < 3) {
            showError('nameError', 'Nama produk minimal 3 karakter');
            return false;
        }
        
        if (name.length > 200) {
            showError('nameError', 'Nama produk maksimal 200 karakter');
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
            showError('categoryError', 'Tolong pilih sebuah kategori');
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
            showError('priceError', 'Harga minimal Rp 1.000,00');
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
            showError('stockError', 'Stock tidak bisa bernilai negatif');
            return false;
        }
        
        hideError('stockError');
        return true;
    }

    function initQuillEditor() {
        const editorElement = document.getElementById('descriptionEditor');
        const hiddenInput = document.getElementById('description');
        const charCount = document.getElementById('descCount');
        
        if (!editorElement || !hiddenInput) return;
        
        // Quill toolbar configuration
        const toolbarOptions = [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link'],
            ['clean']
        ];
        
        // Initialize Quill
        quillEditor = new Quill('#descriptionEditor', {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: 'Tulis deskripsi produk...',
        });
        
        // Set initial content if exists (for edit mode)
        const existingContent = hiddenInput.value;
        if (existingContent) {
            quillEditor.root.innerHTML = existingContent;
        }
        
        // Update hidden input and character count when content changes
        quillEditor.on('text-change', function() {
            const html = quillEditor.root.innerHTML;
            const textOnly = quillEditor.getText().trim();
            const textLength = textOnly.length;
            
            // Update hidden input
            hiddenInput.value = html;
            
            // Update character count
            if (charCount) {
                charCount.textContent = textLength;
                
                // Color coding based on length
                const countSpan = charCount.parentElement;
                if (textLength > 1000) {
                    countSpan.style.color = '#ef4444'; // red
                } else if (textLength > 900) {
                    countSpan.style.color = '#f59e0b'; // orange
                } else {
                    countSpan.style.color = '#6b7280'; // gray
                }
            }
            
            // Validate
            validateDescription();
        });
        
        // Limit character count to 1000
        quillEditor.on('text-change', function(delta, oldDelta, source) {
            const textOnly = quillEditor.getText().trim();
            if (textOnly.length > 1000) {
                quillEditor.deleteText(1000, quillEditor.getLength());
            }
        });
        
        // Initial character count
        const initialText = quillEditor.getText().trim();
        if (charCount) {
            charCount.textContent = initialText.length;
        }
    }

    function clearError(input, errorElement) {
        if (input) {
            input.classList.remove('error');
            // For hidden input (description), remove highlight from editor
            if (input.id === 'description') {
                const editor = document.getElementById('descriptionEditor');
                if (editor) editor.classList.remove('error');
            }
        }
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    /**
     * Validate description
     */
    function validateDescription() {
        const hiddenInput = document.getElementById('description');
        const descError = document.getElementById('descError');
        
        if (!quillEditor) return true;
        
        const textOnly = quillEditor.getText().trim();
        const textLength = textOnly.length;
        
        if (textLength === 0) {
            showError(hiddenInput, descError, 'Deskripsi dibutuhkan');
            return false;
        }
        
        if (textLength < 20) {
            showError(hiddenInput, descError, 'Deskripsi minimal 20 karakter');
            return false;
        }
        
        if (textLength > 1000) {
            showError(hiddenInput, descError, 'Deskripsi tidak boleh melebihi 1000 karakter');
            return false;
        }
        
        clearError(hiddenInput, descError);
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
            showError('imageError', 'Tolong upload format gambar yang valid(JPG, PNG, or WEBP)');
            return false;
        }
        
        // Validate file size
        if (file.size > maxSize) {
            showError('imageError', 'Ukuran gambar maksimal 2MB');
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

    //  Event listeners
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

    function clearAllErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        document.querySelectorAll('.form-control, .quill-editor').forEach(el => {
            el.classList.remove('error');
        });
    }
});