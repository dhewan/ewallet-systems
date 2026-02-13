# Testing Documentation

Dokumentasi lengkap untuk testing di proyek E-Wallet Systems API.

## 📋 Table of Contents

- [Struktur Folder](#struktur-folder)
- [Menjalankan Tests](#menjalankan-tests)
- [Test Coverage](#test-coverage)
- [Struktur Test](#struktur-test)
- [Mocking Strategy](#mocking-strategy)
- [Best Practices](#best-practices)
- [Menambahkan Test Baru](#menambahkan-test-baru)

---

## 📁 Struktur Folder

```
test/
├── services/
│   └── wallets.test.js    # Unit tests untuk wallet service
├── controllers/           # (Future) Controller tests
├── middlewares/           # (Future) Middleware tests
└── README.md              # Dokumentasi testing (file ini)
```

---

## 🚀 Menjalankan Tests

### Commands

```bash
# Menjalankan semua tests
npm test

# Menjalankan tests dengan coverage report
npm test -- --coverage

# Menjalankan tests dalam watch mode (auto-rerun saat ada perubahan)
npm test -- --watch

# Menjalankan test file spesifik
npm test -- wallets.test.js

# Menjalankan test dengan verbose output
npm test -- --verbose

# Menjalankan hanya tests yang gagal sebelumnya
npm test -- --onlyFailures
```

### PowerShell (Windows)

```powershell
# Run tests dengan coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

**Tests (3):**
- ✓ Update wallet balance dengan transaction
- ✓ Update wallet balance dengan nilai 0
- ✓ Update wallet balance dengan nilai negatif

**Coverage:**
- Normal operation: Positive balance
- Edge case: Zero balance
- Edge case: Negative balance
- Transaction support: Sequelize transaction handling

---

---

## 🏗️ Struktur Test

### Arrange-Act-Assert (AAA) Pattern

Semua tests menggunakan pola **AAA** untuk konsistensi dan readability:

```javascript
describe('Wallet Service', () => {
  describe('getWalletById', () => {
    it('should return wallet when found', async () => {
      // ========== ARRANGE ==========
      // Setup mock data dan behavior
      const mockWallet = {
        id: 1,
        ownerId: 100,
        currency: 'USD',
        balance: 1000
      }
      mockFindOne.mockResolvedValue(mockWallet)

      // ========== ACT ==========
      // Panggil fungsi yang di-test
      const result = await walletService.getWalletById(1)

      // ========== ASSERT ==========
      // Verifikasi hasil dan side effects
      expect(result).toEqual(mockWallet)
      expect(mockFindOne).toHaveBeenCalledTimes(1)
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1 } })
    })
  })
})
```

### Nested Describe Blocks

Tests diorganisir dalam nested describe blocks:

```javascript
describe('Module Name', () => {           // Top-level: Module
  beforeEach(() => { /* setup */ })
  afterEach(() => { /* cleanup */ })

  describe('functionName', () => {        // Second-level: Function
    it('should do X when Y', () => {})    // Third-level: Test case
    it('should do A when B', () => {})
  })

  describe('anotherFunction', () => {
    it('should handle error', () => {})
  })
})
```

### Test Naming Convention

Format: `should [expected behavior] when [condition]`

**✅ Good Examples:**
- `should return wallet when found`
- `should return error when wallet not found`
- `should create wallet successfully when owner does not have wallet`
- `should generate correct wallet ID format with lowercase currency`

**❌ Bad Examples:**
- `test wallet` (tidak deskriptif)
- `it works` (terlalu general)
- `getWalletById` (hanya nama fungsi)

---

---

## 🎭 Mocking Strategy

### Database Models

**Strategy:** Mock di level module dengan `jest.mock()`

```javascript
// Mock database models sebelum import service
jest.mock('../../src/db/mysql/models/index.js', () => ({
  __esModule: true,
  default: {
    Wallets: {
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }
}))

// Import setelah mock
import * as walletService from '../../src/services/wallets.js'
import db from '../../src/db/mysql/models/index.js'

// Extract mocked functions
const { Wallets } = db
const mockFindOne = Wallets.findOne
```

**Benefits:**
- ✅ Tidak ada koneksi database sebenarnya
- ✅ Tests berjalan cepat (no I/O)
- ✅ Predictable test results
- ✅ Dapat test error scenarios dengan mudah

### Time-Dependent Code

**Strategy:** Gunakan `jest.useFakeTimers()` untuk kontrol waktu

```javascript
it('should generate wallet ID with correct date', async () => {
  // Setup fake timers
  jest.useFakeTimers()
  const testDate = new Date(2026, 11, 31, 12, 0, 0)
  jest.setSystemTime(testDate)

  // Test code...
  await walletService.createWallet({ ownerId: 1, currency: 'USD' })

  // Assertions
  expect(createdWalletId).toBe('USD-311226') // 31 Dec 2026
})
```

### Mock Lifecycle

```javascript
describe('Service Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Restore real timers after each test
    jest.useRealTimers()
  })

  // Tests here...
})
```

---

---

## ✨ Best Practices

### 1. Test Isolation

✅ **DO:**
```javascript
beforeEach(() => {
  jest.clearAllMocks() // Clear sebelum setiap test
})
```

❌ **DON'T:**
```javascript
// Sharing state antar tests
let sharedWallet = { id: 1 } // Bahaya!

it('test 1', () => {
  sharedWallet.balance = 100
})

it('test 2', () => {
  // Tergantung pada test 1! ❌
  expect(sharedWallet.balance).toBe(100)
})
```

### 2. Clear Test Names

✅ **DO:**
```javascript
it('should return error when wallet not found', async () => {})
it('should create wallet successfully when owner does not have wallet', async () => {})
```

❌ **DON'T:**
```javascript
it('test1', () => {})
it('works correctly', () => {})
```

### 3. Descriptive Assertions

✅ **DO:**
```javascript
expect(result).toEqual({
  error: 'Wallet not found.',
  code: 404
})
expect(mockFindOne).toHaveBeenCalledTimes(1)
expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1 } })
```

❌ **DON'T:**
```javascript
expect(result).toBeTruthy() // Terlalu general
expect(mockFindOne).toHaveBeenCalled() // Tidak verify parameter
```

### 4. Test Edge Cases

Selalu test:
- ✅ **Happy path** - Normal operation
- ✅ **Error cases** - Not found, validation errors
- ✅ **Boundary values** - Zero, negative, maximum values
- ✅ **Edge cases** - Empty strings, null, undefined

### 5. Mock Reset

✅ **DO:**
```javascript
beforeEach(() => {
  jest.clearAllMocks() // atau mockReset()
})
```

❌ **DON'T:**
```javascript
// Tidak reset mocks, bisa ada call counts dari test sebelumnya
it('test 1', () => {
  mockFn()
})

it('test 2', () => {
  expect(mockFn).toHaveBeenCalledTimes(1) // Fail! Count = 2
})
```

### 6. Async/Await

✅ **DO:**
```javascript
it('should handle async operation', async () => {
  const result = await asyncFunction()
  expect(result).toBeDefined()
})
```

❌ **DON'T:**
```javascript
it('should handle async operation', () => {
  asyncFunction().then(result => {
    expect(result).toBeDefined() // Bisa tidak dijalankan!
  })
})
```

---

---

## 📝 Menambahkan Test Baru

### Step-by-Step Guide

1. **Buat file test** dengan format `*.test.js` di folder yang sesuai
   ```
   test/
   └── services/
       └── myService.test.js
   ```

2. **Import dependencies**
   ```javascript
   import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals'
   ```

3. **Mock dependencies eksternal** (sebelum import module yang di-test)
   ```javascript
   jest.mock('../../src/db/mysql/models/index.js', () => ({
     __esModule: true,
     default: {
       MyModel: {
         findOne: jest.fn(),
         create: jest.fn()
       }
     }
   }))
   ```

4. **Import module setelah mock**
   ```javascript
   import * as myService from '../../src/services/myService.js'
   import db from '../../src/db/mysql/models/index.js'
   
   const mockFindOne = db.MyModel.findOne
   const mockCreate = db.MyModel.create
   ```

5. **Setup test suite**
   ```javascript
   describe('My Service', () => {
     beforeEach(() => {
       jest.clearAllMocks()
     })

     afterEach(() => {
       jest.useRealTimers()
     })

     // Tests here...
   })
   ```

6. **Tulis tests dengan pola AAA**
   ```javascript
   describe('functionName', () => {
     it('should do X when Y', async () => {
       // Arrange
       const mockData = { id: 1 }
       mockFindOne.mockResolvedValue(mockData)

       // Act
       const result = await myService.functionName(1)

       // Assert
       expect(result).toEqual(mockData)
       expect(mockFindOne).toHaveBeenCalledTimes(1)
     })
   })
   ```

### Template untuk Service Test

```javascript
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals'

// Mock dependencies
jest.mock('../../src/db/mysql/models/index.js', () => ({
  __esModule: true,
  default: {
    MyModel: {
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }
}))

// Import after mocking
import * as myService from '../../src/services/myService.js'
import db from '../../src/db/mysql/models/index.js'

// Extract mocks
const { MyModel } = db
const mockFindOne = MyModel.findOne
const mockCreate = MyModel.create
const mockUpdate = MyModel.update

describe('My Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('functionName', () => {
    it('should return data when found', async () => {
      // Arrange
      const mockData = { id: 1, name: 'Test' }
      mockFindOne.mockResolvedValue(mockData)

      // Act
      const result = await myService.functionName(1)

      // Assert
      expect(result).toEqual(mockData)
      expect(mockFindOne).toHaveBeenCalledTimes(1)
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('should return error when not found', async () => {
      // Arrange
      mockFindOne.mockResolvedValue(null)

      // Act
      const result = await myService.functionName(999)

      // Assert
      expect(result).toEqual({
        error: 'Not found',
        code: 404
      })
    })
  })
})
```

---

## 🔧 Configuration

### Jest Configuration (`package.json`)

```json
{
  "jest": {
    "testEnvironment": "node",
    "transform": {
      "^.+\\.js$": "babel-jest"
    },
    "moduleFileExtensions": ["js", "json"],
    "roots": ["<rootDir>/test"]
  }
}
```

### Babel Configuration (`babel.config.cjs`)

```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' }
    }]
  ]
}
```

---

## 🎯 Coverage Goals

### Current Status
- **Statements:** 100% ✅
- **Branches:** 100% ✅
- **Functions:** 100% ✅
- **Lines:** 100% ✅

### Future Goals
- Maintain 100% coverage for services layer
- Add controller tests (target: 90%+)
- Add middleware tests (target: 90%+)
- Add integration tests for API endpoints

---

## 📚 Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Testing Best Practices](https://testingjavascript.com/)

### Examples
- Service tests: `test/services/wallets.test.js`
- API documentation: `docs/API_WALLET.md`
- Test examples: `docs/API_TEST_EXAMPLES.md`

