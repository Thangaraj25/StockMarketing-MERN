import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockChart = ({ historicalPrices = [], currentPrice, previousClose, symbol }) => {
  const [timeframe, setTimeframe] = useState('1D');

  const isBullish = (currentPrice || 0) >= (previousClose || 0);
  const lineColor = isBullish ? '#10b981' : '#ef4444';
  const fillColor = isBullish ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)';

  // Build labels and points
  let points = historicalPrices && historicalPrices.length > 0
    ? historicalPrices.map(h => h.price)
    : [previousClose || 100, currentPrice || 105];

  let labels = historicalPrices && historicalPrices.length > 0
    ? historicalPrices.map(h => new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    : ['9:30 AM', '10:30 AM', '11:30 AM', '1:30 PM', '4:00 PM'];

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: `${symbol} Price ($)`,
        data: points,
        borderColor: lineColor,
        borderWidth: 2.5,
        backgroundColor: fillColor,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#131927',
        titleColor: '#9ca3af',
        bodyColor: '#ffffff',
        borderColor: '#2a344a',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => ` Price: $${context.raw?.toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)'
        },
        ticks: {
          color: '#6b7280',
          font: { size: 11 }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)'
        },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
          callback: (value) => `$${value}`
        }
      }
    }
  };

  return (
    <div className="w-full bg-[#131927] border border-gray-800/80 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Real-Time Performance</span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {symbol} Price Movement
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isBullish ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-red-950 text-red-400 border border-red-500/30'}`}>
              {isBullish ? 'BULLISH' : 'BEARISH'}
            </span>
          </h3>
        </div>

        {/* Timeframe selector tabs */}
        <div className="flex items-center bg-gray-900/80 p-1 rounded-xl border border-gray-800 self-start sm:self-auto">
          {['1D', '1W', '1M', '1Y', 'ALL'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default StockChart;
