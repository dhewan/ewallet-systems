'use strict'
/** @type {import('sequelize-cli').Migration} */
export async function up (queryInterface, Sequelize) {
  await queryInterface.createTable('ledgers', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    walletId: {
      allowNull: false,
      field: 'wallet_id',
      type: Sequelize.STRING,
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      references: {
        model: 'wallets',
        key: 'wallet_id'
      }
    },
    transactionId: {
      allowNull: false,
      type: Sequelize.STRING
    },
    currency: {
      allowNull: false,
      type: Sequelize.STRING(10)
    },
    type: {
      allowNull: false,
      type: Sequelize.ENUM('DEBIT', 'CREDIT')
    },
    amount: {
      allowNull: false,
      type: Sequelize.DECIMAL(20, 2)
    },
    before: {
      allowNull: false,
      type: Sequelize.DECIMAL(20, 2)
    },
    after: {
      allowNull: false,
      type: Sequelize.DECIMAL(20, 2)
    },
    description: {
      allowNull: true,
      type: Sequelize.STRING
    },
    createdAt: {
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'created_at',
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      field: 'updated_at',
      type: Sequelize.DATE
    },
    deleted: {
      allowNull: false,
      defaultValue: 0,
      type: Sequelize.INTEGER(1)
    }
  })
}
export async function down (queryInterface) {
  await queryInterface.dropTable('ledgers')
}
