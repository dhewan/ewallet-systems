# Wallet API Documentation

Base URL: `/wallet`

## Endpoints

### 1. Create Wallet
**POST** `/wallet`

Membuat wallet baru untuk user dengan currency tertentu.

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
- `userId`: Number, integer, required
- `currency`: String, max 3 characters, required

**Error Responses:**
- 400: "Owner already have wallet with this currency."

---

### 2. Top-Up Wallet
**POST** `/wallet/:id/topup`

Menambah saldo ke wallet dalam currency wallet tersebut.

**URL Parameters:**
- `id`: Wallet ID (integer)

**Request Body:**
```json
{
  "amount": 100.50
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
    "balance": 100.50,
    "status": "ACTIVE"
  }
}
```

**Validation:**
- `id`: Number, integer, required (params)
- `amount`: Number, positive, required (body)

**Error Responses:**
- 400: "Cannot top up a suspended wallet."
- 404: "Wallet not found."

---

### 3. Pay from Wallet
**POST** `/wallet/:id/pay`

Membayar/mengurangi saldo dari wallet.

**URL Parameters:**
- `id`: Wallet ID (integer)

**Request Body:**
```json
{
  "amount": 50.25
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
    "balance": 50.25,
    "status": "ACTIVE"
  }
}
```

**Validation:**
- `id`: Number, integer, required (params)
- `amount`: Number, positive, required (body)

**Error Responses:**
- 400: "Cannot pay from a suspended wallet."
- 400: "Insufficient balance."
- 404: "Wallet not found."

---

### 4. Transfer Between Wallets
**POST** `/wallet/transfer`

Transfer dana antar wallet dengan currency yang sama.

**Request Body:**
```json
{
  "fromWalletId": 1,
  "targetWalletId": 2,
  "amount": 25.00
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
      "balance": 25.25
    },
    "targetWallet": {
      "id": 2,
      "currency": "USD",
      "balance": 25.00
    }
  }
}
```

**Validation:**
- `fromWalletId`: Number, integer, required
- `targetWalletId`: Number, integer, required
- `amount`: Number, positive, required

**Error Responses:**
- 400: "Cannot transfer from a suspended wallet."
- 400: "Cannot transfer to a suspended wallet."
- 400: "Insufficient balance in source wallet."
- 400: "Cannot transfer to the same wallet."
- 400: "Currency mismatch between wallets."
- 404: "Wallet not found."

---

### 5. Suspend Wallet
**POST** `/wallet/:id/suspend`

Menangguhkan/suspend wallet agar tidak bisa melakukan transaksi.

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
- `id`: Number, integer, required (params)

**Error Responses:**
- 400: "Wallet is already suspended."
- 404: "Wallet not found."

---

### 6. Get Wallet Status
**GET** `/wallet/:id`

Mendapatkan status wallet termasuk balance dan currency.

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
    "balance": 50.25,
    "status": "ACTIVE",
    "createdAt": "2026-02-13T10:00:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

**Validation:**
- `id`: Number, integer, required (params)

**Error Responses:**
- 404: "Wallet not found."

---

## Transaction Flow

Semua operasi yang mengubah balance (topup, pay, transfer) akan:
1. Menggunakan database transaction untuk konsistensi
2. Membuat ledger entry untuk audit trail
3. Menyimpan before/after balance
4. Generate transaction ID otomatis

## Wallet Status

- **ACTIVE**: Wallet normal, bisa melakukan semua transaksi
- **SUSPENDED**: Wallet ditangguhkan, tidak bisa melakukan transaksi

## Currency

- Format: 3 karakter kode currency (contoh: USD, IDR, EUR)
- Transfer hanya bisa dilakukan antar wallet dengan currency yang sama
- Wallet ID format: `{CURRENCY}-{DDMMYY}` (contoh: USD-130226)

## Error Response Format

```json
{
  "code": 400,
  "error": "Error message here"
}
```
