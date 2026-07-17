import db from '../sequelize_models/index.js';
import { Op } from 'sequelize';
import logger from './logger.js';

const { Quote } = db;

const HOUR_MS = 60 * 60 * 1000;

/**
 * Auto-decline priced quotes the customer never accepted or declined by
 * their expiresAt deadline. Only touches 'responded' quotes that never
 * became an order — anything already closed/declined/orderCreated is left
 * alone.
 */
export const expireStaleQuotes = async () => {
  const [count] = await Quote.update(
    { status: 'declined' },
    {
      where: {
        status: 'responded',
        orderCreated: false,
        expiresAt: { [Op.lt]: new Date() },
      },
    }
  );

  if (count > 0) {
    logger.info(`Quote expiry sweep auto-declined ${count} stale quote(s)`);
  }
};

/** Run the sweep hourly (plus once shortly after boot). */
export const startQuoteExpirySweep = () => {
  const run = () =>
    expireStaleQuotes().catch((err) =>
      logger.error('Quote expiry sweep failed', { error: err.message })
    );
  setTimeout(run, 90 * 1000);
  const interval = setInterval(run, HOUR_MS);
  interval.unref?.();
};
