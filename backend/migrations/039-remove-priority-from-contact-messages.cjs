module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ContactMessages', 'priority');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ContactMessages', 'priority', {
      type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
      allowNull: false
    });
  }
};
