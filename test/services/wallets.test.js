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

  describe('getWalletById', () => {
    it('should return wallet when found', async () => {
      // Arrange
      const mockWallet = {
        id: 1,
        ownerId: 100,
        currency: 'USD',
        balance: 1000,
        walletId: 'USD-120226'
      }
      mockFindOne.mockResolvedValue(mockWallet)

      // Act
      const result = await walletService.getWalletById(1)

      // Assert
      expect(result).toEqual(mockWallet)
      expect(mockFindOne).toHaveBeenCalledTimes(1)
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('should return error object with 404 code when wallet not found', async () => {
      // Arrange
      mockFindOne.mockResolvedValue(null)

      // Act
      const result = await walletService.getWalletById(999)

      // Assert
      expect(result).toEqual({
        error: 'Wallet not found.',
        code: 404
      })
      expect(mockFindOne).toHaveBeenCalledTimes(1)
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 999 } })
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
        walletId: 'IDR-120226'
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
        walletId: 'USD-130226',
        balance: 0
      }
      mockCreate.mockResolvedValue(createdWallet)

      // Set fixed date for consistent wallet ID generation
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2026-02-13T10:30:00Z'))

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
        walletId: expect.stringMatching(/^USD-\d{6}$/)
      })
    })

    it('should generate correct wallet ID format with lowercase currency', async () => {
      // Arrange
      mockFindOne.mockResolvedValue(null)
      const createdWallet = {
        id: 20,
        ownerId: 500,
        currency: 'idr',
        walletId: 'IDR-130226'
      }
      mockCreate.mockResolvedValue(createdWallet)

      jest.useFakeTimers()
      jest.setSystemTime(new Date('2026-02-13T10:30:00Z'))

      // Act
      await walletService.createWallet({
        ownerId: 500,
        currency: 'idr'
      })

      // Assert
      const createCallArgs = mockCreate.mock.calls[0][0]
      expect(createCallArgs.walletId).toMatch(/^IDR-\d{6}$/)
      expect(createCallArgs.walletId).toBe('IDR-130226')
    })

    it('should generate wallet ID with correct date format (DDMMYY)', async () => {
      // Arrange
      mockFindOne.mockResolvedValue(null)
      mockCreate.mockResolvedValue({ id: 25 })

      // Test date format generation - using local date
      jest.useFakeTimers()
      const testDate = new Date(2026, 11, 31, 12, 0, 0) // Month is 0-indexed, so 11 = December
      jest.setSystemTime(testDate)

      // Act
      await walletService.createWallet({
        ownerId: 600,
        currency: 'EUR'
      })

      // Assert
      const createCallArgs = mockCreate.mock.calls[0][0]
      // Should match format: CURRENCY-DDMMYY
      expect(createCallArgs.walletId).toMatch(/^EUR-\d{6}$/)
      expect(createCallArgs.walletId).toBe('EUR-311226') // day(31) month(12) year(26)
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
