# E-Wallet System API

API server for multi-currency e-wallet system with transaction and wallet management support.

## Summary
- **Language/Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: MySQL
- **Validation**: Joi

## Key Features
- 🏦 Multi-currency wallet support
- 💰 Top-up, Payment, and Inter-wallet Transfer
- 🔒 Wallet suspension for security
- 📊 Ledger system for audit trail
- ✅ Transaction safety with database transactions
- 🛡️ Input validation using Joi
- 📝 Comprehensive error handling
- 🧪 Unit testing with Jest
- 🔄 Service layer architecture for reusability

## Project Structure
```
ewallet-systems/
├── app.js                          # Server entry point
├── src/
│   ├── config.js                   # Application configuration
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

## Requirements
- Node.js 18+ 
- MySQL 5.7+ / 8.0+
- npm or yarn

## Installation

### 1. Clone Repository
```powershell
git clone <repository-url>
cd ewallet-systems
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Environment Configuration
Create `.env` file in root directory:

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
```

### 4. Setup Database
```powershell
# Create database
npx sequelize-cli db:create

# Run migrations
npx sequelize-cli db:migrate

# (Optional) Run seeders to populate test users
npx sequelize-cli db:seed:all
# This will create 3 demo users: Brandon (id:1), Jonas (id:2), Kane (id:3)
# Use these user IDs when creating wallets via API
```

## Running the Application

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

Create a new wallet for a user with specific currency (User already in seeder, if not have user seed or create first).

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
  "status": "success",
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
- `404` - User not found

**Error Example (400):**
```json
{
  "status": "error",
  "code": 400,
  "message": "Owner already have wallet with this currency.",
  "data": null
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/wallet \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "currency": "USD"}'
```

---

### 2. Top-Up Wallet

Add balance to wallet.

**Endpoint:** `POST /wallet/:walletId/topup`

**URL Parameters:**
- `walletId`: Wallet ID string (format: `user{userId}-{CURRENCY}`)

**Request Body:**
```json
{
  "amount": 1000.00,
  "code": "TXN-TOP-12345"
}
```

**Response (200):**
```json
{
  "status": "success",
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
- `code`: String (required, idempotency key to prevent duplicate requests)

**Error Responses:**
- `400` - Cannot top up a suspended wallet
- `400` - Transaction code already used (duplicate request)
- `404` - Wallet not found

**Error Example (404):**
```json
{
  "status": "error",
  "code": 404,
  "message": "Wallet not found.",
  "data": null
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/wallet/user1-USD/topup \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000.00, "code": "TXN-TOP-12345"}'
```

---

### 3. Pay from Wallet

Deduct balance from wallet for payment.

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
  "status": "success",
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

**Error Example (400):**
```json
{
  "status": "error",
  "code": 400,
  "message": "Insufficient balance.",
  "data": null
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/wallet/user1-USD/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 250.50}'
```

---

### 4. Transfer Between Wallets

Transfer funds between wallets with same currency.

**Endpoint:** `POST /wallet/transfer`

**Request Body:**
```json
{
  "fromWalletId": "user1-USD",
  "targetWalletId": "user2-USD",
  "amount": 100.00
}
```

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Transfer successful.",
  "data": {
    "fromWallet": {
      "id": 1,
      "ownerId": 1,
      "currency": "USD",
      "walletId": "user1-USD",
      "balance": 649.5,
      "status": "ACTIVE"
    },
    "targetWallet": {
      "id": 2,
      "ownerId": 2,
      "currency": "USD",
      "walletId": "user2-USD",
      "balance": 100,
      "status": "ACTIVE"
    }
  }
}
```

**Validation:**
- `fromWalletId`: String (required, format: `user{userId}-{CURRENCY}`)
- `targetWalletId`: String (required, format: `user{userId}-{CURRENCY}`)
- `amount`: Number (positive, min 0.01, required)

**Error Responses:**
- `400` - Cannot transfer from/to a suspended wallet
- `400` - Insufficient balance in source wallet
- `400` - Cannot transfer to the same wallet
- `400` - Currency mismatch between wallets
- `404` - Wallet not found

**Error Example (400):**
```json
{
  "status": "error",
  "code": 400,
  "message": "Cannot transfer between different currencies.",
  "data": null
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/wallet/transfer \
  -H "Content-Type: application/json" \
  -d '{"fromWalletId": "user1-USD", "targetWalletId": "user2-USD", "amount": 100.00}'
```

---

### 5. Suspend Wallet

Suspend wallet to prevent all transactions.

**Endpoint:** `POST /wallet/:walletId/suspend`

**URL Parameters:**
- `walletId`: Wallet ID string (format: `user{userId}-{CURRENCY}`)

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Wallet suspended successfully.",
  "data": {
    "id": 1,
    "ownerId": 1,
    "currency": "USD",
    "walletId": "user1-USD",
    "balance": 649.5,
    "status": "SUSPENDED"
  }
}
```

**Validation:**
- `walletId`: String (required, params)

**Error Responses:**
- `400` - Wallet is already suspended
- `404` - Wallet not found

**Error Example (400):**
```json
{
  "status": "error",
  "code": 400,
  "message": "Wallet is already suspended.",
  "data": null
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/wallet/user1-USD/suspend \
  -H "Content-Type: application/json"
```

---

### 6. Get Wallet Details

Get complete wallet information including balance and status.

**Endpoint:** `GET /wallet/:walletId`

**URL Parameters:**
- `walletId`: Wallet ID string (format: `user{userId}-{CURRENCY}`)

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Wallet details fetched successfully.",
  "data": {
    "walletId": "user1-USD",
    "currency": "USD",
    "balance": 649.5,
    "status": "ACTIVE"
  }
}
```

**Validation:**
- `walletId`: String (required, params)

**Error Responses:**
- `404` - Wallet not found

**Error Example (404):**
```json
{
  "status": "error",
  "code": 404,
  "message": "Wallet not found.",
  "data": null
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/wallet/user1-USD \
  -H "Content-Type: application/json"
```

---
## 🔒 Concurrency Safety & Race Condition Prevention

### Row-Level Locking
System uses **pessimistic locking** to prevent race conditions in critical operations:

```javascript
// All operations use FOR UPDATE lock
const wallet = await getWalletByWalletId(walletId, transaction, transaction.LOCK.UPDATE)
```

**Operations using row locking:**
- ✅ Top-up (prevents concurrent top-ups)
- ✅ Payment (prevents negative balance from concurrent spending)
- ✅ Transfer (locks both source & target wallets)

**How it works:**
1. Transaction A locks wallet row with `SELECT ... FOR UPDATE`
2. Transaction B tries to lock same row → **BLOCKED** until A finishes
3. Transaction A commit/rollback → lock released
4. Transaction B gets lock → reads updated balance

**Benefits:**
- ❌ Prevents: Double spending
- ❌ Prevents: Negative balance from concurrent payments
- ❌ Prevents: Lost updates
- ✅ Ensures: Serial execution for operations on same wallet

### Idempotency (Duplicate Request Prevention)

**Top-up uses idempotency key** to prevent duplicate requests:

```json
{
  "amount": 100.00,
  "code": "TXN-TOP-12345"  // Unique transaction code
}
```

**How it works:**
1. Client sends top-up with unique `code`
2. System checks if `code` already exists in ledger
3. If exists → reject with error `400: Transaction code already used`
4. If not → process top-up and save `code` to ledger

**Benefits:**
- ❌ Prevents: Duplicate top-up if client retries request
- ❌ Prevents: Double charging on network timeout
- ✅ Ensures: Exactly-once semantics for top-up operations

**Best Practice:**
```javascript
// Generate unique code on client side
const code = `TXN-TOP-${Date.now()}-${userId}-${randomString()}`

// If request timeout or error, retry with SAME code
retry(() => topup(walletId, amount, code))
```

---
## � Response Structure

Semua response API mengikuti struktur yang konsisten:

**Success Response:**
```json
{
  "status": "success",
  "code": 200,
  "message": "Operation successful.",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "status": "error",
  "code": 400,
  "message": "Error message.",
  "data": null
}
```

**Fields:**
- `status`: \"success\" atau \"error\"
- `code`: HTTP status code (200, 201, 400, 404, dll)
- `message`: Pesan deskriptif operasi
- `data`: Data response (null untuk error)

---

## �🔒 Business Rules

### Transaction Safety
- Semua operasi balance menggunakan database transactions
- Setiap transaksi dicatat di ledger untuk audit trail
- Before/after balance tracking otomatis
- Auto-generated transaction IDs

### Number Formatting & Decimal Precision
- Balance dan amount menggunakan `formatDecimal()` helper untuk konsistensi
- Database menyimpan DECIMAL(20,2) untuk presisi 2 desimal
- Semua amounts di-round ke 2 decimal places (12.345 → 12.35)
- JSON response mengembalikan JavaScript number (tanpa trailing zeros)
- Format: `100` bukan `"100.00"` atau `100.00`
- Support large balances up to 999,999,999,999,999,999.99

**Example:**
```javascript
// Input: 12.345
formatDecimal(12.345, 2) // Output: 12.35 (rounded)

// Input: 100.00
formatDecimal(100.00, 2) // Output: 100 (no trailing zeros)
```

### Wallet Rules
- One user can only have 1 wallet per currency
- Wallet ID format: `user{userId}-{CURRENCY}` (example: `user1-USD`, `user2-IDR`)
- Transfer can only be done between wallets with same currency
- Suspended wallets cannot perform any transactions
- User validation: System validates user existence before creating wallet

### Validation Rules
- Amount must be positive number with minimum 0.01
- Currency code maximum 10 characters (automatically converted to uppercase)
- Wallet ID is a string (format: `user{userId}-{CURRENCY}`)
- Transfer uses string walletId (format: `user{userId}-{CURRENCY}`)

### Wallet Status
- **ACTIVE**: Normal wallet, can perform all transactions
- **SUSPENDED**: Suspended wallet, cannot perform transactions

---

## 🛡️ Edge Cases Handling

### Decimal Precision Examples

```javascript
// ✅ Valid amounts
100.00  → accepted, stored as 100
12.50   → accepted, stored as 12.50
0.01    → accepted (minimum amount)

// ✅ Auto-rounded amounts
12.345  → rounded to 12.35
99.996  → rounded to 100.00

// ❌ Rejected amounts
0.001   → rejected (below minimum 0.01)
0       → rejected (zero not allowed)
-50.00  → rejected (negative not allowed)
```

### Concurrency Safety Examples

**Scenario: 2 concurrent payments on same wallet**

```
Initial Balance: 1000
Payment A: 700 (started at T0)
Payment B: 600 (started at T1)

✅ With Row Locking:
1. Payment A locks wallet → balance = 1000
2. Payment B waits (blocked by lock)
3. Payment A: 1000 - 700 = 300 → COMMIT
4. Payment B gets lock → balance = 300
5. Payment B: 300 < 600 → REJECTED (insufficient)

Final Balance: 300 ✅ CORRECT

❌ Without Row Locking (race condition):
1. Payment A reads balance = 1000
2. Payment B reads balance = 1000 (same!)
3. Payment A: 1000 - 700 = 300 → COMMIT
4. Payment B: 1000 - 600 = 400 → COMMIT (overwrites!)

Final Balance: 400 ❌ WRONG (should reject B)
```

---
### Migration Notes
- If migrating from old system, update all API calls to use `walletId` string format
- Transfer operations now use string `walletId` (format: `user{userId}-{CURRENCY}`)
- Currency codes are now automatically converted to uppercase
- Maximum currency length increased from 3 to 10 characters
- Top-up operations require `code` field for idempotency


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
  -d '{"amount": 500.00, "code": "TXN-TOP-001"}'

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
  -d '{"amount": 1000.00, "code": "TXN-TOP-002"}'

# 4. Transfer $300 from wallet 1 to wallet 2
curl -X POST http://localhost:3000/wallet/transfer \
  -H "Content-Type: application/json" \
  -d '{"fromWalletId": "user1-USD", "targetWalletId": "user2-USD", "amount": 300.00}'

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

## � Implementation Assumptions

This section documents key assumptions and design decisions made during implementation:

### 1. Wallet Identification
**Assumption:** Wallet IDs use format `user{userId}-{CURRENCY}` (e.g., `user1-USD`)
- **Rationale:** Provides human-readable, collision-free identifiers without exposing sequential database IDs
- **Alternative Considered:** Date-based format (`USD-120226`) - rejected due to potential collisions

### 2. Idempotency Scope
**Assumption:** Only top-up operations require idempotency keys via `code` field
- **Rationale:** Top-ups typically come from payment gateways with automatic retry logic
- **Alternative Considered:** All operations - rejected due to added complexity for user-initiated actions
- **Implementation:** Transaction code stored in ledger, duplicate codes rejected with 400 error

### 3. Concurrency Control
**Assumption:** Pessimistic locking (`SELECT FOR UPDATE`) for critical operations
- **Rationale:** Prevents race conditions at the cost of reduced concurrency
- **Applied To:** Top-up, payment, and transfer operations
- **Alternative Considered:** Optimistic locking - rejected due to higher failure rates under load

### 4. Currency Support
**Assumption:** Currency codes support up to 10 characters
- **Rationale:** Supports standard ISO codes (3 chars) and allows future expansion (crypto tokens, custom currencies)
- **Behavior:** Automatically converts to uppercase for consistency
- **Alternative Considered:** Fixed 3 characters - rejected for lack of flexibility

### 5. User Validation
**Assumption:** Users must exist before wallet creation
- **Rationale:** Prevents orphaned wallets and ensures referential integrity
- **Implementation:** `getUserById()` service validates user existence before wallet creation
- **Alternative Considered:** Auto-create users - rejected due to security concerns

### 6. Transaction Amount Limits
**Assumption:** Minimum transaction amount is 0.01
- **Rationale:** Prevents spam and abuse with micro-transactions
- **Validation:** Enforced via Joi schema with `min(0.01)`
- **Alternative Considered:** No minimum - rejected due to potential abuse

### 7. Suspended Wallet Behavior
**Assumption:** Suspended wallets cannot perform ANY operations (top-up, payment, transfer)
- **Rationale:** Complete freeze for security/fraud prevention
- **Implementation:** All operations check `status === 'SUSPENDED'` before processing
- **Alternative Considered:** Allow queries only - rejected for consistency

### 8. Ledger Immutability
**Assumption:** Ledger entries are append-only, never updated or deleted
- **Rationale:** Maintains audit trail integrity for regulatory compliance
- **Implementation:** No UPDATE/DELETE operations on ledger table
- **Fields Tracked:** amount, before balance, after balance, transaction type, timestamp

### 9. Decimal Precision
**Assumption:** All monetary values use DECIMAL(20,2)
- **Rationale:** 2 decimal places sufficient for fiat currencies, 20 digits total handles balances up to 999 quadrillion
- **Storage:** Database uses DECIMAL, API returns JavaScript number
- **Rounding:** All amounts rounded to 2 decimals via `formatDecimal()` helper

### 10. Transfer Parameters
**Assumption:** Transfer endpoint uses string `walletId` instead of integer database IDs
- **Rationale:** Consistency with other endpoints, better security (no sequential ID exposure)
- **Format:** `fromWalletId` and `targetWalletId` both use `user{userId}-{CURRENCY}` format

### 11. Error Response Structure
**Assumption:** All API responses follow consistent `{status, code, message, data}` structure
- **Rationale:** Simplifies client-side error handling and parsing
- **Success:** `status: "success"`, `data: {...}`
- **Error:** `status: "error"`, `data: null`, descriptive `message`

### 12. Database Transaction Isolation
**Assumption:** Using MySQL default isolation level (REPEATABLE READ)
- **Rationale:** Balances consistency requirements with performance
- **Row Locking:** Additional pessimistic locking for critical operations

### 13. Balance Display Format
**Assumption:** JSON responses return numbers without trailing zeros
- **Rationale:** Standard JavaScript number behavior (100 not 100.00)
- **Database:** Stores with full precision DECIMAL(20,2)
- **Frontend:** Can use `toFixed(2)` or `formatBalance()` helper for display

### 14. Multi-Currency Support
**Assumption:** Each user can have multiple wallets, but only one per currency
- **Rationale:** Simplifies balance management while supporting multi-currency
- **Validation:** Enforced in `createWallet()` service
- **Transfer Rule:** Only same-currency transfers allowed

### 15. Auto-Generated Transaction IDs
**Assumption:** System generates transaction IDs using timestamp format
- **Rationale:** Simple, unique, chronologically sortable
- **Format:** `TXN-{timestamp}` for system-generated, custom for top-up (idempotency)

### 16. Security 
**Assumption:** This app is secure from another risk
- **Rationale:** Just for direct API
---

## �📁 Additional Documentation

Complete documentation available in `docs/` folder:
- [API_WALLET.md](docs/API_WALLET.md) - Complete API documentation
- [API_TEST_EXAMPLES.md](docs/API_TEST_EXAMPLES.md) - Testing examples with curl & PowerShell
- [ROUTES_SUMMARY.md](ROUTES_SUMMARY.md) - Routes summary and implementation

---

## 🆘 Troubleshooting

**Database Connection Error:**
- Ensure MySQL service is running
- Check database credentials in `.env`
- Ensure database is created

**Port Already in Use:**
- Change `PORT` in `.env` file
- Or kill process using the port

**Migration Error:**
- Check database connection
- Ensure `sequelize-cli` is installed
- Verify configuration in `src/db/mysql/config/config.js`

**Balance Formatting Issues:**
- Balance in JSON response doesn't show `.00` for whole numbers (100 not 100.00)
- This is normal JavaScript behavior - trailing zeros are automatically removed
- Balance is still stored with 2 decimal places in database (DECIMAL(20,2))
- For display with `.00`, use `toFixed(2)` on frontend or `formatBalance()` helper

**Wallet Not Found After Creation:**
- Ensure using `walletId` (string) not `id` (integer) for endpoints
- Correct walletId format: `user{userId}-{CURRENCY}` (example: `user1-USD`)
- Transfer now uses string `walletId` (format: `user{userId}-{CURRENCY}`)

