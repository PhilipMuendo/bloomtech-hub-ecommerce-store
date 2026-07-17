module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, update any existing products that don't have a subcategory
    // Set a default subcategory based on their category
    await queryInterface.sequelize.query(`
      UPDATE products
      SET subcategory = CASE
        WHEN category = 'security' THEN 'dome-cameras'
        WHEN category = 'ict' THEN 'desktop-computers'
        WHEN category = 'electrical' THEN 'power-cables'
        WHEN category = 'power' THEN 'monocrystalline-panels'
        ELSE 'dome-cameras'
      END
      WHERE subcategory IS NULL OR subcategory = ''
    `);

    // Then make the column NOT NULL
    await queryInterface.changeColumn('products', 'subcategory', {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: [2]
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the column to allow NULL
    await queryInterface.changeColumn('products', 'subcategory', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        len: [2]
      }
    });
  }
};
