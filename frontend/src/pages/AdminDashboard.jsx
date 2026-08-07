import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ShieldAlert, Users, Layers, Activity, Plus, Trash2, Edit3, CheckCircle, XCircle, DollarSign, Search } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stocks'); // 'stocks', 'users', 'transactions'

  // Modal State for New Stock Listing
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [newStock, setNewStock] = useState({
    symbol: '',
    name: '',
    category: 'Tech',
    currentPrice: '',
    marketCap: '$50B',
    peRatio: '22.5',
    description: ''
  });
  const [actionMsg, setActionMsg] = useState('');

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, stocksRes, txRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/stocks'),
        API.get('/admin/transactions')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setStocks(stocksRes.data || []);
      setTransactions(txRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateStock = async (e) => {
    e.preventDefault();
    setActionMsg('');
    try {
      const res = await API.post('/stocks', newStock);
      setActionMsg(res.data.message);
      setIsAddStockOpen(false);
      setNewStock({ symbol: '', name: '', category: 'Tech', currentPrice: '', marketCap: '$50B', peRatio: '22.5', description: '' });
      fetchAdminData();
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to create stock.');
    }
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm('Are you sure you want to remove this stock listing?')) return;
    try {
      await API.delete(`/stocks/${id}`);
      fetchAdminData();
    } catch (err) {
      alert('Delete stock failed.');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await API.put(`/admin/users/${userId}/role`, { role: nextRole });
      fetchAdminData();
    } catch (err) {
      alert('Role update failed.');
    }
  };

  const handleModerateTx = async (txId, status) => {
    try {
      await API.put(`/admin/transactions/${txId}/moderate`, { status });
      fetchAdminData();
    } catch (err) {
      alert('Transaction moderation failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            Administrator Moderation Suite
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Operations Console</h1>
          <p className="text-sm text-gray-400 mt-1">Manage equities, review registered investor permissions, and audit platform trade stream</p>
        </div>

        <button
          onClick={() => setIsAddStockOpen(true)}
          className="px-5 py-3 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Stock Listing
        </button>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-sm font-semibold">
          {actionMsg}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs uppercase font-bold tracking-wider">Registered Users</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalUsers || 0}</div>
          <p className="text-xs text-gray-400">Total System Accounts</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs uppercase font-bold tracking-wider">Active Stock Assets</span>
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats?.totalStocks || 0}</div>
          <p className="text-xs text-gray-400">Market Directory Catalog</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs uppercase font-bold tracking-wider">Total Trades</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400">{stats?.totalTransactions || 0}</div>
          <p className="text-xs text-gray-400">Buy & Sell Orders</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs uppercase font-bold tracking-wider">Trading Volume</span>
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">
            ${stats?.totalTradingVolume?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-400">Approved Volume Turnover</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`pb-3 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'stocks' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Stock Inventory ({stocks.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'users' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          User Account Directory ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'transactions' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Global Order Stream ({transactions.length})
        </button>
      </div>

      {/* Tab 1: Stock Inventory */}
      {activeTab === 'stocks' && (
        <div className="bg-[#131927] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/90 text-gray-400 text-xs font-bold uppercase border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Price ($)</th>
                  <th className="px-6 py-4 text-right">Market Cap</th>
                  <th className="px-6 py-4 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {stocks.map(s => (
                  <tr key={s._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-purple-400">{s.symbol}</td>
                    <td className="px-6 py-4 text-white font-semibold">{s.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 text-xs">{s.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-white">${s.currentPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-gray-400 font-mono text-xs">{s.marketCap}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteStock(s._id)}
                        title="Delete Stock Listing"
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: User Account Directory */}
      {activeTab === 'users' && (
        <div className="bg-[#131927] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/90 text-gray-400 text-xs font-bold uppercase border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Current Role</th>
                  <th className="px-6 py-4 text-right">Buying Power Balance</th>
                  <th className="px-6 py-4 text-center">Toggle Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                    <td className="px-6 py-4 text-gray-300 font-mono text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-emerald-400">${u.balance?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleRole(u._id, u.role)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
                      >
                        Switch to {u.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Global Order Stream */}
      {activeTab === 'transactions' && (
        <div className="bg-[#131927] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/90 text-gray-400 text-xs font-bold uppercase border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User ID</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4 text-right">Shares</th>
                  <th className="px-6 py-4 text-right">Total ($)</th>
                  <th className="px-6 py-4 text-center">Status Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {transactions.map(tx => (
                  <tr key={tx._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-400 font-mono">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-gray-400 font-mono">{String(tx.userId).slice(-6)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${tx.type === 'BUY' ? 'text-emerald-400 bg-emerald-950' : 'text-red-400 bg-red-950'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{tx.symbol}</td>
                    <td className="px-6 py-4 text-right font-bold text-white">{tx.quantity}</td>
                    <td className="px-6 py-4 text-right font-black text-white">${tx.totalAmount?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleModerateTx(tx._id, 'APPROVED')}
                          disabled={tx.status === 'APPROVED'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            tx.status === 'APPROVED'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40 opacity-60'
                              : 'bg-gray-800 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/40'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleModerateTx(tx._id, 'REJECTED')}
                          disabled={tx.status === 'REJECTED'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            tx.status === 'REJECTED'
                              ? 'bg-red-950 text-red-400 border-red-500/40 opacity-60'
                              : 'bg-gray-800 text-gray-400 hover:text-red-400 hover:border-red-500/40'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {isAddStockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#131927] border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">List New Stock Equity</h3>
            
            <form onSubmit={handleCreateStock} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Stock Symbol (e.g. NVDA)</label>
                <input
                  type="text"
                  required
                  value={newStock.symbol}
                  onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white font-bold uppercase outline-none"
                  placeholder="META"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Company Name</label>
                <input
                  type="text"
                  required
                  value={newStock.name}
                  onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white outline-none"
                  placeholder="Meta Platforms, Inc."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Initial Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newStock.currentPrice}
                    onChange={(e) => setNewStock({ ...newStock, currentPrice: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white outline-none"
                    placeholder="485.50"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Category</label>
                  <select
                    value={newStock.category}
                    onChange={(e) => setNewStock({ ...newStock, category: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Tech">Tech</option>
                    <option value="Finance">Finance</option>
                    <option value="Automotive">Automotive</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Semiconductors">Semiconductors</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Description</label>
                <textarea
                  rows="2"
                  value={newStock.description}
                  onChange={(e) => setNewStock({ ...newStock, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white outline-none"
                  placeholder="Brief company overview..."
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddStockOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-gray-400 hover:text-white bg-gray-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-white bg-purple-600 hover:bg-purple-500 font-bold"
                >
                  Create Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
