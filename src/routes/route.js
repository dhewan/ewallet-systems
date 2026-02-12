import express from 'express'
// import { rateLimitHandler } from '../middlewares/limiter.js'

// MIDDLEWARES
import validate from '../middlewares/request.js'

// CONTROLLERS ROUTES
import walletController from '../controllers/wallets/wallet.js'

// VALIDATIONS
import walletValidation from '../validations/wallets/wallets.js'

// const AuthRateLimit = (req, res, next) => {
//   req.key = 'game'
//   req.limit = 60
//   req.duration = 60
//   rateLimitHandler(req, res, next)
// }

// ROUTINGS
const walletRouter = express.Router()

// Create wallet
walletRouter.post('/', validate(walletValidation.createWallet), walletController.createUserWallet)

// Top-up wallet
walletRouter.post('/:id/topup', validate(walletValidation.topUp), walletController.topUp)

// Pay from wallet
walletRouter.post('/:id/pay', validate(walletValidation.pay), walletController.pay)

// Transfer funds
walletRouter.post('/transfer', validate(walletValidation.transfer), walletController.transfer)

// Suspend wallet
walletRouter.post('/:id/suspend', validate(walletValidation.suspend), walletController.suspend)

// Get wallet status
walletRouter.get('/:id', validate(walletValidation.getWalletDetails), walletController.getWalletDetails)

export default {
  walletRouter
}
