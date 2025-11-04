# Nimonspedia - Tugas Besar Milestone 1 IF3110

---

## 1. Deskripsi Aplikasi Web

Nimonspedia adalah aplikasi web e-commerce *full-stack* yang dibangun untuk memenuhi Tugas Besar Milestone 1 mata kuliah IF3110. Aplikasi ini adalah sebuah *marketplace* yang terinspirasi dari Tokopedia.

Aplikasi ini mengimplementasikan arsitektur **Layered MVC (Model-View-Controller)**. Sisi *server-side* dibangun menggunakan **PHP murni** tanpa *framework* eksternal (seperti Laravel), sedangkan *client-side* dibangun menggunakan **JavaScript, HTML, dan CSS murni** tanpa *framework* (seperti React) atau *library* (seperti jQuery/Bootstrap).

Seluruh lingkungan pengembangan dan produksi dikelola menggunakan **Docker**, dengan **PostgreSQL** sebagai basis data relasional.

Fitur utama aplikasi mencakup dua peran pengguna yang berbeda:

* **Buyer:** Dapat mendaftar, login, menjelajahi produk, melihat detail produk, menambah item ke keranjang belanja, melakukan *top-up* saldo, melakukan *checkout*, dan melihat riwayat pesanan.
* **Seller:** Dapat mendaftar sebagai penjual (termasuk membuat toko), login, mengelola profil toko, mengelola produk, dan mengelola pesanan yang masuk.

---

## 2. Daftar Kebutuhan (Requirements)

Untuk menjalankan proyek ini di lingkungan lokal, Anda hanya memerlukan perangkat lunak berikut:

* **Docker Engine**
* **Docker Compose**
* Browser Web modern (Google Chrome, Firefox, Safari, Edge)
* File `.env` yang dibuat dengan menyalin `.env.example`.

---

## 3. Cara Instalasi

Ikuti langkah-langkah ini untuk menyiapkan proyek:

1.  Klon repositori ini ke mesin lokal Anda:
    ```bash
    git clone https://github.com/Labpro-22/milestone-1-tugas-besar-if-3110-web-based-development-k03-12.git
    cd milestone-1-tugas-besar-if-3110-web-based-development-k03-12
    ```

2.  Salin file konfigurasi *environment* dari *template* yang disediakan:
    ```bash
    cp .env.example .env
    ```

---

## 4. Cara Menjalankan Server

Setelah instalasi selesai, ikuti langkah-langkah ini untuk menjalankan aplikasi:

1.  Bangun dan jalankan semua layanan (Nginx, PHP, PostgreSQL) dalam mode *detached* (latar belakang):
    ```bash
    docker compose up -d --build
    ```
    * Pada saat *booting* pertama, skrip `database/db_schema.sql` akan dieksekusi secara otomatis untuk membuat skema tabel dan melakukan *seeding* data awal (kategori dan produk *dummy*).

2.  Aplikasi web sekarang dapat diakses melalui browser di:
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

## 5. Tangkapan Layar Aplikasi

Berikut adalah tangkapan layar untuk halaman-halaman utama yang diimplementasikan:

### Halaman Buyer
* **Halaman Login**
    *(Placeholder)*

* **Halaman Register**
    *(Placeholder)*

* **Halaman Product Discovery (Home)**
    *(Placeholder)*

* **Halaman Detail Produk**
    *(Placeholder)*

* **Halaman Shopping Cart**
    *(Placeholder)*

* **Halaman Checkout**
    *(Placeholder)*

* **Halaman Order History**
    *(Placeholder)*

### Halaman Seller
* **Halaman Dashboard (Seller)**
    *(Placeholder)*

* **Halaman Product Management (Seller)**
    *(Placeholder)*

* **Halaman Order Management (Seller)**
    *(Placeholder)*

---

## 6. Pembagian Tugas

**Anggota Tim:**
* **13523134 - Sebastian Enrico Nathanael**
* **13523140 - Mahesa Fadhillah Andre**
* **13523152 - Muhammad Kinan Arkansyaddad**

### Server-side (PHP)

* **Core & Arsitektur:** 13523152
* **Login:** 13523152 
* **Register:** 13523152
* **Home/Product Disovery:** 13523152
* **Detail Product:** 13523152
* **Detail Store:** 13523152
* **Shopping Cart (Buyer):** 13523134
* **Checkout (Buyer):** 13523152
* **Order History (Buyer):** 13523134
* **Profile (Buyer):** 13523134
* **Dashboard (Seller):** 13523140 
* **Product Management (Seller):** 13523140
* **Add Product (Seller):** 13523140
* **Edit Product (Seller):** 13523140
* **Order Management (Seller):** 13523140

### Client-side (HTML/CSS/JS)

* **Core & Arsitektur:** 13523152
* **Login:** 13523152 
* **Register:** 13523152
* **Home/Product Disovery:** 13523152
* **Detail Product:** 13523152
* **Detail Store:** 13523152
* **Shopping Cart (Buyer):** 13523134
* **Checkout (Buyer):** 13523152
* **Order History (Buyer):** 13523134
* **Profile (Buyer):** 13523134
* **Dashboard (Seller):** 13523140 
* **Product Management (Seller):** 13523140
* **Add Product (Seller):** 13523140
* **Edit Product (Seller):** 13523140
* **Order Management (Seller):** 13523140