function handleAddToCart(event) {
    const button = event.target;

    const productId = button.dataset.id;
    
    console.log(`Menambahkan produk ID: ${productId} ke keranjang...`);
    
    button.disabled = true;
    button.textContent = 'Menambahkan...';

    setTimeout(() => {
        if (typeof showToast === 'function') {
            showToast('Produk ditambahkan ke keranjang!', 'success');
        }
    
        button.disabled = false;
        button.textContent = 'Add to cart';

    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    
    const cartButtons = document.querySelectorAll('.btn.add-to-cart');
    
    cartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });

    console.log(`Menyiapkan ${cartButtons.length} tombol Add to Cart.`);
});
