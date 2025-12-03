function showToast(message, type = 'success') {
  const c = document.createElement('div');
  c.id = 'toast-container';
  document.body.appendChild(c);
  const toast = document.createElement('div');
  toast.classList.add('toast', type);
  toast.textContent = message;
  c.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);
}