import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import StockChart from '../components/StockChart';
import TradeModal from '../components/TradeModal';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, DollarSign, Activity, PieChart, ShieldCheck, Building2 } from 'lucide-react';

const StockDetail = () => {
  const { id } = useParams();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [tradeType, setTradeType] = useState('BUY');

  const fetchStock = async () => {
    try {
      const res = await API.get(`/stocks/${id}`);
      setStock(res.data);
    } catch (err) {
      console.error('Error loading stock detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
    const interval = setInterval(fetchStock, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-xl font-bold text-red-400">Stock not found.</p>
        <Link to="/market" className="text-indigo-400 font-semibold hover:underline">Return to Market Directory</Link>
      </div>
    );
  }

  const isUp = (stock.priceChange || 0) >= 0;

  return (
    <div className="space-y-8 py-6">

      {/* Back button */}
      <Link to="/market" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Markets
      </Link>

      {/* Stock Header Banner */}
      <div className="bg-[#131927] border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-black text-2xl text-indigo-400">
            {stock.symbol?.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{stock.name}</h1>
              <span className="px-3 py-1 rounded-lg bg-gray-800 text-gray-300 text-xs font-mono font-bold">{stock.symbol}</span>
              <span className="px-3 py-1 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">{stock.category}</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Listed Equity • USD Currency</p>
          </div>
        </div>

        {/* Live Price & Trade CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="text-left sm:text-right">
            <div className="text-4xl font-black text-white">${stock.currentPrice?.toFixed(2)}</div>
            <div className={`flex items-center sm:justify-end text-sm font-bold mt-1 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {isUp ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
              {isUp ? '+' : ''}{stock.priceChange?.toFixed(2)} ({isUp ? '+' : ''}{stock.priceChangePercent}%)
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setTradeType('BUY'); setIsTradeOpen(true); }}
              className="px-6 py-3.5 rounded-xl font-extrabold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              Buy {stock.symbol}
            </button>
            <button
              onClick={() => { setTradeType('SELL'); setIsTradeOpen(true); }}
              className="px-6 py-3.5 rounded-xl font-extrabold text-sm text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02]"
            >
              Sell {stock.symbol}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart + Key Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-6">
          <StockChart
            historicalPrices={stock.historicalPrices}
            currentPrice={stock.currentPrice}
            previousClose={stock.previousClose}
            symbol={stock.symbol}
          />

          {/* Company Summary Description */}
          <div className="bg-[#131927] border border-gray-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              About {stock.name}
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {stock.description || `${stock.name} is a leading entity in the ${stock.category} market sector, driving innovation and global liquidity.`}
            </p>
          </div>
        </div>

        {/* Financial Metrics Column */}
        <div className="space-y-6">
          <div className="bg-[#131927] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
              <Activity className="w-5 h-5 text-indigo-400" />
              Key Valuation Metrics
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">Previous Close</span>
                <span className="font-semibold text-white">${stock.previousClose?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">24h Day High</span>
                <span className="font-semibold text-emerald-400">${stock.high?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">24h Day Low</span>
                <span className="font-semibold text-red-400">${stock.low?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">Trading Volume</span>
                <span className="font-semibold text-white">{(stock.volume / 1000000).toFixed(2)}M shares</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">Market Capitalization</span>
                <span className="font-semibold text-white">{stock.marketCap}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">P/E Ratio</span>
                <span className="font-semibold text-white">{stock.peRatio}</span>
              </div>
            </div>
          </div>

          {/* Quick Trade Box */}
          <div className="bg-gradient-to-br from-indigo-950/60 to-[#131927] border border-indigo-500/30 rounded-2xl p-6 space-y-4">
            <h4 className="text-base font-bold text-white">Trade {stock.symbol} Instantly</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Execute simulated trades backed by your ShopEZ virtual capital balance with instantaneous order confirmation.
            </p>
            <button
              onClick={() => { setTradeType('BUY'); setIsTradeOpen(true); }}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
            >
              Open Order Dialog
            </button>
          </div>
        </div>

      </div>

      {/* Trade Modal */}
      <TradeModal
        stock={stock}
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        onTradeSuccess={fetchStock}
        defaultType={tradeType}
      />

    </div>
  );
};

export default StockDetail;
