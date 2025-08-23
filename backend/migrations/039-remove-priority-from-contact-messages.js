export async function up(queryInterface, Sequelize) {
  await queryInterface.removeColumn('ContactMessages', 'priority');
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.addColumn('ContactMessages', 'priority', {
    type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    allowNull: false
  });
}
