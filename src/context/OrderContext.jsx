import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { sampleOrders } from "../data/orders";

const OrderContext = createContext(null);

const ORDERS_STORAGE_KEY = 'jandahahub_orders';

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : sampleOrders;
    } catch {
      return sampleOrders;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // silently fail
    }
  }, [orders]);

  const addOrder = useCallback((order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              ...(newStatus === 'delivered'
                ? { deliveredAt: new Date().toISOString() }
                : {}),
            }
          : order
      )
    );
  }, []);

  const getOrdersByStatus = useCallback(
    (status) => {
      if (!status || status === 'all') return orders;
      if (status === 'active') {
        return orders.filter((o) =>
          ['pending', 'confirmed', 'out_for_delivery'].includes(o.status)
        );
      }
      if (status === 'completed') {
        return orders.filter((o) => o.status === 'delivered');
      }
      return orders.filter((o) => o.status === status);
    },
    [orders]
  );

  const value = useMemo(
    () => ({
      orders,
      addOrder,
      updateOrderStatus,
      getOrdersByStatus,
    }),
    [orders, addOrder, updateOrderStatus, getOrdersByStatus]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}

export default OrderContext;
