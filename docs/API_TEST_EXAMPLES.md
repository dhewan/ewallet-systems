# Wallet API - Test Requests

Contoh request untuk testing Wallet API.

## Prerequisites

Pastikan server berjalan:
```bash
npm run dev
```

Base URL: `http://localhost:3000/wallet` (sesuaikan dengan port Anda)

---

## 1. Create Wallet

### Request
```bash
curl -X POST http://localhost:3000/wallet \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "currency": "USD"
  }'
```

### Expected Response
```json
{
  "code": 201,
  "message": "Wallet data created successfully.",
  "data": {
    "id": 1,
    "ownerId": 1,
    "currency": "USD",
    "walletId": "USD-130226",
    "balance": 0
  }
}
```

---

## 2. Top-Up Wallet

### Request
```bash
curl -X POST http://localhost:3000/wallet/1/topup \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000.00
  }'
```

### Expected Response
```json
{
  "code": 200,
  "message": "Top up successful.",
  "data": {
    "id": 1,
    "balance": 1000.00,
    "currency": "USD"
  }
}
```

---

## 3. Pay from Wallet

### Request
```bash
curl -X POST http://localhost:3000/wallet/1/pay \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 250.50
  }'
```

### Expected Response
```json
{
  "code": 200,
  "message": "Payment successful.",
  "data": {
    "id": 1,
    "balance": 749.50,
    "currency": "USD"
  }
}
```

---

## 4. Transfer Between Wallets

### Setup - Create Second Wallet First
```bash
curl -X POST http://localhost:3000/wallet \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "currency": "USD"
  }'
```

### Transfer Request
```bash
curl -X POST http://localhost:3000/wallet/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromWalletId": 1,
    "targetWalletId": 2,
    "amount": 100.00
  }'
```

### Expected Response
```json
{
  "code": 200,
  "message": "Transfer successful.",
  "data": {
    "fromWallet": {
      "id": 1,
      "balance": 649.50
    },
    "targetWallet": {
      "id": 2,
      "balance": 100.00
    }
  }
}
```

---

## 5. Suspend Wallet

### Request
```bash
curl -X POST http://localhost:3000/wallet/1/suspend \
  -H "Content-Type: application/json"
```

### Expected Response
```json
{
  "code": 200,
  "message": "Wallet suspended successfully.",
  "data": null
}
```

---

## 6. Get Wallet Status

### Request
```bash
curl -X GET http://localhost:3000/wallet/1 \
  -H "Content-Type: application/json"
```

### Expected Response
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
    "status": "SUSPENDED",
    "createdAt": "2026-02-13T10:00:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

---

## Test Scenarios

### Scenario 1: Complete Wallet Lifecycle
```bash
# 1. Create wallet for user 1
curl -X POST http://localhost:3000/wallet \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "currency": "USD"}'

# 2. Top up 500
curl -X POST http://localhost:3000/wallet/1/topup \
  -H "Content-Type: application/json" \
  -d '{"amount": 500.00}'

# 3. Pay 100
curl -X POST http://localhost:3000/wallet/1/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 100.00}'

# 4. Check balance
curl -X GET http://localhost:3000/wallet/1

# Expected balance: 400.00
```

### Scenario 2: Transfer Between Users
```bash
# 1. Create wallet for user 1 (USD)
curl -X POST http://localhost:3000/wallet \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "currency": "USD"}'

# 2. Create wallet for user 2 (USD)
curl -X POST http://localhost:3000/wallet \
  -H "Content-Type: application/json" \
  -d '{"userId": 2, "currency": "USD"}'

# 3. Top up wallet 1
curl -X POST http://localhost:3000/wallet/1/topup \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000.00}'

# 4. Transfer from wallet 1 to wallet 2
curl -X POST http://localhost:3000/wallet/transfer \
  -H "Content-Type: application/json" \
  -d '{"fromWalletId": 1, "targetWalletId": 2, "amount": 300.00}'

# 5. Check both wallets
curl -X GET http://localhost:3000/wallet/1
curl -X GET http://localhost:3000/wallet/2

# Expected: Wallet 1 = 700.00, Wallet 2 = 300.00
```

### Scenario 3: Error Cases
```bash
# 1. Insufficient balance
curl -X POST http://localhost:3000/wallet/1/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 999999.00}'

# 2. Suspend wallet
curl -X POST http://localhost:3000/wallet/1/suspend

# 3. Try to pay from suspended wallet
curl -X POST http://localhost:3000/wallet/1/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'

# Expected error: "Cannot pay from a suspended wallet."
```

---

## PowerShell Examples (Windows)

### Create Wallet
```powershell
$body = @{
    userId = 1
    currency = "USD"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/wallet" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Top-Up
```powershell
$body = @{ amount = 1000.00 } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/wallet/1/topup" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Get Wallet
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/wallet/1" `
  -Method Get `
  -ContentType "application/json"
```
