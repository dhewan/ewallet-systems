import { ErrorRes } from '../utils/response.js'
// ROUTES
import WalletRouter from './route.js'

// ROUTINGS
const Route = (app) => {
  // Wallet
  app.use('/wallet', WalletRouter.walletRouter)

  // catch 404 and forward to error handler
  app.use((req, res) => {
    ErrorRes(res, { code: 404, error: 'No such route exists' })
  })
}

export default Route
