'use strict'

import { catchAsync } from '../utils/helpers.js'
import { ErrorRes } from '../utils/response.js'

const validate = (validation) => {
  return catchAsync(async (req, res, next) => {
    const request = { body: req.body, query: req.query, params: req.params }

    try {
      // loop validation keys and validate each key
      for (const validationKey in validation) {
        const schema = validation[validationKey]
        const value = request[validationKey]
        if (schema !== undefined) {
          await schema.validateAsync(value)
        }
      }
    } catch (error) {
      return ErrorRes(res, { code: 400, error: error.details[0].message })
    }

    next()
  })
}

export default validate
