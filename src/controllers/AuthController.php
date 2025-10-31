<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\View;
use App\Core\Session;
use App\Services\AuthService;
use Exception;

class AuthController {
    private AuthService $auth_service;
    private View $view;

    public function __construct() {
        $this->auth_service = new AuthService();
        $this->view = new View();
    }

    public function showLoginPage(Request $request): void {
        $styles = [
            '/css/components/navbar_auth.css',
            '/css/pages/auth.css'
        ];

        $scripts = [
            '/js/pages/login.js'
        ];

        $this->view->setData('pageTitle', 'Login | Nimonspedia');
        $this->view->setData('pageStyles', $styles);
        $this->view->setData('pageScripts', $scripts);
        $this->view->setData('navbarFile', 'components/navbar_auth.php');

        $this->view->renderPage('pages/login.php');
    }

    public function handleLogin(Request $request): void {
        $data = $request->getBody();

        try {
            $this->auth_service->login($data);
            
            Session::set('toast', [
                'message' => 'Login berhasil!',
                'type' => 'success'
            ]);

            header('Location: /');

        } catch (Exception $e) {
            Session::set('toast', [
                'message' => $e->getMessage(),
                'type' => 'error'
            ]);

            header('Location: /login');
        }
    }

    public function handleLogout(Request $request): void {
        Session::destroy();
        header('Location: /login');
    }

    public function showRegisterPage(Request $request): void {
        $styles = [
            '/css/components/navbar_auth.css',
            '/css/pages/auth.css',
            'https://cdn.jsdelivr.net/npm/quill@2.0.0/dist/quill.snow.css'
        ];
        $scripts = [
            'https://cdn.jsdelivr.net/npm/quill@2.0.0/dist/quill.js',
            '/js/pages/register.js'
        ];

        $old_data = Session::get('old_data');
        Session::delete('old_data');

        $this->view->setData('pageTitle', 'Daftar | Nimonspedia');
        $this->view->setData('pageStyles', $styles);
        $this->view->setData('pageScripts', $scripts);
        $this->view->setData('navbarFile', 'components/navbar_auth.php');
        $this->view->setData('old', $old_data);

        $this->view->renderPage('pages/register.php');
    }

    public function handleRegister(Request $request): void {
        $data = $request->getBody();
        $files = $request->getFiles();

        try {
            $this->auth_service->register($data, $files);

            Session::set('toast', [
                'message' => 'Registrasi berhasil! Selamat datang.',
                'type' => 'success'
            ]);

            $role = Session::get('role');
            if ($role === 'SELLER') {
                header('Location: /seller/dashboard');
            } else {
                header('Location: /');
            }

        } catch (Exception $e) {
            Session::set('toast', [
                'message' => $e->getMessage(),
                'type' => 'error'
            ]);
            Session::set('old_data', $data);

            header('Location: /register');
        }
    }
}

