import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import TradeModal from '../components/TradeModal';
import { TrendingUp, ArrowUpRight, ArrowDownRight, ShieldCheck, Zap, BarChart3, ChevronRight, DollarSign, Award, Layers } from 'lucide-react';

const Home = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [tradeType, setTradeType] = useState('BUY');

  const fetchStocks = async () => {
    try {
      const res = await API.get('/stocks');
      setStocks(res.data || []);
    } catch (err) {
      console.error('Error loading stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 5000);
    return () => clearInterval(interval);
  }, []);

  const openTrade = (stock, type = 'BUY') => {
    setSelectedStock(stock);
    setTradeType(type);
    setIsTradeOpen(true);
  };

  const topGainers = stocks.filter(s => s.priceChange >= 0).slice(0, 4);

  return (
    <div className="space-y-16 py-6">

      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-br from-indigo-950 via-[#111625] to-[#0b0f19] border border-indigo-500/20 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
            ShopEZ Real-Time Stock Market Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Effortless Stock Trading <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Built For Modern Investors.
            </span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl">
            Explore live equities, analyze interactive market charts, execute instant trades with virtual capital, and optimize your portfolio performance—all in one seamless hub.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/market"
              className="px-6 py-3.5 rounded-xl font-extrabold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              Explore Live Markets
              <ChevronRight className="w-4 h-4" />
            </Link>
            
            <Link
              to="/portfolio"
              className="px-6 py-3.5 rounded-xl font-extrabold text-sm text-gray-200 bg-gray-900/80 hover:bg-gray-800 border border-gray-700 transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              View Portfolio
            </Link>
          </div>

          {/* Platform Metric Badges */}
          <div className="pt-8 border-t border-gray-800/80 grid grid-cols-3 gap-6 max-w-lg">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">$10,000</p>
              <p className="text-xs text-gray-400 font-medium">Starter Virtual Balance</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">0%</p>
              <p className="text-xs text-gray-400 font-medium">Trading Commission</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-400">5s</p>
              <p className="text-xs text-gray-400 font-medium">Live Price Polling</p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Top Market Movers Ticker */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">Market Watch</span>
            <h2 className="text-2xl font-bold text-white">Top Gaining Equities</h2>
          </div>
          <Link to="/market" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View All Markets <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-900/60 animate-pulse rounded-2xl border border-gray-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topGainers.map(stock => {
              const isUp = stock.priceChange >= 0;
              return (
                <div
                  key={stock._id}
                  className="glass-card rounded-2xl p-5 border border-gray-800 hover:border-indigo-500/40 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-gray-400">{stock.symbol}</span>
                      <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{stock.name}</h4>
                    </div>
                    <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isUp ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-red-950/80 text-red-400 border border-red-500/30'
                    }`}>
                      {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                      {isUp ? '+' : ''}{stock.priceChangePercent}%
                    </span>
                  </div>

                  <div className="pt-4 flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-black text-white">${stock.currentPrice?.toFixed(2)}</p>
                      <p className="text-[11px] text-gray-400">Vol: {(stock.volume / 1000000).toFixed(1)}M</p>
                    </div>

                    <button
                      onClick={() => openTrade(stock, 'BUY')}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition-all"
                    >
                      Trade
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Market Stock List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Stock Catalog</h2>
            <p className="text-xs text-gray-400">Live prices auto-refreshing every 5 seconds</p>
          </div>
        </div>

        <div className="bg-[#131927] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/90 text-gray-400 text-xs font-bold uppercase border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Symbol & Asset Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Price ($)</th>
                  <th className="px-6 py-4 text-right">24h Change</th>
                  <th className="px-6 py-4 text-right">24h High / Low</th>
                  <th className="px-6 py-4 text-center">Quick Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {stocks.map(stock => {
                  const isUp = stock.priceChange >= 0;
                  return (
                    <tr key={stock._id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/stock/${stock._id}`} className="flex items-center gap-3 group">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 group-hover:scale-105 transition-transform">
                            {stock.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                              {stock.symbol}
                            </div>
                            <div className="text-xs text-gray-400">{stock.name}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 text-xs font-semibold">
                          {stock.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-white text-base">
                        ${stock.currentPrice?.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold text-xs ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isUp ? '+' : ''}{stock.priceChange?.toFixed(2)} ({isUp ? '+' : ''}{stock.priceChangePercent}%)
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-400 font-mono">
                        ${stock.high?.toFixed(2)} / ${stock.low?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openTrade(stock, 'BUY')}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => openTrade(stock, 'SELL')}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all"
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
        </div>
      </section>

      {/* Platform Key Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Role-Based JWT Security</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Encrypted session tokens protect investor accounts and safeguard admin moderation workflows with strict server-side validation.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Real-Time Portfolio P/L</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Track your unrealized capital gains, total investment allocation, and transaction logs with automated mark-to-market valuations.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Admin Operations Panel</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Administrators can manage stock listings, monitor platform trading volume, adjust user permissions, and approve transactions.
          </p>
        </div>
      </section>

      {/* Trade Modal */}
      <TradeModal
        stock={selectedStock}
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        onTradeSuccess={fetchStocks}
        defaultType={tradeType}
      />

    </div>
  );
};

export default Home;
