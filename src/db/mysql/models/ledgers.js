'use strict'

import { formatDecimal } from '../../../utils/helpers.js'

const Model = (sequelize, DataTypes) => {
  const Ledgers = sequelize.define('Ledgers', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(11)
    },
    walletId: {
      allowNull: false,
      field: 'wallet_id',
      type: DataTypes.STRING
    },
    transactionId: {
      allowNull: false,
      type: DataTypes.STRING
    },
    currency: {
      allowNull: false,
      type: DataTypes.STRING(10)
    },
    type: {
      allowNull: false,
      type: DataTypes.ENUM('DEBIT', 'CREDIT')
    },
    amount: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 2),
      get () {
        const rawValue = this.getDataValue('amount')
        return formatDecimal(rawValue, 2)
      }
    },
    before: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 2),
      get () {
        const rawValue = this.getDataValue('before')
        return formatDecimal(rawValue, 2)
      }
    },
    after: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 2),
      get () {
        const rawValue = this.getDataValue('after')
        return formatDecimal(rawValue, 2)
      }
    },
    description: {
      allowNull: true,
      type: DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
      type: DataTypes.DATE
    },
    deleted: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER(1)
    }
  }, {
    tableName: 'ledgers',
    timestamps: false,
    defaultScope: {
      where: {
        deleted: 0
      },
      attributes: { exclude: ['deleted', 'type', 'password'] }
    },
    scopes: {
      all: {
        attributes: { exclude: ['deleted'] }
      }
    }
  })

  return Ledgers
}
export default Model
