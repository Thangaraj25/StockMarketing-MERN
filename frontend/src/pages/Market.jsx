import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import TradeModal from '../components/TradeModal';
import MarketHeatmap from '../components/MarketHeatmap';
import { Search, Filter, ArrowUpRight, ArrowDownRight, TrendingUp, Grid, List, Star } from 'lucide-react';

const Market = () => {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [loading, setLoading] = useState(true);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);

  // Watchlist state stored in localStorage
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shopez_watchlist')) || ['AAPL', 'NVDA', 'TSLA'];
    } catch {
      return ['AAPL', 'NVDA', 'TSLA'];
    }
  });

  const [selectedStock, setSelectedStock] = useState(null);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [tradeType, setTradeType] = useState('BUY');

  const categories = ['All', 'Tech', 'Finance', 'Automotive', 'E-Commerce', 'Semiconductors', 'Energy'];

  const toggleWatchlist = (symbol, e) => {
    if (e) e.stopPropagation();
    let updated;
    if (watchlist.includes(symbol)) {
      updated = watchlist.filter(s => s !== symbol);
    } else {
      updated = [...watchlist, symbol];
    }
    setWatchlist(updated);
    localStorage.setItem('shopez_watchlist', JSON.stringify(updated));
  };

  const fetchStocks = async () => {
    try {
      const res = await API.get(`/stocks?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
      let fetched = res.data || [];
      if (showWatchlistOnly) {
        fetched = fetched.filter(s => watchlist.includes(s.symbol));
      }
      setStocks(fetched);
    } catch (err) {
      console.error('Error fetching market stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 5000);
    return () => clearInterval(interval);
  }, [search, category, showWatchlistOnly, watchlist]);

  const openTrade = (stock, type = 'BUY') => {
    setSelectedStock(stock);
    setTradeType(type);
    setIsTradeOpen(true);
  };

  return (
    <div className="space-y-8 py-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-indigo-400" />
            Stock Market Directory
          </h1>
          <p className="text-sm text-gray-400 mt-1">Explore financial assets, monitor price swings, and initiate instant trades</p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by stock symbol or name (e.g. AAPL, Tesla)..."
            className="w-full bg-gray-900 border border-gray-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors"
          />
        </div>

        {/* Category Pills & Watchlist filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              showWatchlistOnly
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-gray-900 text-amber-400 border border-amber-500/30 hover:bg-gray-800'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Starred Watchlist ({watchlist.length})
          </button>

          <Filter className="w-4 h-4 text-gray-400 shrink-0 mr-1 hidden sm:block" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setShowWatchlistOnly(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat && !showWatchlistOnly
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Market Heatmap Widget */}
      {!showWatchlistOnly && <MarketHeatmap stocks={stocks} />}

      {/* Content Rendering */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-900/60 animate-pulse rounded-2xl border border-gray-800"></div>
          ))}
        </div>
      ) : stocks.length === 0 ? (
        <div className="text-center py-16 bg-[#131927] border border-gray-800 rounded-2xl space-y-3">
          <p className="text-lg font-bold text-gray-300">No stocks found</p>
          <p className="text-xs text-gray-500">Try refining your search symbol or selected category filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stocks.map(stock => {
            const isUp = stock.priceChange >= 0;
            return (
              <div
                key={stock._id}
                className="glass-card rounded-2xl p-6 border border-gray-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <Link to={`/stock/${stock._id}`} className="flex items-center gap-3 group">
                    <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-extrabold text-indigo-400 group-hover:scale-105 transition-transform">
                      {stock.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                        {stock.symbol}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-1">{stock.name}</p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleWatchlist(stock.symbol, e)}
                      title={watchlist.includes(stock.symbol) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      className={`p-1.5 rounded-lg border transition-all ${
                        watchlist.includes(stock.symbol)
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-gray-800 text-gray-500 border-gray-700 hover:text-amber-400'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${watchlist.includes(stock.symbol) ? 'fill-current' : ''}`} />
                    </button>

                    <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isUp ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-red-950 text-red-400 border border-red-500/30'
                    }`}>
                      {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                      {isUp ? '+' : ''}{stock.priceChangePercent}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-black text-white">${stock.currentPrice?.toFixed(2)}</div>
                  <div className="flex justify-between text-xs text-gray-400 font-mono pt-1">
                    <span>Category: {stock.category}</span>
                    <span>Cap: {stock.marketCap}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800/60">
                  <Link
                    to={`/stock/${stock._id}`}
                    className="py-2 text-center text-xs font-bold text-gray-300 hover:text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Chart
                  </Link>
                  <button
                    onClick={() => openTrade(stock, 'BUY')}
                    className="py-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-500/30 transition-all"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => openTrade(stock, 'SELL')}
                    className="py-2 text-xs font-bold text-red-400 bg-red-950/60 hover:bg-red-600 hover:text-white rounded-lg border border-red-500/30 transition-all"
                  >
                    Sell
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#131927] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/90 text-gray-400 text-xs font-bold uppercase border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Current Price</th>
                  <th className="px-6 py-4 text-right">Price Change</th>
                  <th className="px-6 py-4 text-right">Market Cap</th>
                  <th className="px-6 py-4 text-center">Trade Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {stocks.map(stock => {
                  const isUp = stock.priceChange >= 0;
                  return (
                    <tr key={stock._id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-indigo-400">
                        <Link to={`/stock/${stock._id}`}>{stock.symbol}</Link>
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">{stock.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 text-xs">{stock.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-white">${stock.currentPrice?.toFixed(2)}</td>
                      <td className={`px-6 py-4 text-right font-bold text-xs ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isUp ? '+' : ''}{stock.priceChangePercent}%
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-400 font-mono">{stock.marketCap}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openTrade(stock, 'BUY')}
                            className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-500/30 transition-all"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => openTrade(stock, 'SELL')}
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
        </div>
      )}

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

export default Market;
