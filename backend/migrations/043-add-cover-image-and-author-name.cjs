'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const addColumnIfMissing = async (table, column, definition) => {
      const description = await queryInterface.describeTable(table);
      if (!description[column]) {
        await queryInterface.addColumn(table, column, definition);
      }
    };

    await addColumnIfMissing('Blogs', 'coverImage', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Primary hero / cover image for the blog post',
    });

    await addColumnIfMissing('Blogs', 'authorName', {
      type: Sequelize.STRING(120),
      allowNull: true,
      comment: 'Display name for the post author',
    });

    // Backfill with legacy data if available
    await queryInterface.sequelize.query(
      'UPDATE `Blogs` SET coverImage = image WHERE coverImage IS NULL AND image IS NOT NULL;'
    );
    await queryInterface.sequelize.query(
      'UPDATE `Blogs` SET authorName = author WHERE authorName IS NULL AND author IS NOT NULL;'
    );
  },

  down: async (queryInterface) => {
    const dropColumnIfExists = async (table, column) => {
      try {
        const description = await queryInterface.describeTable(table);
        if (description[column]) {
          await queryInterface.removeColumn(table, column);
        }
      } catch (err) {
        // ignore if table/column missing
      }
    };

    await dropColumnIfExists('Blogs', 'coverImage');
    await dropColumnIfExists('Blogs', 'authorName');
  },
};
