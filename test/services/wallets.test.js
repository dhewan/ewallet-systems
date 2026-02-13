/* eslint-disable import/first */
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals'

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

// Import module under test after mocking dependencies
import * as walletService from '../../src/services/wallets.js'
import db from '../../src/db/mysql/models/index.js'

// Extract mocked functions for easier access
const { Wallets } = db
const mockFindOne = Wallets.findOne
const mockCreate = Wallets.create
const mockUpdate = Wallets.update

describe('Wallet Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Restore real timers after each test
    jest.useRealTimers()
  })

  describe('getWalletByWalletId', () => {
    it('should return wallet when found', async () => {
      // Arrange
      const mockWallet = {
        id: 1,
        ownerId: 100,
        currency: 'USD',
        balance: 1000,
        walletId: 'user100-USD'
      }
      mockFindOne.mockResolvedValue(mockWallet)

      // Act
      const result = await walletService.getWalletByWalletId('user100-USD')

      // Assert
      expect(result).toEqual(mockWallet)
      expect(mockFindOne).toHaveBeenCalledTimes(1)
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { walletId: 'user100-USD' },
        transaction: undefined,
        lock: undefined
      })
    })

    it('should return wallet with transaction and lock when provided', async () => {
      // Arrange
      const mockWallet = {
        id: 1,
        ownerId: 100,
        currency: 'USD',
        balance: 1000,
        walletId: 'user100-USD'
      }
      const mockTransaction = { id: 'txn-123' }
      const mockLock = 'UPDATE'
      mockFindOne.mockResolvedValue(mockWallet)

      // Act
      const result = await walletService.getWalletByWalletId('user100-USD', mockTransaction, mockLock)

      // Assert
      expect(result).toEqual(mockWallet)
      expect(mockFindOne).toHaveBeenCalledTimes(1)
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { walletId: 'user100-USD' },
        transaction: mockTransaction,
        lock: mockLock
      })
    })

    it('should return error object with 404 code when wallet not found', async () => {
      // Arrange
      mockFindOne.mockResolvedValue(null)

      // Act
      const result = await walletService.getWalletByWalletId('user999-USD')

      // Assert
      expect(result).toEqual({
        error: 'Wallet not found.',
        code: 404
      })
      expect(mockFindOne).toHaveBeenCalledTimes(1)
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { walletId: 'user999-USD' },
        transaction: undefined,
        lock: undefined
      })
    })
  })

  describe('getWalletByOwnerAndCurrency', () => {
    it('should return wallet when found with valid owner and currency', async () => {
      // Arrange
      const mockWallet = {
        id: 5,
        ownerId: 200,
        currency: 'IDR',
        balance: 50000,
        walletId: 'user200-IDR'
      }
      mockFindOne.mockResolvedValue(mockWallet)

      // Act
      const result = await walletService.getWalletByOwnerAndCurrency(200, 'IDR')

      // Assert
      expect(result).toEqual(mockWallet)
      expect(mockFindOne).toHaveBeenCalledTimes(1)
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { ownerId: 200, currency: 'IDR' }
      })
    })

    it('should return error object with 404 code when wallet not found', async () => {
      // Arrange
      mockFindOne.mockResolvedValue(null)

      // Act
      const result = await walletService.getWalletByOwnerAndCurrency(999, 'EUR')

      // Assert
      expect(result).toEqual({
        error: 'Wallet not found for the specified owner and currency.',
        code: 404
      })
      expect(mockFindOne).toHaveBeenCalledTimes(1)
    })
  })

  describe('createWallet', () => {
    it('should return error when owner already has wallet with same currency', async () => {
      // Arrange
      const existingWallet = {
        id: 10,
        ownerId: 300,
        currency: 'USD'
      }
      mockFindOne.mockResolvedValue(existingWallet)

      // Act
      const result = await walletService.createWallet({
        ownerId: 300,
        currency: 'USD'
      })

      // Assert
      expect(result).toEqual({
        error: 'Owner already have wallet with this currency.',
        code: 400
      })
      expect(mockFindOne).toHaveBeenCalledTimes(1)
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { ownerId: 300, currency: 'USD' }
      })
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('should create wallet successfully when owner does not have wallet', async () => {
      // Arrange
      mockFindOne.mockResolvedValue(null)
      const createdWallet = {
        id: 15,
        ownerId: 400,
        currency: 'USD',
        walletId: 'user400-USD',
        balance: 0
      }
      mockCreate.mockResolvedValue(createdWallet)

      // Act
      const result = await walletService.createWallet({
        ownerId: 400,
        currency: 'USD'
      })

      // Assert
      expect(result).toEqual(createdWallet)
      expect(mockFindOne).toHaveBeenCalledTimes(1)
      expect(mockCreate).toHaveBeenCalledTimes(1)

      const createCallArgs = mockCreate.mock.calls[0][0]
      expect(createCallArgs).toEqual({
        ownerId: 400,
        currency: 'USD',
        walletId: 'user400-USD'
      })
    })

    it('should auto-uppercase currency code when creating wallet', async () => {
      // Arrange
      mockFindOne.mockResolvedValue(null)
      const createdWallet = {
        id: 20,
        ownerId: 500,
        currency: 'IDR',
        walletId: 'user500-IDR'
      }
      mockCreate.mockResolvedValue(createdWallet)

      // Act
      const result = await walletService.createWallet({
        ownerId: 500,
        currency: 'idr' // lowercase input
      })

      // Assert
      expect(result).toEqual(createdWallet)
      const createCallArgs = mockCreate.mock.calls[0][0]
      expect(createCallArgs.currency).toBe('IDR') // uppercase in database
      expect(createCallArgs.walletId).toBe('user500-IDR')
    })

    it('should generate correct wallet ID format: user{ownerId}-{CURRENCY}', async () => {
      // Arrange
      mockFindOne.mockResolvedValue(null)
      const createdWallet = {
        id: 25,
        ownerId: 600,
        currency: 'EUR',
        walletId: 'user600-EUR'
      }
      mockCreate.mockResolvedValue(createdWallet)

      // Act
      await walletService.createWallet({
        ownerId: 600,
        currency: 'EUR'
      })

      // Assert
      const createCallArgs = mockCreate.mock.calls[0][0]
      expect(createCallArgs.walletId).toBe('user600-EUR')
      expect(createCallArgs.walletId).toMatch(/^user\d+-[A-Z]+$/)
    })
  })

  describe('updateWalletBalance', () => {
    it('should update wallet balance with transaction', async () => {
      // Arrange
      const mockTransaction = { id: 'transaction-123' }
      mockUpdate.mockResolvedValue([1]) // Sequelize returns array [affectedCount]

      // Act
      await walletService.updateWalletBalance(10, 5000, mockTransaction)

      // Assert
      expect(mockUpdate).toHaveBeenCalledTimes(1)
      expect(mockUpdate).toHaveBeenCalledWith(
        { balance: 5000 },
        {
          where: { id: 10 },
          transaction: mockTransaction
        }
      )
    })
  })
})
