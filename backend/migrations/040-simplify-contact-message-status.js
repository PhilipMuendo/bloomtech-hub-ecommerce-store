export async function up(queryInterface, Sequelize) {
  // First, update any existing 'replied' or 'closed' statuses to 'read'
  await queryInterface.sequelize.query(`
    UPDATE ContactMessages 
    SET status = 'read' 
    WHERE status IN ('replied', 'closed')
  `);

  // Then modify the enum to only include 'new' and 'read'
  await queryInterface.changeColumn('ContactMessages', 'status', {
    type: Sequelize.ENUM('new', 'read'),
    defaultValue: 'new',
    allowNull: false
  });
}

export async function down(queryInterface, Sequelize) {
  // Restore the original enum with all statuses
  await queryInterface.changeColumn('ContactMessages', 'status', {
    type: Sequelize.ENUM('new', 'read', 'replied', 'closed'),
    defaultValue: 'new',
    allowNull: false
  });
}
