'use strict'

const Model = (sequelize, DataTypes) => {
  const Wallets = sequelize.define('Wallets', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(11)
    },
    walletId: {
      allowNull: false,
      unique: true,
      field: 'wallet_id',
      type: DataTypes.STRING
    },
    ownerId: {
      allowNull: false,
      field: 'owner_id',
      type: DataTypes.INTEGER
    },
    currency: {
      allowNull: false,
      type: DataTypes.STRING(10)
    },
    balance: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 2),
      defaultValue: 0,
      get () {
        const rawValue = this.getDataValue('balance')
        return parseFloat(rawValue)
      }
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
    tableName: 'wallets',
    timestamps: false,
    defaultScope: {
      where: {
        deleted: 0
      },
      attributes: { exclude: ['deleted'] }
    },
    scopes: {
      all: {
        attributes: { exclude: ['deleted'] }
      }
    }
  })

  return Wallets
}
export default Model
