import db, { sequelize } from '../sequelize_models/index.js';
import { Op } from 'sequelize';

const { Product } = db;

export class InsufficientStockError extends Error {
  constructor(productId) {
    super(`Insufficient stock for product ${productId}`);
    this.code = 'INSUFFICIENT_STOCK';
    this.productId = productId;
  }
}

/**
 * Atomically decrement stock for each order item. The `stock >= qty` guard in
 * the WHERE clause is what makes concurrent checkouts for the last units safe:
 * a plain check-then-decrement lets two requests both pass the check and drive
 * stock negative. Callers must run this inside the same transaction that
 * creates the order, so a failed line item rolls the whole order back.
 */
export const decrementStockOrThrow = async (items, transaction) => {
  for (const item of items) {
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new InsufficientStockError(item.productId);
    }
    const [affected] = await Product.update(
      { stock: sequelize.literal(`stock - ${qty}`) },
      {
        where: { id: item.productId, stock: { [Op.gte]: qty } },
        transaction,
      }
    );
    if (affected === 0) {
      throw new InsufficientStockError(item.productId);
    }
  }
};

/** Return previously-decremented stock (order cancellation / abandonment). */
export const restoreStock = async (items, transaction) => {
  for (const item of items) {
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty <= 0) continue;
    await Product.increment('stock', {
      by: qty,
      where: { id: item.productId },
      transaction,
    });
  }
};
