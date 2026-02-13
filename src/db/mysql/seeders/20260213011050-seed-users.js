/** @type {import('sequelize-cli').Migration} */

export async function up (queryInterface) {
  await queryInterface.bulkInsert('users', [
    {
      username: 'Brandon'
    },
    {
      username: 'Jonas'
    },
    {
      username: 'Kane'
    }
  ])
}
export async function down (queryInterface) {
  await queryInterface.bulkDelete('users', null, {})
}
