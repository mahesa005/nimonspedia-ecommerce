
<div class="profile-page">
    <h1>Profil Saya</h1>

    <div class="profile-box">
        <h2>Edit Profil</h2>
        <form id="form-update-profile">
            <div class="form-group">
                <label for="name">Nama Lengkap</label>
                <input type="text" id="name" name="name" value="<?= htmlspecialchars($user->name) ?>" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" value="<?= htmlspecialchars($user->email) ?>" readonly disabled>
                <small>Email tidak dapat diubah.</small>
            </div>

            <div class="form-group">
                <label for="address">Alamat</label>
                <textarea id="address" name="address" rows="3" required><?= htmlspecialchars($user->address) ?></textarea>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn btn-primary" id="btn-save-profile">
                    Simpan Perubahan
                    <span class="loading-spinner" style="display:none;"></span>
                </button>
            </div>
            <div id="profile-msg" class="form-message"></div>
        </form>
    </div>

    <div class="profile-box">
        <h2>Ubah Password</h2>
        <form id="form-change-password">
            <div class="form-group">
                <label for="old_password">Password Lama</label>
                <input type="password" id="old_password" name="old_password" required>
                <button type="button" class="btn-toggle-password" data-target="old_password">Lihat</button>
            </div>

            <div class="form-group">
                <label for="new_password">Password Baru</label>
                <input type="password" id="new_password" name="new_password" required>
                <button type="button" class="btn-toggle-password" data-target="new_password">Lihat</button>
                <small>Minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol.</small>
            </div>

            <div class="form-group">
                <label for="confirm_password">Konfirmasi Password Baru</label>
                <input type="password" id="confirm_password" name="confirm_password" required>
                <button type="button" class="btn-toggle-password" data-target="confirm_password">Lihat</button>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn btn-secondary" id="btn-save-password">
                    Ubah Password
                    <span class="loading-spinner" style="display:none;"></span>
                </button>
            </div>
            <div id="password-msg" class="form-message"></div>
        </form>
    </div>

</div>
