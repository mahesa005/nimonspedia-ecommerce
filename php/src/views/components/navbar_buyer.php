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
            <a href="/cart" class="navbar-cart">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                    <path fill="#42b549" d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
                </svg>
                <?php if ($item_count > 0): ?>
                    <div class="item-counter"><?php echo htmlspecialchars($item_count); ?></div>
                <?php endif; ?>
            </a>

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