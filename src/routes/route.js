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

walletRouter.post('/', validate(walletValidation.createWallet), walletController.createUserWallet)
walletRouter.post('/:id/topup', validate(walletValidation.topUp), walletController.topUp)
walletRouter.post('/:id/pay', validate(walletValidation.pay), walletController.pay)
walletRouter.post('/transfer', validate(walletValidation.transfer), walletController.transfer)
walletRouter.post('/:id/suspend', validate(walletValidation.suspend), walletController.suspend)
walletRouter.get('/:id', validate(walletValidation.getWalletDetails), walletController.getWalletDetails)

export default {
  walletRouter
}
