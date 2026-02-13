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
- 🧪 Unit testing dengan Jest
- 🔄 Service layer architecture untuk reusability

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
│   │   ├── wallets.js              # Wallet business logic
│   │   │                           # - getWalletByWalletId()
│   │   │                           # - getWalletByOwnerAndCurrency()
│   │   │                           # - createWallet()  
│   │   │                           # - updateWalletBalance()
│   │   └── users.js                # User service layer
│   │                               # - getUserById()
│   ├── validations/
│   │   └── wallets/
│   │       └── wallets.js          # Joi validation schemas
│   ├── middlewares/
│   │   ├── error.js                # Error handler
│   │   └── request.js              # Request middleware
│   └── utils/
│       ├── helpers.js              # Helper functions
│       │                           # - formatDecimal(): Format numbers to fixed decimals
│       │                           # - formatBalance(): Locale-based number formatting  
│       │                           # - catchAsync(): Async error handler wrapper
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
| `POST` | `/wallet/:walletId/topup` | Top-up wallet balance |
| `POST` | `/wallet/:walletId/pay` | Pay from wallet |
| `POST` | `/wallet/transfer` | Transfer between wallets |
| `POST` | `/wallet/:walletId/suspend` | Suspend wallet |
| `GET` | `/wallet/:walletId` | Get wallet details |

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
    "walletId": "user1-USD",
    "balance": 0,
    "status": "ACTIVE"
  }
}
```

**Validation:**
- `userId`: Number (integer, required)
- `currency`: String (max 10 characters, required, auto-uppercase)

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

**Endpoint:** `POST /wallet/:walletId/topup`

**URL Parameters:**
- `walletId`: Wallet ID string (format: `user{userId}-{CURRENCY}`)

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
    "walletId": "user1-USD",
    "balance": 1000,
    "status": "ACTIVE"
  }
}
```

**Validation:**
- `walletId`: String (required, params)
- `amount`: Number (positive, min 0.01, required)

**Error Responses:**
- `400` - Cannot top up a suspended wallet
- `404` - Wallet not found

**cURL Example:**
```bash
curl -X POST http://localhost:3000/wallet/user1-USD/topup \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000.00}'
```

---

### 3. Pay from Wallet

Membayar/mengurangi saldo dari wallet.

**Endpoint:** `POST /wallet/:walletId/pay`

**URL Parameters:**
- `walletId`: Wallet ID string (format: `user{userId}-{CURRENCY}`)

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
    "walletId": "user1-USD",
    "balance": 749.5,
    "status": "ACTIVE"
  }
}
```

**Validation:**
- `walletId`: String (required, params)
- `amount`: Number (positive, min 0.01, required)

**Error Responses:**
- `400` - Cannot pay from a suspended wallet
- `400` - Insufficient balance
- `404` - Wallet not found

**cURL Example:**
```bash
curl -X POST http://localhost:3000/wallet/user1-USD/pay \
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
      "balance": 649.5
    },
    "targetWallet": {
      "id": 2,
      "currency": "USD",
      "balance": 100
    }
  }
}
```

**Validation:**
- `fromWalletId`: Number (integer, required, refers to wallet database ID)
- `targetWalletId`: Number (integer, required, refers to wallet database ID)
- `amount`: Number (positive, min 0.01, required)

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

**Endpoint:** `POST /wallet/:walletId/suspend`

**URL Parameters:**
- `walletId`: Wallet ID string (format: `user{userId}-{CURRENCY}`)

**Response (200):**
```json
{
  "code": 200,
  "message": "Wallet suspended successfully.",
  "data": null
}
```

**Validation:**
- `walletId`: String (required, params)

**Error Responses:**
- `400` - Wallet is already suspended
- `404` - Wallet not found

**cURL Example:**
```bash
curl -X POST http://localhost:3000/wallet/user1-USD/suspend \
  -H "Content-Type: application/json"
```

---

### 6. Get Wallet Details

Mendapatkan informasi lengkap wallet termasuk balance dan status.

**Endpoint:** `GET /wallet/:walletId`

**URL Parameters:**
- `walletId`: Wallet ID string (format: `user{userId}-{CURRENCY}`)

**Response (200):**
```json
{
  "code": 200,
  "message": "Wallet details fetched successfully.",
  "data": {
    "id": 1,
    "ownerId": 1,
    "currency": "USD",
    "walletId": "user1-USD",
    "balance": 649.5,
    "status": "ACTIVE",
    "createdAt": "2026-02-13T10:00:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

**Validation:**
- `walletId`: String (required, params)

**Error Responses:**
- `404` - Wallet not found

**cURL Example:**
```bash
curl -X GET http://localhost:3000/wallet/user1-USD \
  -H "Content-Type: application/json"
```

---

## 🔒 Business Rules

### Transaction Safety
- Semua operasi balance menggunakan database transactions
- Setiap transaksi dicatat di ledger untuk audit trail
- Before/after balance tracking otomatis
- Auto-generated transaction IDs

### Number Formatting
- Balance dan amount menggunakan `formatDecimal()` helper untuk konsistensi
- Balance disimpan sebagai DECIMAL(20,2) di database
- Response JSON menampilkan number tanpa trailing zeros (100 bukan 100.00)
- Format: JavaScript number dengan max 2 decimal places

### Wallet Rules
- Satu user hanya bisa memiliki 1 wallet per currency
- Wallet ID format: `user{userId}-{CURRENCY}` (contoh: `user1-USD`, `user2-IDR`)
- Transfer hanya bisa dilakukan antar wallet dengan currency yang sama
- Wallet suspended tidak bisa melakukan transaksi apapun
- User validation: System akan memvalidasi keberadaan user sebelum membuat wallet

### Validation Rules
- Amount harus berupa angka positif dengan minimum 0.01
- Currency code maksimal 10 karakter (otomatis dikonversi ke uppercase)
- Wallet ID berupa string (format: `user{userId}-{CURRENCY}`)
- Transfer menggunakan database ID (integer) untuk fromWalletId dan targetWalletId

### Wallet Status
- **ACTIVE**: Wallet normal, dapat melakukan semua transaksi
- **SUSPENDED**: Wallet ditangguhkan, tidak dapat melakukan transaksi

---

## 📋 Key Changes & Updates

### Recent Updates
1. **Wallet Identification**: Changed from numeric ID to string-based `walletId` (format: `user{userId}-{CURRENCY}`)
2. **API Parameters**: All endpoints now use `walletId` (string) instead of `id` (integer) in URL params
3. **Number Formatting**: Implemented `formatDecimal()` helper for consistent decimal handling
4. **User Validation**: Added user existence check before wallet creation via `users.js` service
5. **Service Layer Architecture**: 
   - Created dedicated `users.js` service for user operations
   - Updated `wallets.js` service with improved functions:
     - `getWalletByWalletId()` - Query by string walletId
     - `getWalletByOwnerAndCurrency()` - Find by owner and currency
     - `createWallet()` - Auto-uppercase currency, generate walletId
     - `updateWalletBalance()` - Transaction-safe balance updates
6. **Model Enhancements**: 
   - Added custom getters in Wallets and Ledgers models for automatic number formatting
   - Added `status` field (ACTIVE/SUSPENDED) to Wallets model
7. **Response Optimization**: Removed `deleted`, `createdAt`, `updatedAt` from wallet creation/topup responses
8. **Helper Utilities**: 
   - Added `formatBalance()` for locale-based number display
   - Enhanced `formatDecimal()` for consistent decimal precision
9. **Testing Infrastructure**: Unit tests for wallet services using Jest

### Migration Notes
- If migrating from old system, update all API calls to use `walletId` string format
- Transfer operations still use database integer IDs for `fromWalletId` and `targetWalletId`
- Currency codes are now automatically converted to uppercase
- Maximum currency length increased from 3 to 10 characters

---

## 🧪 Testing Examples

### Scenario 1: Complete Wallet Lifecycle
```bash
# 1. Create wallet
curl -X POST http://localhost:3000/wallet \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "currency": "USD"}'

# 2. Top up $500 (use walletId from step 1 response, e.g., user1-USD)
curl -X POST http://localhost:3000/wallet/user1-USD/topup \
  -H "Content-Type: application/json" \
  -d '{"amount": 500.00}'

# 3. Pay $100
curl -X POST http://localhost:3000/wallet/user1-USD/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 100.00}'

# 4. Check balance (Expected: $400)
curl -X GET http://localhost:3000/wallet/user1-USD
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
curl -X POST http://localhost:3000/wallet/user1-USD/topup \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000.00}'

# 4. Transfer $300 from wallet 1 to wallet 2 (use database IDs from responses)
curl -X POST http://localhost:3000/wallet/transfer \
  -H "Content-Type: application/json" \
  -d '{"fromWalletId": 1, "targetWalletId": 2, "amount": 300.00}'

# 5. Check both wallets
curl -X GET http://localhost:3000/wallet/user1-USD
curl -X GET http://localhost:3000/wallet/user2-USD

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

### Helper Utilities

**formatDecimal(number, decimal = 2)**
```javascript
import { formatDecimal } from './utils/helpers.js'

const amount = formatDecimal(100.567, 2)  // Returns: 100.57 (number)
const balance = formatDecimal(1000, 2)    // Returns: 1000 (number, not 1000.00)
```
- Memformat angka ke jumlah desimal tertentu
- Return type: Number (bukan string)
- Digunakan di models untuk getter `balance`, `amount`, `before`, `after`

**formatBalance(value, maxDecimal = 2)**  
```javascript
import { formatBalance } from './utils/helpers.js'

const display = formatBalance(1000.50, 2)  // Returns: "1,000.5" (string)
const display2 = formatBalance(100, 2)     // Returns: "100" (string)
```
- Format angka dengan locale-based formatting
- Return type: String
- Untuk display purposes, bukan untuk kalkulasi

**catchAsync(fn)**
```javascript
import { catchAsync } from './utils/helpers.js'

const myController = catchAsync(async (req, res) => {
  // Your async code here
  // Errors will be automatically caught and passed to error middleware
})
```
- Wrapper untuk async functions di controllers
- Otomatis catch errors dan pass ke error middleware

### Service Layer Architecture

Sistem menggunakan service layer pattern untuk memisahkan business logic dari controller, meningkatkan reusability dan testability.

**Wallet Services** ([src/services/wallets.js](src/services/wallets.js))

Menyediakan fungsi-fungsi untuk operasi wallet:

- `getWalletByWalletId(walletId)` 
  - Get wallet by string walletId
  - Returns: Wallet object atau error { code, error }
  - Used by: topUp, pay, transfer, suspend, getWalletDetails

- `getWalletByOwnerAndCurrency(ownerId, currency)` 
  - Find wallet by owner and currency combination
  - Returns: Wallet object atau error { code, error }
  - Used by: Internal validations

- `createWallet({ ownerId, currency })` 
  - Create new wallet dengan validasi duplicate
  - Auto-uppercase currency code
  - Generate walletId dengan format: `user{ownerId}-{CURRENCY}`
  - Returns: Wallet object atau error { code, error }
  - Used by: createUserWallet controller

- `updateWalletBalance(id, newBalance, transaction)` 
  - Update wallet balance dalam database transaction
  - Params: database id (integer), newBalance (decimal), transaction object
  - Used by: topUp, pay, transfer

**User Services** ([src/services/users.js](src/services/users.js))

Menyediakan fungsi-fungsi untuk operasi user:

- `getUserById(id)` 
  - Validate user existence before wallet creation
  - Returns: User object atau error { code: 404, error: 'User not found.' }
  - Used by: createUserWallet controller

**Service Layer Benefits:**
- ✅ Reusable business logic
- ✅ Easier to test independently
- ✅ Consistent error handling
- ✅ Better separation of concerns
- ✅ Transaction support

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

### Testing

**Running Tests:**
```powershell
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

**Test Structure:**
```
test/
├── services/
│   └── wallets.test.js    # Unit tests for wallet services
└── README.md              # Testing documentation
```

**Testing Framework:**
- **Jest** - Testing framework
- Unit tests untuk service layer
- Mocking dengan `@jest/globals`
- Coverage reporting

**Writing Tests:**
```javascript
import { jest, describe, it, expect } from '@jest/globals'
import * as walletService from '../../src/services/wallets.js'

describe('Wallet Service', () => {
  it('should create wallet successfully', async () => {
    // Your test here
  })
})
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

**Balance Formatting Issues:**
- Balance dalam response JSON tidak menampilkan `.00` untuk bilangan bulat (100 bukan 100.00)
- Ini adalah behavior normal JavaScript - trailing zeros dihapus otomatis
- Balance tetap disimpan dengan 2 decimal places di database (DECIMAL(20,2))
- Untuk display dengan `.00`, gunakan `toFixed(2)` di frontend atau `formatBalance()` helper

**Wallet Not Found After Creation:**
- Pastikan menggunakan `walletId` (string) bukan `id` (integer) untuk endpoint
- Format walletId yang benar: `user{userId}-{CURRENCY}` (contoh: `user1-USD`)
- Transfer masih menggunakan database `id` (integer) untuk fromWalletId dan targetWalletId

