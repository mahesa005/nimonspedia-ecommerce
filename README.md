# Nimonspedia - Tugas Besar Milestone 1 IF3110

---

## 1. Deskripsi Aplikasi Web

Nimonspedia adalah aplikasi web e-commerce _full-stack_ yang dibangun untuk memenuhi Tugas Besar Milestone 1 mata kuliah IF3110. Aplikasi ini adalah sebuah _marketplace_ yang terinspirasi dari Tokopedia.

Aplikasi ini mengimplementasikan arsitektur **Layered MVC (Model-View-Controller)**. Sisi _server-side_ dibangun menggunakan **PHP murni** tanpa _framework_ eksternal (seperti Laravel), sedangkan _client-side_ dibangun menggunakan **JavaScript, HTML, dan CSS murni** tanpa _framework_ (seperti React) atau _library_ (seperti jQuery/Bootstrap).

Seluruh lingkungan pengembangan dan produksi dikelola menggunakan **Docker**, dengan **PostgreSQL** sebagai basis data relasional.

Fitur utama aplikasi mencakup dua peran pengguna yang berbeda:

- **Buyer:** Dapat mendaftar, login, menjelajahi produk, melihat detail produk, menambah item ke keranjang belanja, melakukan _top-up_ saldo, melakukan _checkout_, dan melihat riwayat pesanan.
- **Seller:** Dapat mendaftar sebagai penjual (termasuk membuat toko), login, mengelola profil toko, mengelola produk, dan mengelola pesanan yang masuk.

---

## 2. Daftar Kebutuhan (Requirements)

Untuk menjalankan proyek ini di lingkungan lokal, Anda hanya memerlukan perangkat lunak berikut:

- **Docker Engine**
- **Docker Compose**
- Browser Web modern (Google Chrome, Firefox, Safari, Edge)
- File `.env` yang dibuat dengan menyalin `.env.example`.

---

## 3. Cara Instalasi

Ikuti langkah-langkah ini untuk menyiapkan proyek:

1.  Klon repositori ini ke mesin lokal Anda:

    ```bash
    git clone https://github.com/Labpro-22/milestone-1-tugas-besar-if-3110-web-based-development-k03-12.git
    cd milestone-1-tugas-besar-if-3110-web-based-development-k03-12
    ```

2.  Salin file konfigurasi _environment_ dari _template_ yang disediakan:
    ```bash
    cp .env.example .env
    ```

---

## 4. Cara Menjalankan Server

Setelah instalasi selesai, ikuti langkah-langkah ini untuk menjalankan aplikasi:

1.  Bangun dan jalankan semua layanan (Nginx, PHP, PostgreSQL) dalam mode _detached_ (latar belakang):

    ```bash
    docker compose up -d --build
    ```

    - Pada saat _booting_ pertama, skrip `database/db_schema.sql` akan dieksekusi secara otomatis untuk membuat skema tabel dan melakukan _seeding_ data awal (kategori dan produk _dummy_).

2.  Aplikasi web sekarang dapat diakses melalui browser di:
    `http://localhost:8080`

**Perintah Docker Compose Lainnya:**

- **Untuk Menghentikan Aplikasi:**
  (Menjalankan ini tidak akan menghapus data database Anda).

  ```bash
  docker compose down
  ```

- **Untuk Menghentikan Aplikasi DAN Menghapus Volume Database:**
  (Gunakan ini jika Anda ingin melakukan _reset_ total dan menjalankan ulang _seeding_ database).
  ```bash
  docker compose down -v
  ```

---

## 5. Tangkapan Layar Aplikasi

Berikut adalah tangkapan layar untuk halaman-halaman utama yang diimplementasikan:

### Halaman Buyer

- **Halaman Login**
  ![Halaman Login](image/pages/login_page.png "Halaman Login")

- **Halaman Register**
  ![Halaman Register](image/pages/register_page.png "Halaman Register")

- **Halaman Product Discovery (Home)**
  ![Halaman Product Discovery](image/pages/Product_discovery.png "Halaman Product Discover")

- **Halaman Detail Produk**
  ![Halaman Detail Produk](image/pages/detail_produk.png "Halaman Detail Produk")

- **Halaman Shopping Cart**
  ![Halaman Shopping Cart](image/pages/cart.png "Halaman Shopping Cart")

- **Halaman Checkout**
  ![Halaman Checkout](image/pages/checkout.png "Halaman Checkout")

- **Halaman Order History**
  ![Halaman Order History](image/pages/order_history.png "Halaman Order History")
  ![Halaman Order History](image/pages/order_history_detail.png)
- **Halaman Profile**
  ![Halaman Profile](image/pages/profile.png "Halaman Profile")

- **Halaman TopUp**
  ![Halaman TopUp](image/pages/topup.png "Halaman TopUp")

### Halaman Seller

- **Halaman Dashboard (Seller)**
  ![Halaman Dashboard (Seller)](image/pages/dashboard_seller.png "Halaman Dashboard Seller")

- **Halaman Product Management (Seller)**
  ![Halaman Product Management (Seller)](image/pages/product_management.png "Halaman Product Management (Seller)")

- **Halaman Order Management (Seller)**
  ![Halaman Order Management (Seller)](image/pages/order_management.png "Halaman Order Management (Seller)")
  ![Halaman Order Management (Seller)](image/pages/seller_orders.png)

- **Halaman Add Product (Seller)**
  ![Halaman Add Product (Seller)](image/pages/products_add.png "Halaman Add Product (Seller)")

- **Halaman Edit Product (Seller)**
  ![Halaman Edit Product (Seller](image/pages/seller_products_edit.png "Halaman Edit Product (Seller")

---

## 6. Pembagian Tugas

**Anggota Tim:**

- **13523134 - Sebastian Enrico Nathanael**
- **13523140 - Mahesa Fadhillah Andre**
- **13523152 - Muhammad Kinan Arkansyaddad**

### Server-side (PHP)

- **Core & Arsitektur:** 13523152
- **Login:** 13523152
- **Register:** 13523152
- **Home/Product Disovery:** 13523152
- **Detail Product:** 13523152
- **Detail Store:** 13523152
- **Shopping Cart (Buyer):** 13523134
- **Checkout (Buyer):** 13523152
- **Order History (Buyer):** 13523134
- **Profile (Buyer):** 13523134
- **Dashboard (Seller):** 13523140
- **Product Management (Seller):** 13523140
- **Add Product (Seller):** 13523140
- **Edit Product (Seller):** 13523140
- **Order Management (Seller):** 13523140

### Client-side (HTML/CSS/JS)

- **Core & Arsitektur:** 13523152
- **Login:** 13523152
- **Register:** 13523152
- **Home/Product Disovery:** 13523152
- **Detail Product:** 13523152
- **Detail Store:** 13523152
- **Shopping Cart (Buyer):** 13523134
- **Checkout (Buyer):** 13523152
- **Order History (Buyer):** 13523134
- **Profile (Buyer):** 13523134
- **Dashboard (Seller):** 13523140
- **Product Management (Seller):** 13523140
- **Add Product (Seller):** 13523140
- **Edit Product (Seller):** 13523140
- **Order Management (Seller):** 13523140
