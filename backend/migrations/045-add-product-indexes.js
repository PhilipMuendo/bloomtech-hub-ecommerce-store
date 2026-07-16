'use strict';

/**
 * Adds indexes to the `products` table to support the filtering, sorting and
 * search performed by GET /api/products. Without these, every catalog query
 * is a full table scan that degrades as the product count grows.
 *
 *  - category, (category, subcategory): category / subcategory filters
 *  - price:    price sorting
 *  - featured: "featured products" lookups (Home page)
 *
 * NOTE: search still uses LIKE '%term%' (leading wildcard, un-indexable). The
 * next step for search scalability is a FULLTEXT(name, description) index with a
 * MATCH ... AGAINST query — deferred here because it changes search semantics
 * (word/min-token based) and should be validated against real data first.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const addIndexIfMissing = async (options) => {
      try {
        await queryInterface.addIndex('products', options);
      } catch (err) {
        // Index already exists (or table not present yet) — safe to ignore.
        if (!/exists|duplicate/i.test(err.message)) {
          console.warn(`Skipping index ${options.name}: ${err.message}`);
        }
      }
    };

    await addIndexIfMissing({ fields: ['category'], name: 'products_category_idx' });
    await addIndexIfMissing({ fields: ['category', 'subcategory'], name: 'products_category_subcategory_idx' });
    await addIndexIfMissing({ fields: ['price'], name: 'products_price_idx' });
    await addIndexIfMissing({ fields: ['featured'], name: 'products_featured_idx' });
  },

  down: async (queryInterface) => {
    const removeIndexIfExists = async (name) => {
      try {
        await queryInterface.removeIndex('products', name);
      } catch (err) {
        // ignore if missing
      }
    };

    await removeIndexIfExists('products_category_idx');
    await removeIndexIfExists('products_category_subcategory_idx');
    await removeIndexIfExists('products_price_idx');
    await removeIndexIfExists('products_featured_idx');
  },
};
