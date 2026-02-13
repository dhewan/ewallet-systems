import db from '../db/mysql/models/index.js'

const { Wallets } = db

export const getWalletByWalletId = async (walletId, transaction, lock) => {
  const wallet = await Wallets.findOne({ where: { walletId }, transaction, lock })
  if (!wallet) {
    return {
      error: 'Wallet not found.',
      code: 404
    }
  }
  return wallet
}

export const getWalletByOwnerAndCurrency = async (ownerId, currency) => {
  const wallet = await Wallets.findOne({ where: { ownerId, currency } })
  if (!wallet) {
    return {
      error: 'Wallet not found for the specified owner and currency.',
      code: 404
    }
  }
  return wallet
}

export const createWallet = async ({ ownerId, currency: rawCurrency }) => {
  const currency = rawCurrency.toUpperCase()
  const ownerHaveWallet = await Wallets.findOne({ where: { ownerId, currency } })
  if (ownerHaveWallet) {
    return {
      error: 'Owner already have wallet with this currency.',
      code: 400
    }
  }

  const wallet = await Wallets.create({
    ownerId,
    currency,
    walletId: `user${ownerId}-${currency}`
  })

  return wallet
}

export const updateWalletBalance = async (id, newBalance, transaction) => {
  await Wallets.update(
    { balance: newBalance },
    { where: { id }, transaction }
  )
}
