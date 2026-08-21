# Tinggo (Ticket Kanggo) - Task Management System

Tinggo adalah aplikasi **Task Management System** *full-stack* modern yang memungkinkan pengguna untuk mengelola tugas-tugas pribadi mereka secara terorganisir. Aplikasi ini dibangun untuk memenuhi kualifikasi *Technical Test: Fullstack Web Developer* dengan mengadopsi standar pengembangan *startup* modern.

## 🚀 Fitur Utama (Minimal Viable Product & Nilai Plus)
- **Autentikasi Aman:** Registrasi & Login dengan JWT dan *Bcrypt Password Hashing*.
- **CRUD Tugas:** Buat, Baca, Perbarui, dan Hapus (beserta detail judul, deskripsi, status, dan *deadline*).
- **Filter & Live Search:** Pencarian *real-time* dengan sistem pembatalan laju (*debouncing*) dan penyaringan berdasarkan status (*Pending, In-Progress, Done*).
- **Pagination Cerdas:** Sistem penomoran halaman dengan *keepPreviousData* (mencegah kedipan antarmuka saat memuat).
- **Optimistic UI Updates:** Aplikasi merespons seketika saat data ditambah, diubah, atau dihapus seolah-olah tanpa *delay* dari *server*.
- **Validasi Ketat (End-to-End):** Validasi berlapis dari klien (React Hook Form + Zod) hingga *server* (Zod Middleware).
- **UX Premium:** Didesain *pixel-perfect* menggunakan Tailwind CSS & Shadcn UI, serta notifikasi responsif (Sonner).
- **Dokumentasi API:** Tersedia melalui OpenAPI/Swagger.

---

## 🛠️ Tech Stack

| Bagian | Teknologi |
| :--- | :--- |
| **Backend API** | Node.js (Express.js) |
| **Frontend** | React.js dengan Hooks (TanStack Start & Vite) |
| **Database** | MySQL (menggunakan `mysql2/promise`) |
| **Autentikasi** | JSON Web Token (JWT) + bcrypt |
| **UI & Styling** | Tailwind CSS + Shadcn UI + Lucide Icons |
| **Testing** | Jest (Middlewares Unit Testing) |
| **Infrastruktur**| Docker & Docker Compose (Opsional) |

---

## ⚙️ Petunjuk Menjalankan Aplikasi (Lokal)

### 1. Prasyarat
- **Node.js** (versi 18+)
- **MySQL Server** (atau Docker jika menggunakan kontainer)
- **Git**

### 2. Konfigurasi Backend & Database
1. Buka terminal dan masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Konfigurasi *Environment*:
   - Gandakan (copy) file `.env.example` dan ubah namanya menjadi `.env`.
   - Sesuaikan konfigurasi kredensial MySQL Anda:
     ```env
     PORT=5000
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=password_anda
     DB_NAME=task_management
     JWT_SECRET=super_secret_key_anda
     ```
4. Inisialisasi Database:
   - Buat database MySQL dengan nama `task_management` (atau sesuai konfigurasi).
   - Jalankan *query* yang terdapat pada file `backend/schema.sql` di sistem basis data Anda untuk membuat tabel yang dibutuhkan.
5. Jalankan server backend:
   ```bash
   npm run dev
   ```
   > **Dokumentasi API (Swagger)** dapat diakses di: `http://localhost:5000/api-docs`

### 3. Konfigurasi Frontend
1. Buka tab terminal baru dan masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Jalankan server frontend:
   ```bash
   npm run dev
   ```
4. Buka browser dan akses aplikasi di: `http://localhost:5173`

---

## 🐳 Menjalankan dengan Docker (Opsional)

Jika Anda ingin menjalankan aplikasi + database sekaligus tanpa repot instalasi konfigurasi secara manual, Anda bisa menggunakan Docker Compose.

1. Pastikan **Docker** dan **Docker Compose** sudah terinstal.
2. Dari struktur paling luar (*root* folder repository), jalankan:
   ```bash
   docker-compose up -d --build
   ```
3. Aplikasi Frontend, Backend API, dan Database MySQL akan otomatis berjalan terisolasi di dalam kontainer.

---

## 📷 Screenshot Tampilan (Opsional)

*(Silakan tambahkan URL/Gambar tampilan layar aplikasi Anda di sini sebelum disubmit)*

---

*Hak Cipta © 2026 Tinggo / Kanggo Test.*
