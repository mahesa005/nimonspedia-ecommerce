<?php
use App\Core\Auth;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title><?php echo $pageTitle ?? 'Nimonspedia'; ?></title>

    <!-- TODO: Add global css? -->
    <?php echo $pageStyles ?? ''; ?>
</head>
<body>

    <?php
    if (isset($navbarFile) && file_exists(__DIR__ . '/' . $navbarFile)) {
        require __DIR__ . '/' . $navbarFile;
    }
    ?>

    <main>
        <?php echo $content; ?>
    </main>

    <!-- TODO: Add global js? -->
    <?php echo $pageScripts ?? ''; ?>

</body>
</html>