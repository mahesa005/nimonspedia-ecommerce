import { ensurePushSubscription } from '../modules/push_manager.js';

document.addEventListener('DOMContentLoaded', function() {
    initMetricAnimations();
    initEditStoreButton();
    initExportPopover();
    initNotificationSettings();

    function initMetricAnimations() {
        const metrics = document.querySelectorAll('.metric');
        metrics.forEach((metric, index) => {
            metric.style.opacity = '0';
            metric.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                metric.style.transition = 'all 0.5s ease';
                metric.style.opacity = '1';
                metric.style.transform = 'translateY(0)';
            }, index * 100);

            metric.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
                this.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
            });

            metric.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '';
            });
        });
    }

    function initEditStoreButton() {
        const editBtn = document.getElementById('editStoreBtn');
        const storeView = document.getElementById('storeView');
        const editForm = document.getElementById('editStoreForm');
        const cancelBtn = document.getElementById('cancelEditBtn');
        const storeNameInput = document.getElementById('storeNameInput');
        const storeNameView = document.getElementById('storeNameView');
        const storeDescView = document.getElementById('storeDescView');
        const storeDescInput = document.getElementById('storeDescriptionInput');
        const logoInput = document.getElementById('storeLogoInput');
        const logoPreview = document.getElementById('logoPreview');
        const logoPreviewImg = document.getElementById('logoPreviewImg');
        const storeLogoImg = document.getElementById('storeLogoImg');
        let quill;

        if (editBtn) {
            editBtn.addEventListener('click', function() {
                storeView.style.display = 'none';
                editForm.style.display = 'block';

                if (!quill) {
                    quill = new Quill('#quillEditor', {
                        theme: 'snow',
                        placeholder: 'Tulis deskripsi toko...',
                        modules: {
                            toolbar: [
                                [{ header: [1, 2, false] }],
                                ['bold', 'italic', 'underline'],
                                [{ list: 'ordered' }, { list: 'bullet' }],
                                ['link', 'clean']
                            ]
                        }
                    });
                    quill.root.innerHTML = storeDescView.innerHTML;
                }
            });
        }

        cancelBtn.addEventListener('click', function() {
            editForm.style.display = 'none';
            storeView.style.display = 'block';
        });

        if (logoInput) {
            logoInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(ev) {
                        if (logoPreviewImg) {
                            logoPreviewImg.src = ev.target.result;
                        } else {
                            const img = document.createElement('img');
                            img.id = 'logoPreviewImg';
                            img.src = ev.target.result;
                            logoPreview.innerHTML = '';
                            logoPreview.appendChild(img);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        editForm.addEventListener('submit', function(e) {
            e.preventDefault();

            storeDescInput.value = quill.root.innerHTML;
            const formData = new FormData(editForm);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/seller/store/update', true);

            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        try {
                            const res = JSON.parse(xhr.responseText);
                            if (res.success) {
                                storeNameView.textContent = formData.get('store_name');
                                storeDescView.innerHTML = formData.get('store_description');

                                if (res.logo_url) {
                                    if (storeLogoImg) {
                                        storeLogoImg.src = res.logo_url;
                                    } else {
                                        const newImg = document.createElement('img');
                                        newImg.src = res.logo_url;
                                        newImg.className = 'store-logo-img';
                                        const container = document.createElement('div');
                                        container.className = 'store-logo-container';
                                        container.appendChild(newImg);
                                        storeView.prepend(container);
                                    }
                                }

                                editForm.style.display = 'none';
                                storeView.style.display = 'block';
                                showToast('Perubahan berhasil disimpan!', 'success');
                            } else {
                                showToast(res.message || 'Gagal menyimpan perubahan.', 'error');
                            }
                        } catch (err) {
                            showToast('Terjadi kesalahan pada server.', 'error');
                        }
                    } else {
                        showToast('Gagal terhubung ke server.', 'error');
                    }
                }
            };

            xhr.send(formData);
        });
    }
    
    function initExportPopover() {
        const btn = document.getElementById('btnExport');
        const pop = document.getElementById('exportPopover');
        const entitySel = document.getElementById('exportEntity');
        const fromEl = document.getElementById('filterFrom');
        const toEl = document.getElementById('filterTo');
        const statusWrap = document.getElementById('statusFilter');
        const dateWrap = document.getElementById('dateFilters');
        const submit = document.getElementById('exportSubmit');
        const cancel = document.getElementById('exportCancel');

        const STATUS_UI_TO_CODE = {
            'Menunggu Persetujuan': 'waiting_approval',
            'Disetujui': 'approved',
            'Ditolak': 'rejected',
            'Dalam Pengiriman': 'on_delivery',  
            'Diterima': 'received',
        };

        if (!btn || !pop) return;

        const openPop = () => { pop.classList.add('show'); pop.setAttribute('aria-hidden','false'); };
        const closePop = () => { pop.classList.remove('show'); pop.setAttribute('aria-hidden','true'); };

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            pop.classList.contains('show') ? closePop() : openPop();
        });

        document.addEventListener('click', (e) => {
            if (!pop.contains(e.target) && e.target !== btn) closePop();
        });

        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePop(); });

        const applyVisibility = () => {
            if (!entitySel) return;
            const val = entitySel.value;
            const needDate = (val === 'orders' || val === 'revenue');
            if (dateWrap)  dateWrap.style.display  = needDate ? 'block' : 'none';
            if (statusWrap) statusWrap.style.display = (val === 'orders') ? 'block' : 'none';
        };
        if (entitySel) {
            entitySel.addEventListener('change', applyVisibility);
            applyVisibility();
        }

        const buildUrl = () => {
            const params = new URLSearchParams();
            if (entitySel) params.set('entity', entitySel.value || 'orders');

            if (dateWrap && dateWrap.style.display !== 'none') {
                if (fromEl && fromEl.value) params.set('from', fromEl.value);
                if (toEl && toEl.value) params.set('to', toEl.value);
            }
            if (statusWrap && statusWrap.style.display !== 'none') {
                const stEl = document.getElementById('filterStatus');
                if (stEl && stEl.value) {
                    const code = STATUS_UI_TO_CODE[stEl.value] || stEl.value; 
                    params.set('status', code);
                }
            }
            return '/seller/export.csv?' + params.toString();
        };

        if (submit) {
            submit.addEventListener('click', () => {
                window.location.href = buildUrl();
                closePop();
            });
        }
        if (cancel) {
            cancel.addEventListener('click', (e) => { e.preventDefault(); closePop(); });
        }
    }

    function initNotificationSettings() {
        const btnEnableNotif = document.getElementById('btn-enable-browser-notif');
        const statusText = document.getElementById('notif-status-text');

        function updateStatusUI() {
            if (!statusText || !btnEnableNotif) return;

            if (!('Notification' in window)) {
                statusText.textContent = "Tidak didukung browser.";
                statusText.style.color = "#999";
                btnEnableNotif.style.display = 'none';
                return;
            }

            if (Notification.permission === 'granted') {
                statusText.textContent = "Diizinkan (Aktif)";
                statusText.style.color = "var(--tp-green-dark)";
                btnEnableNotif.style.display = 'none';
            } else if (Notification.permission === 'denied') {
                statusText.textContent = "Diblokir (Cek browser)";
                statusText.style.color = "var(--danger)";
                btnEnableNotif.style.display = 'none';
            } else {
                statusText.textContent = "Belum Diizinkan";
                statusText.style.color = "#f57c00"; // Orange
                btnEnableNotif.style.display = 'inline-flex';
                btnEnableNotif.disabled = false;
            }
        }

        updateStatusUI();

        if (btnEnableNotif) {
            btnEnableNotif.addEventListener('click', async () => {
                btnEnableNotif.textContent = "Processing...";
                btnEnableNotif.disabled = true;

                const success = await ensurePushSubscription();

                if (success) {
                    if (typeof window.showToast === 'function') window.showToast("Notifikasi browser aktif!", "success");
                    else alert("Notifikasi browser aktif!");
                } else if (Notification.permission === 'denied') {
                    alert("Gagal: Izin notifikasi diblokir browser.");
                }

                updateStatusUI();
            });
        }

        const notifForm = document.getElementById('form-notification-settings');
        if (notifForm) {
            notifForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                const btn = document.getElementById('btn-save-notif');
                const msgDiv = document.getElementById('notif-msg');
                const originalText = btn.textContent;

                btn.disabled = true;
                btn.textContent = 'Menyimpan...';
                msgDiv.style.display = 'none';
                msgDiv.className = 'form-message';

                const formData = new FormData();            
                formData.append('chat_enabled', document.getElementById('chat_enabled').checked ? '1' : '0');
                formData.append('auction_enabled', document.getElementById('auction_enabled').checked ? '1' : '0');
                formData.append('order_enabled', document.getElementById('order_enabled').checked ? '1' : '0');

                try {
                    const response = await fetch('/seller/preferences/update', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();

                    if (result.success) {
                        msgDiv.textContent = result.message;
                        msgDiv.classList.add('success');
                        if (typeof window.showToast === 'function') window.showToast(result.message, 'success');
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    console.error(error);
                    msgDiv.textContent = error.message || 'Gagal menyimpan pengaturan.';
                    msgDiv.classList.add('error');
                } finally {
                    btn.disabled = false;
                    btn.textContent = originalText;
                    msgDiv.style.display = 'block';
                }
            });
        }
    }
});