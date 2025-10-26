<?php
use App\Core\Auth;
use App\Core\Session;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title><?php echo $pageTitle ?? 'Nimonspedia'; ?></title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@200..1000&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/global.css">
    <link rel="stylesheet" href="/css/components/toast.css">
    <?php
        if (isset($pageStyles) && is_array($pageStyles)):
            foreach ($pageStyles as $style_path):
        ?>
            <link rel="stylesheet" href="<?php echo $style_path; ?>">
        <?php
            endforeach;
        endif;
    ?>
</head>
<body>

    <?php
    if (isset($navbarFile)) {
        $navbarPath = __DIR__ . '/../' . $navbarFile;

        if (file_exists($navbarPath)) {
            require $navbarPath;
        } else {
            echo "<!-- Navbar file not found: $navbarFile -->";
        }
    }
    ?>

    <main>
        <?php echo $content; ?>
    </main>

    <script src="/js/modules/toast.js"></script>
    <script>
        <?php
        $toast = Session::get('toast');
        if ($toast) {
            echo 'document.addEventListener("DOMContentLoaded", function() {';
            echo 'showToast(' . json_encode($toast['message']) . ', ' . json_encode($toast['type']) . ');';
            echo '});';
            Session::delete('toast');
        }
        ?>
    </script>
    <?php
        if (isset($pageScripts) && is_array($pageScripts)):
            foreach ($pageScripts as $script_path):
    ?>
            <script src="<?php echo $script_path; ?>" defer></script>
    <?php
            endforeach;
        endif;
    ?>

</body>
</html>