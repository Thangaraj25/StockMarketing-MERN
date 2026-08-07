import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Clock, ArrowUpRight, ArrowDownRight, Search, Filter, ShieldCheck, Download, RefreshCw, CheckCircle2 } from 'lucide-react';

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'BUY', 'SELL'
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await API.get('/portfolio/transactions');
      setTransactions(res.data || []);
    } catch (err) {
      console.error('Error fetching transaction history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter logic
  const filteredTx = transactions.filter(tx => {
    const matchesType = filterType === 'ALL' || tx.type === filterType;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || tx.symbol?.toLowerCase().includes(q) || tx.stockName?.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  // Calculate Summary Metrics
  const totalOrders = transactions.length;
  const buyOrders = transactions.filter(t => t.type === 'BUY');
  const sellOrders = transactions.filter(t => t.type === 'SELL');
  const totalBuyVolume = buyOrders.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const totalSellVolume = sellOrders.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const avgOrderSize = totalOrders > 0
    ? (totalBuyVolume + totalSellVolume) / totalOrders
    : 0;

  // Export to CSV helper
  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Timestamp', 'Type', 'Symbol', 'Stock Name', 'Quantity', 'Price Per Share ($)', 'Total Amount ($)', 'Status'];
    const rows = transactions.map(t => [
      new Date(t.createdAt).toLocaleString(),
      t.type,
      t.symbol,
      `"${t.stockName}"`,
      t.quantity,
      t.pricePerShare,
      t.totalAmount,
      t.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shopez_trade_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-indigo-400" />
            Trade & Order History Log
          </h1>
          <p className="text-sm text-gray-400 mt-1">Complete execution ledger of all buy/sell market orders and trade receipts</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchHistory}
            className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 transition-colors"
            title="Refresh History Log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={exportCSV}
            disabled={transactions.length === 0}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV Log
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-1">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Total Orders</span>
          <div className="text-3xl font-black text-white">{totalOrders}</div>
          <p className="text-xs text-gray-400">Executed Transactions</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-1">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Total Buy Outflow</span>
          <div className="text-3xl font-black text-emerald-400">${totalBuyVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-gray-400">{buyOrders.length} Buy Orders</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-1">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Total Sell Proceeds</span>
          <div className="text-3xl font-black text-indigo-400">${totalSellVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-gray-400">{sellOrders.length} Sell Orders</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-1">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Avg Trade Size</span>
          <div className="text-3xl font-black text-amber-400">${avgOrderSize.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-gray-400">Per Order Execution</p>
        </div>

      </div>

      {/* Controls: Search & Order Type Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history by symbol or company..."
            className="w-full bg-gray-900 border border-gray-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none transition-colors"
          />
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center gap-2 bg-gray-900 p-1 border border-gray-800 rounded-xl w-full sm:w-auto">
          {[
            { id: 'ALL', label: `All Orders (${transactions.length})` },
            { id: 'BUY', label: `BUY (${buyOrders.length})` },
            { id: 'SELL', label: `SELL (${sellOrders.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-none ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* History Audit Table */}
      <div className="bg-[#131927] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
        {filteredTx.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Clock className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-lg font-bold text-gray-300">No matching transactions found</p>
            <p className="text-xs text-gray-500">Try adjusting your filter type or clearing search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/90 text-gray-400 text-xs font-bold uppercase border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Timestamp & ID</th>
                  <th className="px-6 py-4">Order Type</th>
                  <th className="px-6 py-4">Symbol & Company</th>
                  <th className="px-6 py-4 text-right">Shares Quantity</th>
                  <th className="px-6 py-4 text-right">Execution Price</th>
                  <th className="px-6 py-4 text-right">Total Outflow / Proceeds</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {filteredTx.map(tx => {
                  const isBuy = tx.type === 'BUY';
                  return (
                    <tr key={tx._id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">
                        <div>{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-[10px] text-gray-600">ID: {String(tx._id).slice(-8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 w-fit ${
                          isBuy
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-950/80 text-red-400 border border-red-500/30'
                        }`}>
                          {isBuy ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        <Link to={`/stock/${tx.stockId}`} className="text-indigo-400 hover:underline">
                          {tx.symbol}
                        </Link>
                        <div className="text-xs text-gray-400 font-normal">{tx.stockName}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-white text-base">{tx.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-300 font-mono">${tx.pricePerShare?.toFixed(2)}</td>
                      <td className={`px-6 py-4 text-right font-black text-base font-mono ${isBuy ? 'text-white' : 'text-emerald-400'}`}>
                        {isBuy ? '' : '+'}${tx.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-xs font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {tx.status}
                        </span>
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
  );
};

export default History;
