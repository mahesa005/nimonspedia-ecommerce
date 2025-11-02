<?php

use App\Models\User;

$current_user = $user ?? null; 
$item_count = $cart_item_count ?? 0;

$user_balance_formatted = '0';
if ($current_user) {
    $user_balance_formatted = number_format($current_user->balance, 0, ',', '.');
}
?>
<header>
    <nav class="navbar">
        <a href="/" class="navbar-brand">Nimonspedia</a>
        <div class="action-wrapper"> 
            <button class="navbar-balance" id="openBalanceModal">
                Rp <?php echo htmlspecialchars($user_balance_formatted); ?>
            </button>
            
            <div class="navbar-profile">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="profile-icon">
                    <path fill="#42b549" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/> 
                </svg>

                <ul class="profile-dropdown">
                    <li><a href="/profile">Profil</a></li>
                    <li><a href="/orders">Riwayat Pesanan</a></li> 
                    <li><a href="/logout">Logout</a></li>
                </ul>
            </div>
        </div>
    </nav>
</header>

<dialog id="balanceDialog" class="balance-dialog">
  <form method="dialog" id="topUpForm">
    <button type="button" class="close-dialog" id="closeBalanceDialog">&times;</button>
    <h2>Top Up Saldo</h2>
    <p>Masukkan jumlah saldo yang ingin di-top up:</p>
    <div class="price-inputs">
    <div class="price-input-group">
      <label>Rp</label>
      <input type="number" id="topUpAmount" placeholder="Masukkan saldo..." min="1000" step="1000" inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '')" required>
    </div>
      <button type="submit" class="submit-btn">Top Up</button>
      </div>
      </form>
</dialog>