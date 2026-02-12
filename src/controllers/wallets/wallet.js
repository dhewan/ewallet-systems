import Models from '../../db/mysql/models/index.js'
import { catchAsync, formatDecimal } from '../../utils/helpers.js'
import { SuccessRes, ErrorRes } from '../../utils/response.js'
import { createWallet, getWalletById, getWalletByOwnerAndCurrency, updateWalletBalance } from '../../services/wallets.js'

const { Wallets, Ledgers, sequelize } = Models

const createUserWallet = catchAsync(async (req, res) => {
  const { userId, currency } = req.body
  const data = await createWallet({
    ownerId: userId,
    currency
  })

  if (data.error) {
    return ErrorRes(res, data)
  }

  return SuccessRes(res, {
    code: 201,
    message: 'Wallet data created successfully.',
    data
  })
})

const topUp = catchAsync(async (req, res) => {
  const { id } = req.params
  const { amount: topUpAmount } = req.body
  const amount = formatDecimal(topUpAmount, 2)

  await sequelize.transaction(async (t) => {
    const wallet = await getWalletById(id)
    if (wallet.error) return ErrorRes(res, wallet)
    if (wallet.status === 'SUSPENDED') {
      return ErrorRes(res, { code: 400, error: 'Cannot top up a suspended wallet.' })
    }

    const newBalance = parseFloat(wallet.balance) + parseFloat(amount)
    await updateWalletBalance(id, newBalance, t)

    await Ledgers.create({
      walletId: wallet.walletId,
      transactionId: `TXN-${Date.now()}`,
      currency: wallet.currency,
      type: 'CREDIT',
      amount: parseFloat(amount),
      before: parseFloat(wallet.balance),
      after: newBalance,
      description: 'Top up balance'
    }, { transaction: t })

    const data = await Wallets.findOne({ where: { id }, transaction: t })

    return SuccessRes(res, {
      code: 200,
      message: 'Top up successful.',
      data
    })
  })
})

const pay = catchAsync(async (req, res) => {
  const { id } = req.params
  const { amount: payAmount } = req.body
  const amount = formatDecimal(payAmount, 2)

  await sequelize.transaction(async (t) => {
    const wallet = await getWalletById(id)
    if (wallet.error) return ErrorRes(res, wallet)

    if (wallet.status === 'SUSPENDED') {
      return ErrorRes(res, { code: 400, error: 'Cannot pay from a suspended wallet.' })
    }

    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      return ErrorRes(res, { code: 400, error: 'Insufficient balance.' })
    }

    const newBalance = parseFloat(wallet.balance) - parseFloat(amount)
    await updateWalletBalance(id, newBalance, t)

    await Ledgers.create({
      walletId: wallet.walletId,
      transactionId: `TXN-${Date.now()}`,
      currency: wallet.currency,
      type: 'DEBIT',
      amount: parseFloat(amount),
      before: parseFloat(wallet.balance),
      after: newBalance,
      description: 'Payment deduction'
    }, { transaction: t })

    const data = await getWalletById(id)

    return SuccessRes(res, {
      code: 200,
      message: 'Payment successful.',
      data
    })
  })
})

const transfer = catchAsync(async (req, res) => {
  const { fromWalletId, targetWalletId, amount: transferAmount } = req.body
  const amount = formatDecimal(transferAmount, 2)

  const fromWallet = await getWalletById(fromWalletId)
  if (fromWallet.error) return ErrorRes(res, fromWallet)
  if (fromWallet.status === 'SUSPENDED') {
    return ErrorRes(res, { code: 400, error: 'Cannot transfer from a suspended wallet.' })
  }

  const targetWallet = await getWalletByOwnerAndCurrency(targetWalletId, fromWallet.currency)
  if (targetWallet.error) return ErrorRes(res, targetWallet)
  if (targetWallet.status === 'SUSPENDED') {
    return ErrorRes(res, { code: 400, error: 'Cannot transfer to a suspended wallet.' })
  }

  if (parseFloat(fromWallet.balance) < parseFloat(amount)) {
    return ErrorRes(res, { code: 400, error: 'Insufficient balance in source wallet.' })
  }

  if (fromWallet.walletId === targetWallet.walletId) {
    return ErrorRes(res, { code: 400, error: 'Cannot transfer to the same wallet.' })
  }

  if (fromWallet.currency !== targetWallet.currency) {
    return ErrorRes(res, { code: 400, error: 'Currency mismatch between wallets.' })
  }

  await sequelize.transaction(async (t) => {
    // Deduct from source wallet
    const newFromBalance = parseFloat(fromWallet.balance) - parseFloat(amount)
    await updateWalletBalance(fromWallet.id, newFromBalance, t)

    await fromWallet.reload({ transaction: t })
    await Ledgers.create({
      walletId: fromWallet.walletId,
      transactionId: `TXN-${Date.now()}`,
      currency: fromWallet.currency,
      type: 'DEBIT',
      amount: parseFloat(amount),
      before: parseFloat(fromWallet.balance),
      after: newFromBalance,
      description: `Transfer to wallet ${targetWallet.walletId}`
    }, { transaction: t })

    // Credit to target wallet
    const newTargetBalance = parseFloat(targetWallet.balance) + parseFloat(amount)
    await updateWalletBalance(targetWallet.id, newTargetBalance, t)

    await targetWallet.reload({ transaction: t })
    await Ledgers.create({
      walletId: targetWallet.walletId,
      transactionId: `TXN-${Date.now()}`,
      currency: targetWallet.currency,
      type: 'CREDIT',
      amount: parseFloat(amount),
      before: parseFloat(targetWallet.balance),
      after: newTargetBalance,
      description: `Transfer from wallet ${fromWallet.walletId}`
    }, { transaction: t })

    return SuccessRes(res, {
      code: 200,
      message: 'Transfer successful.',
      data: {
        fromWallet,
        targetWallet
      }
    })
  })
})

const suspend = catchAsync(async (req, res) => {
  const { id } = req.params
  const wallet = await getWalletById(id)
  if (wallet.error) return ErrorRes(res, wallet)
  if (wallet.status === 'SUSPENDED') {
    return ErrorRes(res, { code: 400, error: 'Wallet is already suspended.' })
  }

  await wallet.update({ status: 'SUSPENDED' })

  return SuccessRes(res, {
    code: 200,
    message: 'Wallet suspended successfully.',
    data: null
  })
})

const getWalletDetails = catchAsync(async (req, res) => {
  const { id } = req.params
  const data = await Wallets.findOne({ where: { id } })
  if (!data) return ErrorRes(res, { code: 404, error: 'Wallet not found.' })

  return SuccessRes(res, {
    code: 200,
    message: 'Wallet details fetched successfully.',
    data
  })
})

export default {
  createUserWallet,
  topUp,
  pay,
  transfer,
  suspend,
  getWalletDetails
}
