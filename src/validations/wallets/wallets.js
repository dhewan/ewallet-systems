import Joi from 'joi'

const createWallet = {
  body: Joi.object().keys({
    userId: Joi.number().integer().required(),
    currency: Joi.string().max(10).required().alphanum()
  })
}

const topUp = {
  params: Joi.object().keys({
    walletId: Joi.string().required()
  }),
  body: Joi.object().keys({
    amount: Joi.number().positive().min(0.01).required(),
    code: Joi.string().required()
  })
}
const pay = {
  params: Joi.object().keys({
    walletId: Joi.string().required()
  }),
  body: Joi.object().keys({
    amount: Joi.number().positive().min(0.01).required()
  })
}
const transfer = {
  body: Joi.object().keys({
    fromWalletId: Joi.string().required(),
    targetWalletId: Joi.string().required(),
    amount: Joi.number().positive().min(0.01).required()
  })
}
const suspend = {
  params: Joi.object().keys({
    walletId: Joi.string().required()
  })
}
const getWalletDetails = {
  params: Joi.object().keys({
    walletId: Joi.string().required()
  })
}

export default {
  createWallet,
  topUp,
  pay,
  transfer,
  suspend,
  getWalletDetails
}
