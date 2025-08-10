import React from 'react';

// Real-time update system for lists across the platform
export const REAL_TIME_EVENTS = {
  // Product related events
  PRODUCTS_UPDATED: 'productsUpdated',
  SUBcategories_UPDATED: 'subcategoriesUpdated',
  LOW_STOCK_UPDATED: 'lowStockUpdated',
  
  // Order related events
  ORDERS_UPDATED: 'ordersUpdated',
  ORDER_STATUS_CHANGED: 'orderStatusChanged',
  NEW_ORDER_CREATED: 'newOrderCreated',
  
  // User related events
  USERS_UPDATED: 'usersUpdated',
  USER_STATUS_CHANGED: 'userStatusChanged',
  
  // Content related events
  BLOGS_UPDATED: 'blogsUpdated',
  REVIEWS_UPDATED: 'reviewsUpdated',
  NEWSLETTER_UPDATED: 'newsletterUpdated',
  
  // Financial events
  TRANSACTIONS_UPDATED: 'transactionsUpdated',
  PAYMENTS_UPDATED: 'paymentsUpdated',
  
  // Quote events
  QUOTES_UPDATED: 'quotesUpdated',
  QUOTE_STATUS_CHANGED: 'quoteStatusChanged',
  
  // User-facing events
  WISHLIST_UPDATED: 'wishlistUpdated',
  CART_UPDATED: 'cartUpdated',
  
  // Audit events
  AUDIT_LOGS_UPDATED: 'auditLogsUpdated',
} as const;

export type RealTimeEventType = typeof REAL_TIME_EVENTS[keyof typeof REAL_TIME_EVENTS];

export interface RealTimeEventData {
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  entityType: string;
  entityId?: string | number;
  data?: any;
  timestamp: number;
}

export const dispatchRealTimeEvent = (eventType: RealTimeEventType, data: RealTimeEventData) => {
  const event = new CustomEvent(eventType, { 
    detail: { ...data, timestamp: Date.now() } 
  });
  window.dispatchEvent(event);
  console.log(`🔄 Real-time event dispatched: ${eventType}`, data);
};

export const useRealTimeUpdates = (eventTypes: RealTimeEventType[], callback: (event: CustomEvent) => void) => {
  React.useEffect(() => {
    const handleEvent = (event: CustomEvent) => {
      callback(event);
    };

    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleEvent as EventListener);
    });

    return () => {
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleEvent as EventListener);
      });
    };
  }, [eventTypes, callback]);
};

// Hook for automatic list refresh
export const useAutoRefreshList = (
  fetchFunction: () => Promise<void>,
  eventTypes: RealTimeEventType[],
  dependencies: any[] = []
) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const refreshList = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchFunction();
    } catch (error) {
      console.error('Error refreshing list:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFunction]);

  useRealTimeUpdates(eventTypes, () => {
    refreshList();
  });

  React.useEffect(() => {
    refreshList();
  }, dependencies);

  return { isRefreshing, refreshList };
};
