import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import TradeModal from '../components/TradeModal';
import DepositModal from '../components/DepositModal';
import PortfolioAnalytics from '../components/PortfolioAnalytics';
import { useAuth } from '../context/AuthContext';
import { PieChart, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, ShoppingBag, PlusCircle } from 'lucide-react';

const Portfolio = () => {
  const { refreshProfile } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('holdings'); // 'holdings' or 'transactions'

  const [selectedStock, setSelectedStock] = useState(null);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [tradeType, setTradeType] = useState('BUY');

  const fetchPortfolioData = async () => {
    try {
      const [portRes, txRes] = await Promise.all([
        API.get('/portfolio'),
        API.get('/portfolio/transactions')
      ]);
      setPortfolio(portRes.data);
      setTransactions(txRes.data || []);
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 5000);
    return () => clearInterval(interval);
  }, []);

  const openTradeModal = (holding, type = 'SELL') => {
    setSelectedStock({
      _id: holding.stockId,
      symbol: holding.symbol,
      name: holding.stockName,
      currentPrice: holding.currentPrice
    });
    setTradeType(type);
    setIsTradeOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const isProfitable = (portfolio?.totalProfitLoss || 0) >= 0;

  return (
    <div className="space-y-8 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <PieChart className="w-8 h-8 text-indigo-400" />
            Investment Portfolio & Holdings
          </h1>
          <p className="text-sm text-gray-400 mt-1">Real-time asset valuation, profit/loss tracker, and complete execution audit log</p>
        </div>

        <button
          onClick={() => setIsDepositOpen(true)}
          className="px-5 py-3 rounded-xl font-extrabold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Deposit High Amount / Add Funds
        </button>
      </div>

      {/* Top Valuation Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Net Portfolio Value */}
        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-2">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Net Portfolio Value</span>
          <div className="text-3xl font-black text-white">
            ${portfolio?.netPortfolioValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-400">Cash + Stock Portfolio Value</p>
        </div>

        {/* Buying Power Cash */}
        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-2 relative">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Available Cash</span>
            <button
              onClick={() => setIsDepositOpen(true)}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-0.5"
            >
              + Add
            </button>
          </div>
          <div className="text-3xl font-black text-emerald-400">
            ${portfolio?.cashBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-400">Liquid Virtual Balance</p>
        </div>

        {/* Total Stock Invested */}
        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-2">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Stock Valuation</span>
          <div className="text-3xl font-black text-indigo-400">
            ${portfolio?.totalCurrentValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-400">Cost Basis: ${portfolio?.totalInvested?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>

        {/* Unrealized Return (Profit/Loss) */}
        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-2">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Unrealized Return</span>
          <div className={`text-3xl font-black flex items-center gap-1 ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
            {isProfitable ? <ArrowUpRight className="w-7 h-7" /> : <ArrowDownRight className="w-7 h-7" />}
            {isProfitable ? '+' : ''}${portfolio?.totalProfitLoss?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
            isProfitable ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-red-950 text-red-400 border border-red-500/30'
          }`}>
            {isProfitable ? '+' : ''}{portfolio?.totalProfitLossPercent}% Return
          </div>
        </div>

      </div>

      {/* Risk & Health Analytics Widget */}
      <PortfolioAnalytics portfolio={portfolio} />

      {/* Tabs Selector: Holdings vs Transaction History */}
      <div className="flex items-center gap-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('holdings')}
          className={`pb-3 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'holdings'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Active Holdings ({portfolio?.holdings?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 font-bold text-sm transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'transactions'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Trade History ({transactions.length})
        </button>
      </div>

      {/* Tab 1: Active Holdings Table */}
      {activeTab === 'holdings' && (
        <div className="bg-[#131927] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
          {(!portfolio?.holdings || portfolio.holdings.length === 0) ? (
            <div className="text-center py-16 space-y-4">
              <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-lg font-bold text-gray-300">No stock holdings yet.</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">Visit the Market Directory to explore top equities and initiate your first trade.</p>
              <Link to="/market" className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md">
                Browse Markets
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-900/90 text-gray-400 text-xs font-bold uppercase border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Symbol & Asset</th>
                    <th className="px-6 py-4 text-right">Shares Owned</th>
                    <th className="px-6 py-4 text-right">Avg Buy Price</th>
                    <th className="px-6 py-4 text-right">Current Price</th>
                    <th className="px-6 py-4 text-right">Total Invested</th>
                    <th className="px-6 py-4 text-right">Market Value</th>
                    <th className="px-6 py-4 text-right">Profit / Loss</th>
                    <th className="px-6 py-4 text-center">Trade Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-medium">
                  {portfolio.holdings.map(h => {
                    const isHoldingProfitable = h.profitLoss >= 0;
                    return (
                      <tr key={h.symbol} className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-6 py-4 font-bold">
                          <Link to={`/stock/${h.stockId}`} className="text-indigo-400 hover:underline">
                            {h.symbol}
                          </Link>
                          <div className="text-xs text-gray-400 font-normal">{h.stockName}</div>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-white">{h.quantity}</td>
                        <td className="px-6 py-4 text-right text-gray-300 font-mono">${h.averageBuyPrice?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-bold text-white font-mono">${h.currentPrice?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-gray-300 font-mono">${h.totalInvested?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-black text-white font-mono">${h.currentValue?.toFixed(2)}</td>
                        <td className={`px-6 py-4 text-right font-bold text-xs ${isHoldingProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isHoldingProfitable ? '+' : ''}${h.profitLoss?.toFixed(2)}
                          <div>({isHoldingProfitable ? '+' : ''}{h.profitLossPercent}%)</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openTradeModal(h, 'BUY')}
                              className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-500/30 transition-all"
                            >
                              Buy More
                            </button>
                            <button
                              onClick={() => openTradeModal(h, 'SELL')}
                              className="px-3 py-1 text-xs font-bold text-red-400 bg-red-950/60 hover:bg-red-600 hover:text-white rounded-lg border border-red-500/30 transition-all"
                            >
                              Sell
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Transaction History Log */}
      {activeTab === 'transactions' && (
        <div className="bg-[#131927] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
          {transactions.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <Clock className="w-10 h-10 text-gray-600 mx-auto" />
              <p className="text-base font-bold text-gray-300">No transaction logs recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-900/90 text-gray-400 text-xs font-bold uppercase border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Symbol & Stock</th>
                    <th className="px-6 py-4 text-right">Shares</th>
                    <th className="px-6 py-4 text-right">Price per Share</th>
                    <th className="px-6 py-4 text-right">Total Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-medium">
                  {transactions.map(tx => (
                    <tr key={tx._id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-black ${
                          tx.type === 'BUY'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-950 text-red-400 border border-red-500/30'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {tx.symbol} <span className="text-xs text-gray-400 font-normal">({tx.stockName})</span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-white">{tx.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-300 font-mono">${tx.pricePerShare?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-black text-white font-mono">${tx.totalAmount?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Trade Modal */}
      <TradeModal
        stock={selectedStock}
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        onTradeSuccess={fetchPortfolioData}
        defaultType={tradeType}
      />

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={() => {
          fetchPortfolioData();
          refreshProfile();
        }}
      />

    </div>
  );
};

export default Portfolio;
