/* eslint-disable import/first */
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('../../src/db/mysql/models/index.js', () => ({
  __esModule: true,
  default: {
    Users: {
      findOne: jest.fn()
    }
  }
}))

// Import module under test after mocking dependencies
import * as userService from '../../src/services/users.js'
import db from '../../src/db/mysql/models/index.js'

// Extract mocked functions for easier access
const { Users } = db
const mockFindOne = Users.findOne

describe('User Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: '2026-02-13T10:00:00.000Z',
        updatedAt: '2026-02-13T10:00:00.000Z'
      }
      mockFindOne.mockResolvedValue(mockUser)

      // Act
      const result = await userService.getUserById(1)

      // Assert
      expect(result).toEqual(mockUser)
      expect(mockFindOne).toHaveBeenCalledTimes(1)
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('should return error object with 404 code when user not found', async () => {
      // Arrange
      mockFindOne.mockResolvedValue(null)

      // Act
      const result = await userService.getUserById(999)

      // Assert
      expect(result).toEqual({
        error: 'User not found.',
        code: 404
      })
      expect(mockFindOne).toHaveBeenCalledTimes(1)
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 999 } })
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      const dbError = new Error('Database connection failed')
      mockFindOne.mockRejectedValue(dbError)

      // Act & Assert
      await expect(userService.getUserById(1)).rejects.toThrow('Database connection failed')
      expect(mockFindOne).toHaveBeenCalledTimes(1)
    })

    it('should work with different user IDs', async () => {
      // Arrange
      const mockUser1 = { id: 5, name: 'User 5', email: 'user5@example.com' }
      const mockUser2 = { id: 100, name: 'User 100', email: 'user100@example.com' }

      mockFindOne.mockResolvedValueOnce(mockUser1).mockResolvedValueOnce(mockUser2)

      // Act
      const result1 = await userService.getUserById(5)
      const result2 = await userService.getUserById(100)

      // Assert
      expect(result1).toEqual(mockUser1)
      expect(result2).toEqual(mockUser2)
      expect(mockFindOne).toHaveBeenCalledTimes(2)
      expect(mockFindOne).toHaveBeenNthCalledWith(1, { where: { id: 5 } })
      expect(mockFindOne).toHaveBeenNthCalledWith(2, { where: { id: 100 } })
    })
  })
})
