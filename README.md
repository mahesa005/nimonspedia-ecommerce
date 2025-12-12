# Nimonspedia - Tugas Besar Milestone 2 IF3110

---

## 1. Deskripsi Aplikasi Web

Nimonspedia pada awalnya adalah aplikasi e-commerce *full-stack* sederhana (Milestone 1). Kini, Nimonspedia telah bertransformasi menjadi aplikasi web **Hybrid Modern** untuk memenuhi kebutuhan **Milestone 2 IF3110**.

Aplikasi ini menggabungkan arsitektur monolitik PHP tradisional dengan layanan mikro modern berbasis Node.js dan antarmuka dinamis Single Page Application (SPA).

### Arsitektur Hybrid

* **Legacy Core (PHP):** Menangani logika bisnis dasar seperti manajemen produk, toko, dan profil pengguna menggunakan PHP murni.
* **Modern Service (Node.js):** Menangani fitur real-time, concurrency tinggi, dan logika kompleks seperti Lelang (Auction), Chat, dan Notifikasi menggunakan Express.js dan TypeScript.
* **Frontend Hybrid:**
  * **MPA (Multi Page Application):** Menggunakan HTML/CSS/JS Native untuk halaman statis dan SEO-friendly.
  * **SPA (Single Page Application):** Menggunakan **React** untuk modul interaktif seperti halaman Lelang, Chat Room, dan Admin Dashboard.

Seluruh lingkungan dijalankan di atas **Docker** dengan orkestrasi **Docker Compose**.

---

## 2. Fitur Utama

### Fitur Milestone 1 (Legacy) (Enhanced)

* **Buyer & Seller Role:** Manajemen akun dan toko terpisah.
* **Katalog & Pencarian:** Browsing produk dengan sorting dan filtering.
* **Transaksi:** Shopping cart, checkout, dan order history.
* **CRUD Produk:** Manajemen inventaris toko.

### Fitur Milestone 2 (New)

1. **Sistem Lelang (Auction) Real-time**
    * Mekanisme bidding real-time menggunakan WebSocket.
    * Countdown timer yang sinkron di semua klien.
    * Penentuan pemenang otomatis.
2. **Real-time Chat**
    * Komunikasi langsung antara Buyer dan Seller.
    * Indikator status pesan (sent/read).
3. **Cross-Platform Notifications**
    * Notifikasi real-time (In-App) via WebSocket.
    * Web Push Notifications menggunakan Service Workers (bisa diterima saat browser tertutup).
4. **Admin Panel & Feature Flags**
    * Panel admin khusus berbasis React.
    * **Feature Flags:** Kemampuan mematikan/menyalakan fitur krusial (seperti Checkout, Auction, Chat) secara dinamis tanpa restart server/re-deploy.

---

## 3. Daftar Kebutuhan (Requirements)

* **Docker Engine** & **Docker Compose** (Wajib)
* Browser modern dengan dukungan JavaScript dan Service Workers.

---

## 4. Cara Instalasi & Menjalankan

Ikuti langkah-langkah ini untuk menyiapkan proyek:

1. Klon repositori ini ke mesin lokal Anda:

    ```bash
    git clone https://github.com/Labpro-22/milestone-1-tugas-besar-if-3110-web-based-development-k03-12.git

    cd milestone-1-tugas-besar-if-3110-web-based-development-k03-12
    ```

2. Salin file konfigurasi *environment* dari *template* yang disediakan:

    ```bash
    cp .env.example .env
    ```

---

3. **Jalankan dengan Docker**

Setelah instalasi selesai, ikuti langkah-langkah ini untuk menjalankan aplikasi:

1. Membangun dan jalankan semua layanan (Nginx, PHP, PostgreSQL) dalam mode *detached* (latar belakang):

    ```bash
    docker compose up -d --build
    ```

2. Aplikasi web sekarang dapat diakses melalui browser di:
    `http://localhost:8080`

**Perintah Docker Compose Lainnya:**

* **Untuk Menghentikan Aplikasi:**
  (Menjalankan ini tidak akan menghapus data database Anda).

  ```bash
  docker compose down
  ```

* **Untuk Menghentikan Aplikasi DAN Menghapus Volume Database:**
  (Gunakan ini jika Anda ingin melakukan *reset* total dan menjalankan ulang *seeding* database).

  ```bash
  docker compose down -v
  ```

---

4. **Akses Aplikasi**
    * **Web App:** `http://localhost:8080`
    * **Admin Login:** Gunakan kredensial `luthor@lexcorp.com` / `admin123` (atau sesuai seeding).

## 5. Konfigurasi Khusus (Milestone 2)

### Feature Flags (Admin)

Admin dapat mengakses endpoint/halaman khusus untuk mengaktifkan atau menonaktifkan fitur:

* `auction_enabled`: Mengaktifkan menu lelang.
* `chat_enabled`: Mengaktifkan fitur chat.
* `checkout_enabled`: Mengizinkan transaksi checkout.

### Service Workers

Untuk fitur Push Notification, pastikan browser Anda mengizinkan notifikasi dari `localhost:8080`.

---

## 6. Tangkapan Layar Aplikasi

Berikut adalah tangkapan layar untuk halaman-halaman utama yang diimplementasikan:

### Halaman Buyer

* **Halaman Login**
  ![Halaman Login](image/pages/login_page.png "Halaman Login")

* **Halaman Register**
  ![Halaman Register](image/pages/register_page.png "Halaman Register")

* **Halaman Product Discovery (Home)**
  ![Halaman Product Discovery](image/pages/Product_discovery.png "Halaman Product Discover")

* **Halaman Detail Produk**
  ![Halaman Detail Produk](image/pages/detail_produk.png "Halaman Detail Produk")

* **Halaman Detail Store**
  ![Halaman Detail Store](image/pages/store_detail.png "Halaman Detail Store")

* **Halaman Shopping Cart**
  ![Halaman Shopping Cart](image/pages/cart.png "Halaman Shopping Cart")

* **Halaman Checkout**
  ![Halaman Checkout](image/pages/checkout.png "Halaman Checkout")

* **Halaman Order History**
  ![Halaman Order History](image/pages/order_history.png "Halaman Order History")
  ![Halaman Order History](image/pages/order_history_detail.png)
* **Halaman Profile**
  ![Halaman Profile](image/pages/profile.png "Halaman Profile")

* **Halaman TopUp**
  ![Halaman TopUp](image/pages/topup.png "Halaman TopUp")

* **Halaman Auction**
  ![Halaman Auction](image/pages/auction_list.jpg "Halaman Auction")

* **Halaman Chat**
  ![Halaman Chat](image/pages/chat.jpg "Halaman Chat")

### Halaman Seller

* **Halaman Dashboard (Seller)**
  ![Halaman Dashboard (Seller)](image/pages/dashboard_seller.png "Halaman Dashboard Seller")

* **Halaman Product Management (Seller)**
  ![Halaman Product Management (Seller)](image/pages/product_management.png "Halaman Product Management (Seller)")

* **Halaman Order Management (Seller)**
  ![Halaman Order Management (Seller)](image/pages/order_management.png "Halaman Order Management (Seller)")
  ![Halaman Order Management (Seller)](image/pages/seller_orders.png)

* **Halaman Add Product (Seller)**
  ![Halaman Add Product (Seller)](image/pages/products_add.png "Halaman Add Product (Seller)")

* **Halaman Edit Product (Seller)**
  ![Halaman Edit Product (Seller](image/pages/seller_products_edit.png "Halaman Edit Product (Seller")

---

## 7. Pembagian Tugas

**Anggota Tim:**

* **13523134 - Sebastian Enrico Nathanael**
* **13523140 - Mahesa Fadhillah Andre**
* **13523152 - Muhammad Kinan Arkansyaddad**

(Silakan isi detail pembagian tugas di bawah ini)

### Server-side

* **Login :** ...
* **Register :** ...
* **Auction Logic :** ...
* **Chat:** ...

### Client-side

* **Login :** ...
* **Register :** ...
* **Auction Pages :** ...
* **Chat Pages :** ...
* **Admin Dashboard :** ...

---

## 8. Bonus

* **All Responsive Web Design**
* **UI/UX Seperti Tokopedia**
* **Google Lighthouse** (Performance > 80, Accessibility > 90)

## 9. Lighthouse Scores

### Google Lighthouse

* ![alt text](docs/lighthouse/l1.png)
* ![alt text](docs/lighthouse/l2.png)
* ![alt text](docs/lighthouse/l3.png)
* ![alt text](docs/lighthouse/l4.png)
* ![alt text](docs/lighthouse/l5.png)
* ![alt text](docs/lighthouse/l6.png)
* ![alt text](docs/lighthouse/l7.png)
* ![alt text](docs/lighthouse/l8.png)
* ![alt text](docs/lighthouse/l9.png)
* ![alt text](docs/lighthouse/l10.png)
* ![alt text](docs/lighthouse/l11.png)
* ![alt text](docs/lighthouse/l12.png)

**Nilai accesibility rendah disebabkan oleh 3rd party rich text editor**

* ![alt text](docs/lighthouse/l13.png)

**Nilai accesibility rendah disebabkan oleh 3rd party rich text editor**

* ![alt text](docs/lighthouse/l14.png)

---
