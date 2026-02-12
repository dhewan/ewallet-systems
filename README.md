# vascomm-test

API server untuk keperluan testing dan demo (Vascomm Test).

## Ringkasan
- Bahasa / runtime: Node.js (ES Modules)
- Framework: Express
- ORM: Sequelize (MySQL)

Proyek ini adalah sebuah API sederhana dengan struktur terpisah untuk admin dan user dashboard, menggunakan Sequelize untuk migrasi dan model database.

## Fitur utama
- Routing terpisah untuk `admin` dan `user`
- Otentikasi dasar via middleware bearer
- Migrasi & seeders menggunakan `sequelize-cli`
- Konfigurasi lewat environment variables (`.env`)

## Struktur proyek (ringkas)
- `app.js` - entry point server
- `src/config.js` - konfigurasi aplikasi (membaca `process.env`)
- `src/routes/` - definisi route, file `v1.js` mendaftarkan router
- `src/controllers/` - controller untuk `admin` dan `user`
- `src/services/` - helper external seperti uploader, firebase, mailer
- `db/` - konfigurasi Sequelize, model, migration dan seeders untuk MySQL
- `src/middlewares/` - middleware (bearer, error handler, limiter, dsb)

## Persyaratan
- Node.js 18+ direkomendasikan
- MySQL untuk database

## Instalasi
1. Clone repository
2. Pasang dependencies:

```powershell
npm install
```

3. Buat file `.env` di root (salin dari `.env.example` jika ada) dan atur variabel penting, contohnya:

```
PORT=8080
DB_SERVER=localhost
DB_PORT=3306
DB_NAME=vascomm_test_db
DB_USER=root
DB_PASS=yourpassword
JWT_SECRET=your_jwt_secret
SALT_PASS=your_salt
BEARER_TOKEN=token
```

## Menjalankan aplikasi

Untuk pengembangan (dengan `nodemon`):

```powershell
npm run dev
```

## Database
Proyek menggunakan Sequelize. Contoh perintah:

```powershell
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

File migrasi dan model MySQL berada di `db/mysql/migrations` dan `db/mysql/models`.

## Endpoint utama (ringkasan)
- `POST /auth/...` - endpoint authentication (lihat `src/routes/auth.js`)
- `GET/POST /produk` - endpoint produk untuk user (lihat `src/routes/user.js` dan controllers)
- `GET/POST /admin/produk` - endpoint produk untuk admin
- `GET/POST /user` - endpoint user (admin area di `/admin/user`)

Daftar lengkap route ada di `src/routes/`.

## Kontribusi
- Ikuti standar linting (`npm run lint`) dan pre-commit hooks (husky) jika diaktifkan.

## Debugging & Logging
- Aplikasi memakai `morgan` untuk logging request.
- Error handler global berada di `src/middlewares/error.js`.

## Catatan
- `Object` dan file konfigurasi menggunakan environment variables, pastikan `.env` terkonfigurasi.
- Jika Anda butuh contoh request/response atau Postman collection, beri tahu saya dan saya buatkan.

