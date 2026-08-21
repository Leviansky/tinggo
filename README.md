# Tinggo (Ticket Kanggo) - Task Management System

Tinggo adalah aplikasi **Task Management System** *full-stack* modern yang memungkinkan pengguna untuk melacak, mengelola, dan menyelesaikan tugas-tugas dengan mudah. Aplikasi ini dibangun dengan standar arsitektur *startup* menggunakan perpaduan React (Vite & TanStack), Node.js, Express, dan MySQL.

## 🚀 Deskripsi Singkat Aplikasi
Aplikasi ini memisahkan sistem menjadi dua bagian utama (*Frontend* dan *Backend*) yang berkomunikasi via REST API. Fitur utamanya meliputi:
- **Autentikasi (JWT):** Login dan Register dengan *password hashing* bcrypt.
- **CRUD Task:** Membuat, membaca, memperbarui status, dan menghapus tugas.
- **Pencarian & Filter:** Filter tugas berdasarkan status (*Pending, In Progress, Done*) dan fitur pencarian secara *real-time*.
- **Modern UI/UX:** Tampilan responsif dan rapi berkat Tailwind CSS dan komponen Radix UI.

---

## 🛠️ Petunjuk Menjalankan Backend

### 1. Prasyarat & Instalasi
- Pastikan Anda sudah menginstal **Node.js** (v18+) dan **MySQL Server**.
- Buka terminal, masuk ke folder backend, lalu jalankan perintah instalasi:
  ```bash
  cd backend
  npm install
  ```

### 2. Setup Database MySQL
- Masuk ke MySQL di komputer Anda (melalui CLI atau *tools* seperti phpMyAdmin / DBeaver).
- Buat *database* baru, contoh:
  ```sql
  CREATE DATABASE task_management;
  ```
- Ekspor/jalankan semua *query* yang ada di dalam file `backend/schema.sql` untuk membuat tabel `users` dan `tasks`.

### 3. Setup Environment Variables (.env)
- Di dalam folder `backend`, buat sebuah file bernama `.env`.
- Salin kode berikut ke dalamnya dan ubah kredensial `DB_USER` dan `DB_PASSWORD` sesuai dengan MySQL Anda:
  ```env
  PORT=5000
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=password_anda
  DB_NAME=task_management
  JWT_SECRET=rahasia_super_aman_123
  ```

### 4. Menjalankan Backend Server
- Jalankan *server* dalam mode *development*:
  ```bash
  npm run dev
  ```
- *Backend* akan menyala di `http://localhost:5000`.

---

## 💻 Petunjuk Menjalankan Frontend

### 1. Prasyarat & Instalasi
- Buka terminal baru (biarkan terminal *backend* tetap berjalan).
- Masuk ke folder frontend dan jalankan instalasi:
  ```bash
  cd frontend
  npm install
  ```

### 2. Setup Environment Variables (.env)
- Di dalam folder `frontend`, buat file `.env`.
- Masukkan URL API yang mengarah ke *backend*:
  ```env
  VITE_API_URL=http://localhost:5000/api
  ```

### 3. Menjalankan Frontend Server
- Jalankan *server* frontend:
  ```bash
  npm run dev
  ```
- Buka *browser* Anda dan akses `http://localhost:5173`.

---

## 📖 Link Dokumentasi API

Tinggo dilengkapi dengan dokumentasi API otomatis berstandar OpenAPI (Swagger).
Anda dapat membaca dan mencoba API secara interaktif melalui URL berikut (pastikan backend sudah berjalan):

👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

*Di halaman ini, Anda bisa melakukan Authorize menggunakan Token JWT dan mencoba request secara langsung.*

---

## 📷 Screenshot Tampilan

*(Opsional: Berikut adalah gambaran tampilan aplikasi Tinggo)*

| Halaman Login | Halaman Dashboard (Task List) |
| :---: | :---: |
| *(Silakan ganti teks ini dengan Screenshot Login)* | *(Silakan ganti teks ini dengan Screenshot Dashboard)* |
| Halaman Registrasi | Dokumentasi API (Swagger) |
| *(Silakan ganti teks ini dengan Screenshot Register)* | *(Silakan ganti teks ini dengan Screenshot Swagger)* |

---
*Dibuat untuk keperluan Technical Assessment Fullstack Web Developer.*
