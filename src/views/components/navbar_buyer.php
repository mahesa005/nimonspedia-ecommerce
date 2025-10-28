<?php
// TEMP
$user_balance = number_format(1000000000000, 0, ',', '.');
$order_item_count = 1;
?>
<header>
  <nav class="navbar">
    <a href="/" class="navbar-brand">Nimonspedia</a>
    <div class="action-wrapper"> 
      <a href="/cart" class="navbar-cart">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
          <path fill="#42b549" d="M24-16C10.7-16 0-5.3 0 8S10.7 32 24 32l45.3 0c3.9 0 7.2 2.8 7.9 6.6l52.1 286.3c6.2 34.2 36 59.1 70.8 59.1L456 384c13.3 0 24-10.7 24-24s-10.7-24-24-24l-255.9 0c-11.6 0-21.5-8.3-23.6-19.7l-5.1-28.3 303.6 0c30.8 0 57.2-21.9 62.9-52.2L568.9 69.9C572.6 50.2 557.5 32 537.4 32l-412.7 0-.4-2c-4.8-26.6-28-46-55.1-46L24-16zM208 512a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm224 0a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/>
        </svg>
        <div class="item-counter"><?php echo htmlspecialchars($order_item_count); ?></div>
      </a>

      <button  class="navbar-balance" id="openBalanceModal">
        Rp<?php echo htmlspecialchars($user_balance); ?>
      </button>
      
      <div class="navbar-profile">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="profile-icon">
          <path fill="#42b549" d="M224 248a120 120 0 1 0 0-240 120 120 0 1 0 0 240zm-29.7 56C95.8 304 16 383.8 16 482.3 16 498.7 29.3 512 45.7 512l356.6 0c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3l-59.4 0z"/>
        </svg>

        <ul class="profile-dropdown">
          <li><a href="/profile">Profil</a></li>
          <li><a href="/orders">Transaksi Historis</a></li>
          <li><a href="/logout">Logout</a></li>
        </ul>
      </div>

    </div>
  </nav>
</header>

<div class="modal-wrapper">
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
</div>