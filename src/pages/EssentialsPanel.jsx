import React, { useState, useEffect, useCallback } from 'react';
import { Package, CheckCircle, Clock, Loader2, AlertCircle, Phone, MapPin, Store, RefreshCw, ShoppingBag, Plus, Trash2, Edit2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'accepted', 'picked_up', 'out_for_delivery'];

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function statusColor(status) {
  switch (status) {
    case 'pending':
    case 'confirmed': return 'bg-yellow-100 text-yellow-700';
    case 'preparing': return 'bg-orange-100 text-orange-700';
    case 'ready': return 'bg-green-100 text-green-700';
    case 'accepted':
    case 'picked_up':
    case 'out_for_delivery': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function borderColor(status) {
  switch (status) {
    case 'pending':
    case 'confirmed': return 'border-yellow-400';
    case 'preparing': return 'border-orange-500';
    case 'ready': return 'border-green-500';
    default: return 'border-blue-500';
  }
}

export default function EssentialsPanel() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', category: 'essentials', subcategory: '', image: '', in_stock: true });
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `essentials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image: data.publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Make sure the database bucket is configured!');
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Fetch Data ───────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch Orders
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .in('status', ACTIVE_STATUSES)
        .order('placed_at', { ascending: false });

      if (ordersErr) throw ordersErr;
      
      // Only show orders for this shopkeeper (based on shop_name for simplicity in MVP)
      const shopName = user?.shop_name || user?.name;
      const myOrders = (ordersData || []).filter(o => o.shop_name === shopName);
      setOrders(myOrders);

      // Fetch Products
      const { data: productsData, error: productsErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsErr) throw productsErr;
      
      // Only show products owned by this shopkeeper
      const myProducts = (productsData || []).filter(p => p.shop_name === shopName || p.owner_id === user?.id);
      setProducts(myProducts);

    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('shopkeeper-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  // ── Order actions ─────────────────────────────────────────────────────────

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const { error: updateErr } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (updateErr) throw updateErr;
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      console.error('Failed to update order:', err);
      setError(`Failed to update order: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Product actions ───────────────────────────────────────────────────────

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setUpdatingId('saving');
    try {
      const shopName = user?.shop_name || user?.name;
      const productPayload = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        subcategory: formData.subcategory,
        image: formData.image,
        in_stock: formData.in_stock,
        shop_name: shopName,
        owner_id: user.id
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productPayload).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productPayload]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchData(); // refresh
    } catch (err) {
      setError(`Failed to save product: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(`Failed to delete: ${err.message}`);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name, price: product.price, category: product.category, 
        subcategory: product.subcategory || '', image: product.image || '📦', in_stock: product.in_stock
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: 'essentials', subcategory: '', image: '', in_stock: true });
    }
    setIsModalOpen(true);
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;

  return (
    <div className="p-4 bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Essentials Dashboard</h2>
            <p className="text-gray-500 text-sm mt-0.5">Welcome, {user?.shop_name || user?.name || 'Owner'}</p>
          </div>
          <button onClick={fetchData} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-4 mt-6 border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'orders' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Live Orders
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'products' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            My Menu / Products
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-teal-500 animate-spin" /></div>
      ) : activeTab === 'orders' ? (
        // =========================================================================
        // ORDERS TAB
        // =========================================================================
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
              <p className="text-xs text-yellow-600 font-medium mt-0.5">Pending</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-700">{preparingCount}</p>
              <p className="text-xs text-orange-600 font-medium mt-0.5">Packing</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{readyCount}</p>
              <p className="text-xs text-green-600 font-medium mt-0.5">Ready to Ship</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No active orders right now</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className={`bg-white rounded-2xl shadow-sm p-4 border-l-4 ${borderColor(order.status)}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-gray-800 text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 mb-3 space-y-1.5">
                    <p className="text-sm font-medium text-gray-700">{order.customer_name}</p>
                    {order.customer_phone && <p className="text-xs text-gray-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {order.customer_phone}</p>}
                    {order.customer_address && <p className="text-xs text-gray-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {order.customer_address}</p>}
                  </div>
                  <ul className="text-sm text-gray-600 mb-3 space-y-1">
                    {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>• {item.quantity || item.qty || 1}× {item.name}</span>
                        <span className="text-gray-400">₹{(item.price * (item.quantity || item.qty || 1)).toFixed(0)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-800">₹{Number(order.total || 0).toFixed(0)}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {timeAgo(order.placed_at)}</span>
                    </div>
                    {order.status === 'pending' || order.status === 'confirmed' ? (
                      <button onClick={() => updateOrderStatus(order.id, 'preparing')} disabled={updatingId === order.id} className="bg-teal-500 text-white text-sm font-bold py-2 px-4 rounded-xl flex items-center gap-1.5">
                        {updatingId === order.id && <Loader2 className="w-4 h-4 animate-spin" />} Pack Order
                      </button>
                    ) : order.status === 'preparing' ? (
                      <button onClick={() => updateOrderStatus(order.id, 'ready')} disabled={updatingId === order.id} className="bg-green-500 text-white text-sm font-bold py-2 px-4 rounded-xl flex items-center gap-1.5">
                        {updatingId === order.id && <Loader2 className="w-4 h-4 animate-spin" />} Ready to Ship
                      </button>
                    ) : (
                      <span className="text-sm font-bold text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Waiting for Rider</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // =========================================================================
        // PRODUCTS TAB
        // =========================================================================
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Your Products ({products.length})</h3>
            <button onClick={() => openModal()} className="bg-teal-500 text-white px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {products.length === 0 && (
              <p className="text-center text-gray-400 py-10 text-sm">You haven't added any items yet.</p>
            )}
            {products.map(p => (
              <div key={p.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-2xl overflow-hidden shrink-0 border border-slate-100">
                    {p.image?.startsWith('http') ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{p.image || '🥚'}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category} • ₹{p.price}</p>
                    {!p.in_stock && <span className="text-[10px] font-bold text-red-500 uppercase">Out of Stock</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(p)} className="p-2 bg-slate-50 text-gray-600 hover:bg-slate-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Product Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
              <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl relative animate-in slide-in-from-bottom-10">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-gray-500 hover:bg-slate-200">
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-bold text-gray-800 mb-4">{editingProduct ? 'Edit Item' : 'Add New Item'}</h3>
                
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Item Name</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border-transparent rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="e.g. Veg Thali" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Price (₹)</label>
                      <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border-transparent rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="0" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Item Photo</label>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                          {formData.image?.startsWith('http') ? (
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-400">📷</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload} 
                            disabled={uploadingImage}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer" 
                          />
                          {uploadingImage && <p className="text-xs text-teal-600 mt-1 flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1"/> Uploading...</p>}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border-transparent rounded-xl focus:ring-2 focus:ring-teal-500">
                        <option value="food">Food</option>
                        <option value="grocery">Grocery</option>
                        <option value="essentials">Essentials</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Subcategory</label>
                      <input type="text" value={formData.subcategory} onChange={e => setFormData({...formData, subcategory: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border-transparent rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="e.g. dhaba" />
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer mt-2">
                    <input type="checkbox" checked={formData.in_stock} onChange={e => setFormData({...formData, in_stock: e.target.checked})} className="w-5 h-5 text-teal-500 rounded border-gray-300 focus:ring-teal-500" />
                    <span className="font-bold text-gray-700 text-sm">Item is In Stock</span>
                  </label>

                  <button type="submit" disabled={updatingId === 'saving'} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center mt-2">
                    {updatingId === 'saving' ? <Loader2 className="w-5 h-5 animate-spin" /> : editingProduct ? 'Save Changes' : 'Create Item'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
