# ERD & API Contract: Task Management System

## 1. Entity Relationship Diagram (ERD)

**Tabel `users`** (Satu pengguna bisa memiliki banyak tugas)
- `id` (INT, PK, Auto Increment)
- `name` (VARCHAR(100), Not Null)
- `email` (VARCHAR(100), Unique, Not Null)
- `password` (VARCHAR(255), Not Null, Hashed)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Tabel `tasks`** (Satu tugas dimiliki oleh satu pengguna)
- `id` (INT, PK, Auto Increment)
- `user_id` (INT, FK -> users.id, On Delete Cascade)
- `title` (VARCHAR(255), Not Null)
- `description` (TEXT, Nullable)
- `status` (ENUM('pending', 'in-progress', 'done'), Default 'pending')
- `deadline` (DATE, Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

*(Relasi: 1 to Many antara users dan tasks)*

---

## 2. API Contract

Base URL: `/api`

### Autentikasi (Public)

#### **POST /api/auth/register**
Mendaftarkan pengguna baru.
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "secretpassword"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "User registered successfully",
    "user": { "id": 1, "name": "John Doe", "email": "johndoe@example.com" }
  }
  ```

#### **POST /api/auth/login**
Login pengguna dan mendapatkan token.
- **Request Body:**
  ```json
  {
    "email": "johndoe@example.com",
    "password": "secretpassword"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
  ```

---

### Manajemen Tugas (Protected - Memerlukan Header `Authorization: Bearer <token>`)

#### **GET /api/tasks**
Mendapatkan daftar tugas milik user yang sedang login.
- **Query Params (Opsional - Nilai Plus):**
  - `status`: `pending` | `in-progress` | `done` (Filter berdasarkan status)
  - `search`: Keyword (Pencarian berdasarkan judul tugas)
  - `page`: Nomor halaman (Pagination)
  - `limit`: Jumlah tugas per halaman (Pagination)
- **Response (200 OK):**
  ```json
  {
    "data": [
      {
        "id": 1,
        "title": "Mengerjakan Test Kanggo",
        "description": "Membuat aplikasi Task Management",
        "status": "pending",
        "deadline": "2023-12-31"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10
    }
  }
  ```

#### **POST /api/tasks**
Membuat tugas baru.
- **Request Body:**
  ```json
  {
    "title": "Mengerjakan Test Kanggo",
    "description": "Membuat aplikasi Task Management",
    "status": "pending",
    "deadline": "2023-12-31"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "Task created successfully",
    "data": { "id": 1, "title": "Mengerjakan Test Kanggo", ... }
  }
  ```

#### **PUT /api/tasks/:id**
Memperbarui tugas yang ada berdasarkan ID.
- **Request Body (Semua opsional):**
  ```json
  {
    "title": "Mengerjakan Test Kanggo Update",
    "status": "in-progress",
    "deadline": "2023-12-25"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Task updated successfully",
    "data": { ... }
  }
  ```

#### **DELETE /api/tasks/:id**
Menghapus tugas berdasarkan ID.
- **Response (200 OK):**
  ```json
  {
    "message": "Task deleted successfully"
  }
  ```
