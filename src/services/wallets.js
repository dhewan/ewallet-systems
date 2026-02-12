import db from '../db/mysql/models/index.js'

const { Wallets } = db

export const getWalletById = async (id) => {
  const wallet = await Wallets.findOne({ where: { id } })
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

export const createWallet = async ({ ownerId, currency }) => {
  const ownerHaveWallet = await Wallets.findOne({ where: { ownerId, currency } })
  if (ownerHaveWallet) {
    return {
      error: 'Owner already have wallet with this currency.',
      code: 400
    }
  }
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (`0${date.getMonth() + 1}`).slice(-2)
  const day = (`0${date.getDate()}`).slice(-2)

  const wallet = await Wallets.create({
    ownerId,
    currency,
    walletId: `${currency.toUpperCase()}-${day}${month}${year}`
  })

  return wallet
}

export const updateWalletBalance = async (id, newBalance, transaction) => {
  await Wallets.update(
    { balance: newBalance },
    { where: { id }, transaction }
  )
}
