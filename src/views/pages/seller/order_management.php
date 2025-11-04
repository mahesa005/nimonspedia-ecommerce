<?php
use App\Core\Session;

$successMsg = Session::get('success_message');
$errorMsg = Session::get('error_message');
if ($successMsg) Session::set('success_message', null);
if ($errorMsg) Session::set('error_message', null);

$orders = $orders ?? [];
$pagination = $pagination ?? ['currentPage' => 1, 'totalPages' => 1, 'totalOrders' => 0];
$filters = $filters ?? ['status' => null, 'search' => null];

$statusLabels = [
    'waiting_approval' => 'Menunggu Persetujuan',
    'approved' => 'Disetujui',
    'rejected' => 'Ditolak',
    'on_delivery' => 'Dalam Pengiriman',
    'received' => 'Diterima', 
    'completed' => 'Selesai'
];

$statusColors = [
    'waiting_approval' => 'orange',
    'approved' => 'blue',
    'rejected' => 'red',
    'on_delivery' => 'purple',
    'received' => 'green', 
    'completed' => 'green'
];
?>

<link rel="stylesheet" href="/css/pages/order_management.css">

<?php include __DIR__ . '/../../components/navbar_seller.php'; ?>

<div class="tp-page">
    <?php if ($successMsg): ?>
        <div class="alert alert-success">
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            <?= htmlspecialchars($successMsg) ?>
        </div>
    <?php endif; ?>

    <?php if ($errorMsg): ?>
        <div class="alert alert-error">
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            <?= htmlspecialchars($errorMsg) ?>
        </div>
    <?php endif; ?>

    <div class="tp-heading">
        <div class="left">
            <h1>Kelola Pesanan</h1>
            <p class="sub">Kelola dan proses pesanan dari pembeli</p>
        </div>
        <div class="right">
            <a href="/seller/dashboard" class="btn btn-ghost">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                Kembali
            </a>
        </div>
    </div>

    <div class="filters-section card">
        <form method="GET" action="/seller/orders" class="filters-form" id="filterForm">
            <div class="filter-group">
                <label for="status">Status:</label>
                <select name="status" id="status" class="filter-select">
                    <option value="">Semua Status</option>
                    <?php foreach ($statusLabels as $key => $label): ?>
                        <option value="<?= $key ?>" <?= $filters['status'] === $key ? 'selected' : '' ?>>
                            <?= $label ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="filter-group">
                <label for="search">Cari:</label>
                <input type="text" name="search" id="search" class="filter-input" 
                    placeholder="ID Pesanan atau Nama Pembeli" 
                    value="<?= htmlspecialchars($filters['search'] ?? '') ?>">
            </div>

            <div class="filter-actions">
                <a href="/seller/orders" class="btn btn-ghost" title="Reset Filter">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Reset
                </a>
            </div>
        </form>
    </div>

    <div class="orders-section card">
        <div class="section-header">
            <h2>Daftar Pesanan</h2>
            <span class="total-count"><?= number_format($pagination['totalOrders']) ?> pesanan</span>
        </div>

        <?php if (empty($orders)): ?>
            <div class="empty-state">
                <svg viewBox="0 0 24 24" width="48" height="48">
                    <path d="M9 11H3v2h6m-6 4h6m12-4h-6m6 4h-6m-4-6V3h2v8m-2 6v6h2v-6" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                <h3>Tidak ada pesanan</h3>
                <p>Belum ada pesanan yang sesuai dengan filter Anda</p>
            </div>
        <?php else: ?>
            <div class="orders-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID Pesanan</th>
                            <th>Pembeli</th>
                            <th>Produk</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Tanggal</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($orders as $order): ?>
                            <tr>
                                <td class="order-id">#<?= $order['order_id'] ?></td>
                                <td><?= htmlspecialchars($order['buyer_name'] ?? 'N/A') ?></td>
                                <td>
                                    <?php if (!empty($order['products'])): ?>
                                        <div class="product-preview">
                                            <?= htmlspecialchars($order['products'][0]['product_name']) ?>
                                            <?php if (count($order['products']) > 1): ?>
                                                <span class="product-count-badge">+<?= count($order['products']) - 1 ?> lainnya</span>
                                            <?php endif; ?>
                                        </div>
                                    <?php else: ?>
                                        <span class="muted">-</span>
                                    <?php endif; ?>
                                </td>
                                <td class="price">Rp <?= number_format($order['total_price'], 0, ',', '.') ?></td>
                                <td>
                                    <span class="status-badge status-<?= $statusColors[$order['status']] ?? 'gray' ?>">
                                        <?= $statusLabels[$order['status']] ?? $order['status'] ?>
                                    </span>
                                </td>
                                <td><?= date('d M Y H:i', strtotime($order['created_at'])) ?></td>
                                <td>
                                    <button class="btn-action" onclick="showOrderDetails(<?= htmlspecialchars(json_encode($order)) ?>)">
                                        <svg viewBox="0 0 24 24" width="16" height="16">
                                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" fill="currentColor"/>
                                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2" fill="none"/>
                                        </svg>
                                        Detail
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <?php if ($pagination['totalPages'] > 1): ?>
                <div class="pagination">
                    <!-- Items per page selector -->
                    <div class="pagination-section">
                        <div class="items-per-page">
                            <label for="itemsPerPage">Tampilkan:</label>
                            <select id="itemsPerPage">
                                <option value="4" <?= isset($_GET['limit']) && $_GET['limit'] == 4 ? 'selected' : '' ?>>4</option>
                                <option value="8" <?= isset($_GET['limit']) && $_GET['limit'] == 8 ? 'selected' : '' ?>>8</option>
                                <option value="12" <?= isset($_GET['limit']) && $_GET['limit'] == 12 ? 'selected' : '' ?>>12</option>
                                <option value="20" <?= isset($_GET['limit']) && $_GET['limit'] == 20 ? 'selected' : '' ?>>20</option>
                            </select>
                        </div>
                        
                        <div class="pagination-info" id="paginationInfo">
                            Menampilkan <?= (($pagination['currentPage'] - 1) * (isset($_GET['limit']) ? (int)$_GET['limit'] : 10)) + 1 ?> 
                            hingga 
                            <?= min($pagination['currentPage'] * (isset($_GET['limit']) ? (int)$_GET['limit'] : 10), $pagination['totalOrders']) ?>
                            dari <?= $pagination['totalOrders'] ?>
                        </div>
                        
                        <div class="pagination-buttons">
                            <?php if ($pagination['currentPage'] > 1): ?>
                                <a href="?page=<?= $pagination['currentPage'] - 1 ?><?= $filters['status'] ? '&status=' . $filters['status'] : '' ?><?= $filters['search'] ? '&search=' . urlencode($filters['search']) : '' ?><?= isset($_GET['limit']) ? '&limit=' . $_GET['limit'] : '' ?>" 
                                   class="pagination-btn">
                                    ← Prev
                                </a>
                            <?php endif; ?>

                            <?php for ($i = 1; $i <= $pagination['totalPages']; $i++): ?>
                                <?php if ($i == $pagination['currentPage']): ?>
                                    <span class="pagination-btn active"><?= $i ?></span>
                                <?php else: ?>
                                    <a href="?page=<?= $i ?><?= $filters['status'] ? '&status=' . $filters['status'] : '' ?><?= $filters['search'] ? '&search=' . urlencode($filters['search']) : '' ?><?= isset($_GET['limit']) ? '&limit=' . $_GET['limit'] : '' ?>" 
                                       class="pagination-btn">
                                        <?= $i ?>
                                    </a>
                                <?php endif; ?>
                            <?php endfor; ?>

                            <?php if ($pagination['currentPage'] < $pagination['totalPages']): ?>
                                <a href="?page=<?= $pagination['currentPage'] + 1 ?><?= $filters['status'] ? '&status=' . $filters['status'] : '' ?><?= $filters['search'] ? '&search=' . urlencode($filters['search']) : '' ?><?= isset($_GET['limit']) ? '&limit=' . $_GET['limit'] : '' ?>" 
                                   class="pagination-btn">
                                    Next →
                                </a>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
</div>

<div id="orderModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Detail Pesanan <span id="modalOrderId"></span></h2>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="order-info">
                <div class="info-item">
                    <strong>Pembeli:</strong>
                    <span id="modalBuyerName"></span>
                </div>
                <div class="info-item">
                    <strong>Status:</strong>
                    <span id="modalStatus"></span>
                </div>
                <div class="info-item">
                    <strong>Total:</strong>
                    <span id="modalTotal" class="price"></span>
                </div>
                <div class="info-item">
                    <strong>Alamat Pengiriman:</strong>
                    <span id="modalAddress"></span>
                </div>
                <div class="info-item">
                    <strong>Tanggal Pesanan:</strong>
                    <span id="modalDate"></span>
                </div>
                <div class="info-item">
                    <strong>Produk:</strong>
                    <ul id="modalProductsList" class="product-list"></ul>
                </div>
            <div class="order-actions" id="orderActions"></div>
        </div>
    </div>
</div>

<script src="/js/pages/order_management.js"></script>