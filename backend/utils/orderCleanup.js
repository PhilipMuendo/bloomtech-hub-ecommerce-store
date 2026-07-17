import db, { sequelize } from '../sequelize_models/index.js';
import { Op } from 'sequelize';
import logger from './logger.js';
import { restoreStock } from './inventory.js';

const { Order, OrderItem, Transaction } = db;

const HOUR_MS = 60 * 60 * 1000;

// Orders created without any payment method attached (checkout started, payment
// never initiated/completed) hold reserved stock — release after 48h.
const UNPAID_MAX_AGE_MS = 48 * HOUR_MS;
// Bank transfers legitimately take days to arrive — give them a week.
const BANK_TRANSFER_MAX_AGE_MS = 7 * 24 * HOUR_MS;

/**
 * Cancel stale pending orders that were never paid and return their reserved
 * stock. Pesapal orders are never touched: they are only created after the
 * IPN confirms payment. Any order with a completed transaction is skipped as
 * a final safety check.
 */
export const releaseAbandonedOrders = async () => {
  const now = Date.now();
  const staleOrders = await Order.findAll({
    where: {
      status: 'pending',
      [Op.or]: [
        {
          paymentMethod: null,
          createdAt: { [Op.lt]: new Date(now - UNPAID_MAX_AGE_MS) },
        },
        {
          paymentMethod: 'bank_transfer',
          createdAt: { [Op.lt]: new Date(now - BANK_TRANSFER_MAX_AGE_MS) },
        },
      ],
    },
    include: [{ model: OrderItem }],
  });

  let released = 0;
  for (const order of staleOrders) {
    const paid = await Transaction.findOne({
      where: { orderId: String(order.id), status: 'completed' },
    });
    if (paid) continue;

    try {
      await sequelize.transaction(async (t) => {
        await order.update({ status: 'cancelled' }, { transaction: t });
        await restoreStock(order.OrderItems ?? [], t);
      });
      released += 1;
      logger.info('Released stock from abandoned order', {
        orderId: order.id,
        paymentMethod: order.paymentMethod || 'none',
        createdAt: order.createdAt,
      });
    } catch (err) {
      logger.error('Failed to release abandoned order', {
        orderId: order.id,
        error: err.message,
      });
    }
  }

  if (released > 0) {
    logger.info(`Abandoned order sweep released ${released} order(s)`);
  }
};

/** Run the sweep hourly (plus once shortly after boot). */
export const startAbandonedOrderSweep = () => {
  const run = () =>
    releaseAbandonedOrders().catch((err) =>
      logger.error('Abandoned order sweep failed', { error: err.message })
    );
  setTimeout(run, 60 * 1000);
  const interval = setInterval(run, HOUR_MS);
  interval.unref?.(); // don't keep the process alive during shutdown
};
