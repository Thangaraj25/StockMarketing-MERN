import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MarketHeatmap = ({ stocks = [] }) => {
  if (!stocks || stocks.length === 0) return null;

  return (
    <div className="bg-[#131927] border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Live Market Sector Heatmap</h3>
            <p className="text-xs text-gray-400">Real-time performance distribution across all listed equities</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center text-emerald-400"><span className="w-2.5 h-2.5 rounded bg-emerald-500 mr-1"></span> Gainers</span>
          <span className="flex items-center text-red-400"><span className="w-2.5 h-2.5 rounded bg-red-500 mr-1"></span> Losers</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {stocks.map(stock => {
          const isUp = stock.priceChange >= 0;
          return (
            <Link
              key={stock._id}
              to={`/stock/${stock._id}`}
              className={`p-3.5 rounded-xl border transition-all hover:scale-[1.03] group flex flex-col justify-between h-24 ${
                isUp
                  ? 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-950/40 hover:bg-red-900/60 border-red-500/30 text-red-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-white group-hover:underline">{stock.symbol}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400">{stock.category}</span>
              </div>

              <div>
                <div className="text-base font-black text-white">${stock.currentPrice?.toFixed(2)}</div>
                <div className="flex items-center text-xs font-bold mt-0.5">
                  {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                  {isUp ? '+' : ''}{stock.priceChangePercent}%
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MarketHeatmap;
