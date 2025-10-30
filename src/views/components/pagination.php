<?php

if ($total_pages <= 1) {
    return; 
}

$range = 2; 
$start = max(1, $current_page - $range);
$end = min($total_pages, $current_page + $range);

?>
<div class="pagination-controls">
    <button class="pagination-btn" 
            data-page="<?php echo $current_page - 1; ?>" 
            <?php echo ($current_page <= 1) ? 'disabled' : ''; ?>>
        « Prev
    </button>

    <?php 
    if ($start > 1): ?>
        <button class="pagination-btn" data-page="1">1</button>
        <?php if ($start > 2): ?>
            <span class="pagination-ellipsis">...</span>
        <?php endif; ?>
    <?php endif; ?>

    <?php 
    for ($i = $start; $i <= $end; $i++): ?>
        <button class="pagination-btn <?php echo ($i == $current_page) ? 'active' : ''; ?>" 
                data-page="<?php echo $i; ?>">
            <?php echo $i; ?>
        </button>
    <?php endfor; ?>

    <?php 
    if ($end < $total_pages): ?>
        <?php if ($end < $total_pages - 1): ?>
            <span class="pagination-ellipsis">...</span>
        <?php endif; ?>
        <button class="pagination-btn" data-page="<?php echo $total_pages; ?>">
            <?php echo $total_pages; ?>
        </button>
    <?php endif; ?>

    <button class="pagination-btn" 
            data-page="<?php echo $current_page + 1; ?>" 
            <?php echo ($current_page >= $total_pages) ? 'disabled' : ''; ?>>
        Next »
    </button>
</div>