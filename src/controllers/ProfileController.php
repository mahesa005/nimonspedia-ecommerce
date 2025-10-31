<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\View;
use App\Services\ProfileService;

class ProfileController {
    
    private ProfileService $profileService;

    public function __construct() {
        $this->profileService = new \App\Services\ProfileService();
    }

    public function showPage() {
        $buyer_id = Auth::id();
        $user = $this->profileService->getProfile($buyer_id);

        if (!$user) {
            View::render('pages/404');
            return;
        }

        $view = new View();
        $view->setData('pageTitle', 'Profil Saya');
        $view->setData('pageStyles', ['/css/pages/profile.css']);
        $view->setData('pageScripts', ['/js/pages/profile.js']);
        $view->setData('navbarFile', 'components/navbar_buyer.php');
        $view->setData('user', $user);
        $view->renderPage('pages/profile.php');
    }

    public function update() {
        header('Content-Type: application/json; charset=utf-8');
        
        $buyer_id = Auth::id();
        $name = $_POST['name'] ?? '';
        $address = $_POST['address'] ?? '';

        try {
            $this->profileService->updateProfile($buyer_id, $name, $address);
            echo json_encode(['success' => true, 'message' => 'Profil berhasil diperbarui.']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    public function changePassword() {
        header('Content-Type: application/json; charset=utf-8');
        
        $buyer_id = Auth::id();
        $old_pass = $_POST['old_password'] ?? '';
        $new_pass = $_POST['new_password'] ?? '';
        $confirm_pass = $_POST['confirm_password'] ?? '';

        try {
            $this->profileService->changePassword($buyer_id, $old_pass, $new_pass, $confirm_pass);
            echo json_encode(['success' => true, 'message' => 'Password berhasil diubah.']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }
}
