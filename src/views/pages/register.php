<div class="auth-content">
    <div class="label-container">
        <div class="auth-label">Daftar Akun Nimonspedia</div>
        <a class="register-label" href="/login">Masuk</a>
    </div>

    <form class="forms-container" action="/register" method="POST" enctype="multipart/form-data">
        
        <div id="step-1" class="form-step">
            <h2 class="step-title">Detail Akun Anda</h2>

            <div class="forms">
                <label class="forms-label">Daftar sebagai:</label>
                <div class="role-selector">
                    <input type="radio" id="role-buyer" name="role" value="BUYER" 
                           <?php echo (!isset($old['role']) || $old['role'] === 'BUYER') ? 'checked' : ''; ?>>
                    <label for="role-buyer">Buyer</label>
                    <input type="radio" id="role-seller" name="role" value="SELLER"
                           <?php echo (isset($old['role']) && $old['role'] === 'SELLER') ? 'checked' : ''; ?>>
                    <label for="role-seller">Seller</label>
                </div>
            </div>

            <div class="forms">
                <label class="forms-label" for="name">Nama Lengkap</label>
                <input type="text" id="name" name="name" required 
                       value="<?php echo htmlspecialchars($old['name'] ?? ''); ?>">
            </div>

            <div class="forms">
                <label class="forms-label" for="email">Email</label>
                <input type="email" id="email" name="email" required
                       value="<?php echo htmlspecialchars($old['email'] ?? ''); ?>">
            </div>

            <div class="forms password-wrapper">
                <label class="forms-label" for="password">Password</label>
                <input type="password" id="password" name="password" 
                       placeholder="Min. 8 karakter (huruf, angka, simbol)" required>
                <svg class="eye-icon eye-open" id="toggle-password-open" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                    <path fill="#42b549" d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z"/>
                </svg>
                <svg class="eye-icon eye-closed" id="toggle-password-closed" style="display: none;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                     <path fill="#42b549" d="M41-24.9c-9.4-9.4-24.6-9.4-33.9 0S-2.3-.3 7 9.1l528 528c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-96.4-96.4c2.7-2.4 5.4-4.8 8-7.2 46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6-56.8 0-105.6 18.2-146 44.2L41-24.9zM204.5 138.7c23.5-16.8 52.4-26.7 83.5-26.7 79.5 0 144 64.5 144 144 0 31.1-9.9 59.9-26.7 83.5l-34.7-34.7c12.7-21.4 17-47.7 10.1-73.7-13.7-51.2-66.4-81.6-117.6-67.9-8.6 2.3-16.7 5.7-24 10l-34.7-34.7zM325.3 395.1c-11.9 3.2-24.4 4.9-37.3 4.9-79.5 0-144-64.5-144-144 0-12.9 1.7-25.4 4.9-37.3L69.4 139.2c-32.6 36.8-55 75.8-66.9 104.5-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6 37.3 0 71.2-7.9 101.5-20.6l-64.2-64.2z"/>
                </svg>
            </div>

            <div class="forms password-wrapper">
                <label class="forms-label" for="confirm_password">Konfirmasi Password</label>
                <input type="password" id="confirm_password" name="confirm_password" 
                       placeholder="Ketik ulang password" required>
                <svg class="eye-icon eye-open" id="toggle-confirm-password-open" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                   <path fill="#42b549" d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z"/>
                </svg>
                <svg class="eye-icon eye-closed" id="toggle-confirm-password-closed" style="display: none;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                     <path fill="#42b549" d="M41-24.9c-9.4-9.4-24.6-9.4-33.9 0S-2.3-.3 7 9.1l528 528c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-96.4-96.4c2.7-2.4 5.4-4.8 8-7.2 46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6-56.8 0-105.6 18.2-146 44.2L41-24.9zM204.5 138.7c23.5-16.8 52.4-26.7 83.5-26.7 79.5 0 144 64.5 144 144 0 31.1-9.9 59.9-26.7 83.5l-34.7-34.7c12.7-21.4 17-47.7 10.1-73.7-13.7-51.2-66.4-81.6-117.6-67.9-8.6 2.3-16.7 5.7-24 10l-34.7-34.7zM325.3 395.1c-11.9 3.2-24.4 4.9-37.3 4.9-79.5 0-144-64.5-144-144 0-12.9 1.7-25.4 4.9-37.3L69.4 139.2c-32.6 36.8-55 75.8-66.9 104.5-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6 37.3 0 71.2-7.9 101.5-20.6l-64.2-64.2z"/>
                </svg>
            </div>

            <div class="forms">
                <label class="forms-label" for="address">Alamat</label>
                <textarea id="address" name="address" required><?php echo htmlspecialchars($old['address'] ?? ''); ?></textarea>
            </div>
        </div>

        <div id="step-2" class="form-step" 
             style="<?php echo (isset($old['role']) && $old['role'] === 'SELLER') ? 'display: block;' : 'display: none;'; ?>">
             
            <h2 class="step-title">Detail Toko Anda</h2>

            <div class="forms">
                <label class="forms-label" for="store-name">Nama Toko</label>
                <input type="text" id="store-name" name="store_name" 
                       placeholder="Maks. 100 karakter"
                       value="<?php echo htmlspecialchars($old['store_name'] ?? ''); ?>"
                       <?php echo (isset($old['role']) && $old['role'] === 'SELLER') ? 'required' : ''; ?>>
            </div>

            <div class="forms">
                <label class="forms-label" for="store-logo">Logo Toko (Opsional)</label>
                <input type="file" id="store-logo" name="store_logo" accept="image/png, image/jpeg, image/webp">
            </div>

            <div class="forms">
                <label class="forms-label">Deskripsi Toko</label>
                <div id="editor-container" style="height: 150px;"></div>
                <input type="hidden" id="store-description-input" name="store_description" 
                       value="<?php echo htmlspecialchars($old['store_description'] ?? ''); ?>">
            </div>
        </div>

        <button type="submit" class="auth-button" id="registerButton">
            <span class="button-text">Daftar</span>
            <span class="loader"></span>
        </button>
    </form>
</div>