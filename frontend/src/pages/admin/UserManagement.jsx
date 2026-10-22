// Import React and hooks
import React, { useState, useEffect } from 'react';
// Import api client
import api from '../../api';
// Import useAuth to know current admin id
import { useAuth } from '../../context/AuthContext';
// Import lucide icons
import { Users, Shield, User, CheckCircle2, XCircle, Search } from 'lucide-react';

// UserManagement component for viewing customers, administrators, and managing account statuses
export const UserManagement = () => {
  // Extract logged-in admin user
  const { user: currentAdmin } = useAuth();
  // State for list of users
  const [users, setUsers] = useState([]);
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State for search query
  const [search, setSearch] = useState('');
  // State for toggle loading id
  const [updatingId, setUpdatingId] = useState(null);

  // Function to load all users from backend API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to toggle a user's active/deactivated status
  const handleToggleStatus = async (user) => {
    // Prevent admin from deactivating their own account
    if (user.id === currentAdmin?.id) {
      alert('You cannot deactivate your own administrative account.');
      return;
    }

    const action = user.is_active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} the account of ${user.name}?`)) {
      return;
    }

    try {
      setUpdatingId(user.id);
      const res = await api.put(`/admin/users/${user.id}/status`);
      if (res.data.success) {
        // Update user in local state
        setUsers(users.map((u) => (u.id === user.id ? res.data.user : u)));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter users based on search keyword
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-600 text-xs font-bold uppercase tracking-wider">
              <span>Admin Portal</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">User Management</h1>
            <p className="text-xs text-slate-500 mt-1">
              Oversee registered customer accounts, administrator roles, and toggle access permissions.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading user accounts...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-4">Role</th>
                    <th className="py-4 px-4">Account Status</th>
                    <th className="py-4 px-4">Joined Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentAdmin?.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name and Email */}
                        <td className="py-3 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                              {u.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                                <span>{u.name}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          {u.role === 'admin' ? (
                            <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-bold text-[11px] inline-flex items-center space-x-1">
                              <Shield className="w-3 h-3" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] inline-flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>Customer</span>
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {u.is_active ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-600 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-red-500 font-bold text-[11px]">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Deactivated</span>
                            </span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="py-3 px-4 text-slate-500">
                          {u.created_at || 'N/A'}
                        </td>

                        {/* Toggle Status Action */}
                        <td className="py-3 px-6 text-right">
                          <button
                            disabled={isSelf || updatingId === u.id}
                            onClick={() => handleToggleStatus(u)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                              isSelf
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : u.is_active
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {updatingId === u.id
                              ? 'Updating...'
                              : u.is_active
                              ? 'Deactivate'
                              : 'Activate'}
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

      </div>
    </div>
  );
};
