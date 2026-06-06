import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const { user, currentRole } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial orders and set up realtime subscription
  useEffect(() => {
    // If we're not logged in, we shouldn't fetch the massive orders list unless we have to, 
    // but for the sake of the demo, we will fetch them all. Ideally, filter by user/role.
    fetchOrders();

    const ordersSubscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => (o.id === payload.new.id ? payload.new : o)));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // In a real app we would restrict this based on role using RLS, 
      // e.g. Customer only sees their orders, Shopkeeper sees orders for their shop.
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('placed_at', { ascending: false });
        
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = useCallback(async (orderData) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          customer_id: user?.id || null,
          customer_name: orderData.name,
          customer_phone: orderData.phone,
          customer_address: orderData.address,
          shop_name: orderData.shopName,
          items: orderData.items,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.deliveryFee,
          total: orderData.total,
          status: 'pending',
          payment_method: 'COD'
        }])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error("Error adding order:", err.message);
      throw err;
    }
  }, [user]);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      // Optimistic update
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
      if (error) throw error;
    } catch (err) {
      console.error("Error updating order status:", err.message);
      // Revert fetch on error
      fetchOrders();
    }
  }, []);

  const getOrdersByStatus = useCallback(
    (status) => {
      if (!status || status === 'all') return orders;
      if (status === 'active') {
        return orders.filter((o) =>
          ['pending', 'confirmed', 'preparing', 'ready', 'accepted', 'picked_up', 'out_for_delivery'].includes(o.status)
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
      loading,
      addOrder,
      updateOrderStatus,
      getOrdersByStatus,
    }),
    [orders, loading, addOrder, updateOrderStatus, getOrdersByStatus]
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
