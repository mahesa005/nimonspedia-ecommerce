document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('balanceDialog');
  const openBtn = document.getElementById('openBalanceModal');
  const closeBtn = document.getElementById('closeBalanceDialog');
  const form = document.getElementById('topUpForm');
  const amountInput = document.getElementById('topUpAmount');

  openBtn.addEventListener('click', () => {
    dialog.showModal();
    amountInput.focus();
  });

  closeBtn.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', e => {
    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      rect.top <= e.clientY && e.clientY <= rect.bottom &&
      rect.left <= e.clientX && e.clientX <= rect.right;
    if (!isInDialog) dialog.close();
  });

  // TEMP
  form.addEventListener('submit', e => {
    e.preventDefault();
    const amount = parseInt(amountInput.value, 10);

    if (isNaN(amount) || amount < 1000) {
      showToast('Tolong masukkan jumlah yang valid (minimal RP1.000)', 'error');
      return;
    }


    showToast(`Top up RP${amount.toLocaleString()} berhasil!`, 'success');
    form.reset();
    dialog.close();
  });
});