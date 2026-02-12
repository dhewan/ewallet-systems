import Joi from 'joi'

const createWallet = {
  body: Joi.object().keys({
    userId: Joi.number().integer().required(),
    currency: Joi.string().max(3).required()
  })
}

const topUp = {
  params: Joi.object().keys({
    id: Joi.number().integer().required()
  }),
  body: Joi.object().keys({
    amount: Joi.number().positive().required()
  })
}
const pay = {
  params: Joi.object().keys({
    id: Joi.number().integer().required()
  }),
  body: Joi.object().keys({
    amount: Joi.number().positive().required()
  })
}
const transfer = {
  body: Joi.object().keys({
    fromWalletId: Joi.number().integer().required(),
    targetWalletId: Joi.number().integer().required(),
    amount: Joi.number().positive().required()
  })
}
const suspend = {
  params: Joi.object().keys({
    id: Joi.number().integer().required()
  })
}
const getWalletDetails = {
  params: Joi.object().keys({
    id: Joi.number().integer().required()
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
