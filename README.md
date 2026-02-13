# E-Wallet System API

API server untuk sistem e-wallet dengan dukungan multi-currency, transaksi, dan manajemen wallet.

## Ringkasan
- **Bahasa/Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: MySQL
- **Validation**: Joi

## Fitur Utama
- 🏦 Multi-currency wallet support
- 💰 Top-up, Payment, dan Transfer antar wallet
- 🔒 Wallet suspension untuk keamanan
- 📊 Ledger system untuk audit trail
- ✅ Transaction safety dengan database transactions
- 🛡️ Input validation menggunakan Joi
- 📝 Comprehensive error handling

## Struktur Proyek
```
ewallet-systems/
├── app.js                          # Entry point server
├── src/
│   ├── config.js                   # Konfigurasi aplikasi
│   ├── routes/
│   │   ├── v1.js                   # Route registration
│   │   └── route.js                # Wallet route definitions
│   ├── controllers/
│   │   └── wallets/
│   │       └── wallet.js           # Wallet controllers
│   ├── services/
│   │   └── wallets.js              # Business logic layer
│   ├── validations/
│   │   └── wallets/
│   │       └── wallets.js          # Joi validation schemas
│   ├── middlewares/
│   │   ├── error.js                # Error handler
│   │   └── request.js              # Request middleware
│   └── utils/
│       ├── helpers.js              # Helper functions
│       └── response.js             # Response formatters
├── src/db/mysql/
│   ├── config/
│   │   └── config.js               # Sequelize config
│   ├── models/                     # Sequelize models
│   │   ├── users.js
│   │   ├── wallets.js
│   │   └── ledgers.js
│   └── migrations/                 # Database migrations
└── test/                           # Test files
```

## Persyaratan
- Node.js 18+ 
- MySQL 5.7+ / 8.0+
- npm atau yarn

## Instalasi

### 1. Clone Repository
```powershell
git clone <repository-url>
cd ewallet-systems
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Konfigurasi Environment
Buat file `.env` di root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_SERVER=localhost
DB_PORT=3306
DB_NAME=ewallet_db
DB_USER=root
DB_PASS=yourpassword

# Security
JWT_SECRET=your_jwt_secret_key_here
SALT_PASS=your_salt_here
BEARER_TOKEN=your_bearer_token_here
```

### 4. Setup Database
```powershell
# Create database
npx sequelize-cli db:create

# Run migrations
npx sequelize-cli db:migrate

# (Optional) Run seeders
npx sequelize-cli db:seed:all
```

## Menjalankan Aplikasi

### Development Mode
```powershell
npm run dev
```

### Production Mode
```powershell
npm start
```

### Testing
```powershell
npm test
```

### Linting
```powershell
npm run lint          # Check
npm run lint:fix      # Fix
```

---

## 📚 API Documentation

Base URL: `http://localhost:3000`

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/wallet` | Create new wallet |
| `POST` | `/wallet/:id/topup` | Top-up wallet balance |
| `POST` | `/wallet/:id/pay` | Pay from wallet |
| `POST` | `/wallet/transfer` | Transfer between wallets |
| `POST` | `/wallet/:id/suspend` | Suspend wallet |
| `GET` | `/wallet/:id` | Get wallet details |

---

### 1. Create Wallet

Membuat wallet baru untuk user dengan currency tertentu.

**Endpoint:** `POST /wallet`

**Request Body:**
```json
{
  "userId": 1,
  "currency": "USD"
}
```

**Response (201):**
```json
{
  "code": 201,
  "message": "Wallet data created successfully.",
  "data": {
    "id": 1,
    "ownerId": 1,
    "currency": "USD",
    "walletId": "USD-130226",
    "balance": 0,
    "status": "ACTIVE"
  }
}
```

**Validation:**
- `userId`: Number (integer, required)
- `currency`: String (3 characters max, required)

**Error Responses:**
- `400` - Owner already have wallet with this currency

**cURL Example:**
```bash
curl -X POST http://localhost:3000/wallet \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "currency": "USD"}'
```

**PowerShell Example:**
```powershell
$body = @{ userId = 1; currency = "USD" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/wallet" -Method Post -ContentType "application/json" -Body $body
```

---

### 2. Top-Up Wallet

Menambah saldo ke wallet.

**Endpoint:** `POST /wallet/:id/topup`

**URL Parameters:**
- `id`: Wallet ID (integer)

**Request Body:**
```json
{
  "amount": 1000.00
}
```

**Response (200):**
```json
{
  "code": 200,
  "message": "Top up successful.",
  "data": {
    "id": 1,
    "ownerId": 1,
    "currency": "USD",
    "walletId": "USD-130226",
    "balance": 1000.00,
    "status": "ACTIVE"
  }
}
```

**Validation:**
- `id`: Number (integer, required)
- `amount`: Number (positive, required)

**Error Responses:**
- `400` - Cannot top up a suspended wallet
- `404` - Wallet not found

**cURL Example:**
```bash
curl -X POST http://localhost:3000/wallet/1/topup \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000.00}'
```

---

### 3. Pay from Wallet

Membayar/mengurangi saldo dari wallet.

**Endpoint:** `POST /wallet/:id/pay`

**URL Parameters:**
- `id`: Wallet ID (integer)

**Request Body:**
```json
{
  "amount": 250.50
}
```

**Response (200):**
```json
{
  "code": 200,
  "message": "Payment successful.",
  "data": {
    "id": 1,
    "ownerId": 1,
    "currency": "USD",
    "walletId": "USD-130226",
    "balance": 749.50,
    "status": "ACTIVE"
  }
}
```

**Validation:**
- `id`: Number (integer, required)
- `amount`: Number (positive, required)

**Error Responses:**
- `400` - Cannot pay from a suspended wallet
- `400` - Insufficient balance
- `404` - Wallet not found

**cURL Example:**
```bash
curl -X POST http://localhost:3000/wallet/1/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 250.50}'
```

---

### 4. Transfer Between Wallets

Transfer dana antar wallet dengan currency yang sama.

**Endpoint:** `POST /wallet/transfer`

**Request Body:**
```json
{
  "fromWalletId": 1,
  "targetWalletId": 2,
  "amount": 100.00
}
```

**Response (200):**
```json
{
  "code": 200,
  "message": "Transfer successful.",
  "data": {
    "fromWallet": {
      "id": 1,
      "currency": "USD",
      "balance": 649.50
    },
    "targetWallet": {
      "id": 2,
      "currency": "USD",
      "balance": 100.00
    }
  }
}
```

**Validation:**
- `fromWalletId`: Number (integer, required)
- `targetWalletId`: Number (integer, required)
- `amount`: Number (positive, required)

**Error Responses:**
- `400` - Cannot transfer from/to a suspended wallet
- `400` - Insufficient balance in source wallet
- `400` - Cannot transfer to the same wallet
- `400` - Currency mismatch between wallets
- `404` - Wallet not found

**cURL Example:**
```bash
curl -X POST http://localhost:3000/wallet/transfer \
  -H "Content-Type: application/json" \
  -d '{"fromWalletId": 1, "targetWalletId": 2, "amount": 100.00}'
```

---

### 5. Suspend Wallet

Menangguhkan wallet agar tidak bisa melakukan transaksi.

**Endpoint:** `POST /wallet/:id/suspend`

**URL Parameters:**
- `id`: Wallet ID (integer)

**Response (200):**
```json
{
  "code": 200,
  "message": "Wallet suspended successfully.",
  "data": null
}
```

**Validation:**
- `id`: Number (integer, required)

**Error Responses:**
- `400` - Wallet is already suspended
- `404` - Wallet not found

**cURL Example:**
```bash
curl -X POST http://localhost:3000/wallet/1/suspend \
  -H "Content-Type: application/json"
```

---

### 6. Get Wallet Details

Mendapatkan informasi lengkap wallet termasuk balance dan status.

**Endpoint:** `GET /wallet/:id`

**URL Parameters:**
- `id`: Wallet ID (integer)

**Response (200):**
```json
{
  "code": 200,
  "message": "Wallet details fetched successfully.",
  "data": {
    "id": 1,
    "ownerId": 1,
    "currency": "USD",
    "walletId": "USD-130226",
    "balance": 649.50,
    "status": "ACTIVE",
    "createdAt": "2026-02-13T10:00:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

**Validation:**
- `id`: Number (integer, required)

**Error Responses:**
- `404` - Wallet not found

**cURL Example:**
```bash
curl -X GET http://localhost:3000/wallet/1 \
  -H "Content-Type: application/json"
```

---

## 🔒 Business Rules

### Transaction Safety
- Semua operasi balance menggunakan database transactions
- Setiap transaksi dicatat di ledger untuk audit trail
- Before/after balance tracking otomatis
- Auto-generated transaction IDs

### Wallet Rules
- Satu user hanya bisa memiliki 1 wallet per currency
- Wallet ID format: `{CURRENCY}-{DDMMYY}` (contoh: `USD-130226`)
- Transfer hanya bisa dilakukan antar wallet dengan currency yang sama
- Wallet suspended tidak bisa melakukan transaksi apapun

### Validation Rules
- Amount harus berupa angka positif
- Currency code maksimal 3 karakter
- Wallet ID harus berupa integer

### Wallet Status
- **ACTIVE**: Wallet normal, dapat melakukan semua transaksi
- **SUSPENDED**: Wallet ditangguhkan, tidak dapat melakukan transaksi

---

## 🧪 Testing Examples

### Scenario 1: Complete Wallet Lifecycle
```bash
# 1. Create wallet
curl -X POST http://localhost:3000/wallet \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "currency": "USD"}'

# 2. Top up $500
curl -X POST http://localhost:3000/wallet/1/topup \
  -H "Content-Type: application/json" \
  -d '{"amount": 500.00}'

# 3. Pay $100
curl -X POST http://localhost:3000/wallet/1/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 100.00}'

# 4. Check balance (Expected: $400)
curl -X GET http://localhost:3000/wallet/1
```

### Scenario 2: Transfer Between Users
```bash
# 1. Create wallet for user 1
curl -X POST http://localhost:3000/wallet \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "currency": "USD"}'

# 2. Create wallet for user 2
curl -X POST http://localhost:3000/wallet \
  -H "Content-Type: application/json" \
  -d '{"userId": 2, "currency": "USD"}'

# 3. Top up wallet 1
curl -X POST http://localhost:3000/wallet/1/topup \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000.00}'

# 4. Transfer $300 from wallet 1 to wallet 2
curl -X POST http://localhost:3000/wallet/transfer \
  -H "Content-Type: application/json" \
  -d '{"fromWalletId": 1, "targetWalletId": 2, "amount": 300.00}'

# Expected: Wallet 1 = $700, Wallet 2 = $300
```

---

## 📊 Database Schema

### Users Table
```sql
id, name, email, createdAt, updatedAt
```

### Wallets Table
```sql
id, ownerId, currency, walletId, balance, status, createdAt, updatedAt
```

### Ledgers Table
```sql
id, walletId, transactionId, transactionType, amount, balanceBefore, balanceAfter, createdAt, updatedAt
```

---

## 🐛 Error Response Format

Semua error mengikuti format standar:

```json
{
  "code": 400,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error, business rule violation)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📁 Additional Documentation

Dokumentasi lengkap tersedia di folder `docs/`:
- [API_WALLET.md](docs/API_WALLET.md) - Dokumentasi API lengkap
- [API_TEST_EXAMPLES.md](docs/API_TEST_EXAMPLES.md) - Contoh testing dengan curl & PowerShell
- [ROUTES_SUMMARY.md](ROUTES_SUMMARY.md) - Ringkasan routes dan implementasi

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

**Coding Standards:**
- Follow ESLint configuration
- Run `npm run lint:fix` before commit
- Write tests for new features
- Update documentation

---

## 📝 License

ISC

---

## 👨‍💻 Development Notes

### Logging
- Aplikasi menggunakan `morgan` untuk HTTP request logging
- Error handler global di [src/middlewares/error.js](src/middlewares/error.js)

### Database Management
```powershell
# Create new migration
npx sequelize-cli migration:generate --name migration-name

# Undo last migration
npx sequelize-cli db:migrate:undo

# Reset database
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
```

### Environment Variables
Pastikan semua environment variables di `.env` sudah dikonfigurasi dengan benar sebelum menjalankan aplikasi.

---

## 🆘 Troubleshooting

**Database Connection Error:**
- Pastikan MySQL service berjalan
- Cek kredensial database di `.env`
- Pastikan database sudah dibuat

**Port Already in Use:**
- Ubah `PORT` di file `.env`
- Atau kill process yang menggunakan port tersebut

**Migration Error:**
- Cek koneksi database
- Pastikan `sequelize-cli` terinstall
- Verifikasi konfigurasi di `src/db/mysql/config/config.js`

