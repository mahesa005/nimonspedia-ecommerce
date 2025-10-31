<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\View;
use App\Core\Session;
use App\Services\AuthService;
use Exception;

class TestController {
    private View $view;

    public function __construct() {
        $this->view = new View();
    }

    public function showTestPage(Request $request): void {
        $styles = [
            '/css/components/navbar_auth.css',
        ];

        $this->view->setData('pageTitle', 'Test | Nimonspedia');
        $this->view->setData('pageStyles', $styles);
        $this->view->setData('pageScripts', $scripts);
        $this->view->setData('navbarFile', 'components/navbar_auth.php');

        $this->view->renderPage('pages/auth/test.php');
    }
}