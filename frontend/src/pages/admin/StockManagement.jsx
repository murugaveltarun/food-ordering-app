// Import React and hooks
import React, { useState, useEffect } from 'react';
// Import api client
import api from '../../api';
// Import lucide icons
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Tag, 
  AlertCircle, 
  Check, 
  X, 
  Percent, 
  Package, 
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

// StockManagement component for managing food items, stock counts, discounts, and prices
export const StockManagement = () => {
  // State for all food items
  const [foods, setFoods] = useState([]);
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State to control Add/Edit modal visibility
  const [modalOpen, setModalOpen] = useState(false);
  // State for editing item (null when adding new item)
  const [editingItem, setEditingItem] = useState(null);

  // Form input state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Burgers',
    price: '',
    discount_percent: 0,
    stock: 50,
    image_url: '',
    is_featured: false,
  });

  // State for form submission loading
  const [saving, setSaving] = useState(false);

  // Function to load all food items from backend API
  const fetchFoods = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/food');
      if (res.data.success) {
        setFoods(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load admin food items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch foods on mount
  useEffect(() => {
    fetchFoods();
  }, []);

  // Open modal to add a brand new food item
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: 'Burgers',
      price: '',
      discount_percent: 0,
      stock: 50,
      image_url: '',
      is_featured: false,
    });
    setModalOpen(true);
  };

  // Open modal to edit an existing food item
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price,
      discount_percent: item.discount_percent || 0,
      stock: item.stock,
      image_url: item.image_url || '',
      is_featured: item.is_featured || false,
    });
    setModalOpen(true);
  };

  // Handle saving (create or update) food item
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingItem) {
        // Call PUT endpoint to update
        await api.put(`/admin/food/${editingItem.id}`, formData);
      } else {
        // Call POST endpoint to create
        await api.post('/admin/food', formData);
      }
      setModalOpen(false);
      await fetchFoods();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save item.');
    } finally {
      setSaving(false);
    }
  };

  // Handle quick stock adjustment buttons directly on table row
  const handleQuickStock = async (item, delta) => {
    const newStock = Math.max(0, item.stock + delta);
    try {
      await api.put(`/admin/food/${item.id}`, { stock: newStock });
      setFoods(foods.map((f) => (f.id === item.id ? { ...f, stock: newStock } : f)));
    } catch (err) {
      alert('Failed to update stock.');
    }
  };

  // Handle deleting food item
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the menu?`)) {
      return;
    }

    try {
      await api.delete(`/admin/food/${id}`);
      setFoods(foods.filter((f) => f.id !== id));
    } catch (err) {
      alert('Failed to delete item.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-600 text-xs font-bold uppercase tracking-wider">
              <span>Admin Portal</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Stock & Discount Management</h1>
            <p className="text-xs text-slate-500 mt-1">
              Add new meals, update inventory counts, manage promotional discounts, and toggle featured items.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm flex items-center space-x-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Food Item</span>
          </button>
        </div>

        {/* Food Items Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading menu inventory...</div>
          ) : foods.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No food items found. Click "Add New Food Item" above.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-6">Item</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Base Price</th>
                    <th className="py-4 px-4">Discount</th>
                    <th className="py-4 px-4">Final Price</th>
                    <th className="py-4 px-4">Stock Level</th>
                    <th className="py-4 px-4">Featured</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {foods.map((food) => {
                    const isLowStock = food.stock <= 10;
                    return (
                      <tr key={food.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Food info & photo */}
                        <td className="py-3 px-6">
                          <div className="flex items-center space-x-3">
                            <img
                              src={food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'}
                              alt={food.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120';
                              }}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{food.name}</p>
                              <p className="text-[11px] text-slate-400 truncate max-w-xs">{food.description}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 font-semibold text-slate-600">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px]">
                            {food.category}
                          </span>
                        </td>

                        {/* Base Price */}
                        <td className="py-3 px-4 font-semibold text-slate-600">
                          ${food.price?.toFixed(2)}
                        </td>

                        {/* Discount */}
                        <td className="py-3 px-4">
                          {food.discount_percent > 0 ? (
                            <span className="px-2 py-0.5 rounded-lg bg-red-100 text-red-700 font-extrabold text-[11px]">
                              {food.discount_percent}% OFF
                            </span>
                          ) : (
                            <span className="text-slate-400">0%</span>
                          )}
                        </td>

                        {/* Final Calculated Price */}
                        <td className="py-3 px-4 font-black text-slate-900 text-sm">
                          ${food.final_price?.toFixed(2)}
                        </td>

                        {/* Stock Level with Quick Adjust */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-black text-xs px-2 py-0.5 rounded-md ${
                                food.stock === 0
                                  ? 'bg-red-100 text-red-700'
                                  : isLowStock
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {food.stock}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleQuickStock(food, -5)}
                                className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center font-bold"
                                title="Reduce 5"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleQuickStock(food, 5)}
                                className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center font-bold"
                                title="Add 5"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Featured Checkmark */}
                        <td className="py-3 px-4">
                          {food.is_featured ? (
                            <span className="inline-flex items-center space-x-1 text-orange-600 font-bold text-[11px]">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Yes</span>
                            </span>
                          ) : (
                            <span className="text-slate-300">No</span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEdit(food)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Edit Item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(food.id, food.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                {/* Food Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Food Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gourmet Truffle Burger"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                {/* Category & Price in two columns */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                      <option value="Burgers">Burgers</option>
                      <option value="Pizza">Pizza</option>
                      <option value="Sides">Sides</option>
                      <option value="Asian">Asian</option>
                      <option value="Pasta">Pasta</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Base Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="12.99"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Discount % and Stock Quantity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="0 to 100"
                      value={formData.discount_percent}
                      onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="50"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description of the dish..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                  />
                </div>

                {/* Is Featured Checkbox */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="is_featured" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Show as Featured dish on homepage
                  </label>
                </div>

                {/* Modal Buttons */}
                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm"
                  >
                    {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
