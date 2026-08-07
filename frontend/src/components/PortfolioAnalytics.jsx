import React from 'react';
import { ShieldCheck, Award, Target, TrendingUp, AlertTriangle } from 'lucide-react';

const PortfolioAnalytics = ({ portfolio }) => {
  if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) return null;

  const holdings = portfolio.holdings;
  const totalHoldingsCount = holdings.length;
  const profitableHoldingsCount = holdings.filter(h => h.profitLoss >= 0).length;
  const winRate = Math.round((profitableHoldingsCount / totalHoldingsCount) * 100);

  // Find top performer
  const sortedByPL = [...holdings].sort((a, b) => b.profitLossPercent - a.profitLossPercent);
  const topPerformer = sortedByPL[0];

  // Calculate Diversification Score
  let divScore = 50;
  let divLabel = 'Moderate';
  let divColor = 'text-amber-400 border-amber-500/30 bg-amber-950/60';

  if (totalHoldingsCount >= 5) {
    divScore = 95;
    divLabel = 'Optimal';
    divColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-950/60';
  } else if (totalHoldingsCount >= 3) {
    divScore = 75;
    divLabel = 'Good';
    divColor = 'text-indigo-400 border-indigo-500/30 bg-indigo-950/60';
  } else {
    divScore = 35;
    divLabel = 'Concentrated';
    divColor = 'text-amber-400 border-amber-500/30 bg-amber-950/60';
  }

  return (
    <div className="bg-[#131927] border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          Portfolio Risk Analytics & Health Score
        </h3>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${divColor}`}>
          {divScore}% • {divLabel} Health
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Win Rate */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Position Win Rate
          </span>
          <div className="text-2xl font-black text-white">{winRate}%</div>
          <p className="text-[11px] text-gray-500">{profitableHoldingsCount} of {totalHoldingsCount} positions profitable</p>
        </div>

        {/* Top Winner */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
            <Award className="w-4 h-4 text-amber-400" /> Top Performer
          </span>
          <div className="text-2xl font-black text-emerald-400">{topPerformer?.symbol || 'N/A'}</div>
          <p className="text-[11px] text-gray-500">
            {topPerformer ? `+${topPerformer.profitLossPercent}% Return` : 'No active holdings'}
          </p>
        </div>

        {/* Diversification Progress Bar */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-semibold">Asset Risk Allocation</span>
            <span className="text-indigo-400 font-bold">{totalHoldingsCount} Assets</span>
          </div>
          
          <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden flex">
            <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, totalHoldingsCount * 20)}%` }}></div>
          </div>
          <p className="text-[11px] text-gray-500">Hold 5+ distinct stocks for optimal risk hedge</p>
        </div>

      </div>
    </div>
  );
};

export default PortfolioAnalytics;
