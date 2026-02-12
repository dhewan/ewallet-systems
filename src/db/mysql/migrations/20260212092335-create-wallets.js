'use strict'
/** @type {import('sequelize-cli').Migration} */
export async function up (queryInterface, Sequelize) {
  await queryInterface.createTable('wallets', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    walletId: {
      allowNull: false,
      unique: true,
      field: 'wallet_id',
      type: Sequelize.STRING,
      foreignKey: true
    },
    ownerId: {
      allowNull: false,
      field: 'owner_id',
      type: Sequelize.INTEGER,
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    currency: {
      allowNull: false,
      type: Sequelize.STRING(10)
    },
    balance: {
      allowNull: false,
      type: Sequelize.DECIMAL(20, 2),
      defaultValue: 0
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM('ACTIVE', 'SUSPENDED'),
      defaultValue: 'ACTIVE'
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
  await queryInterface.dropTable('wallets')
}
