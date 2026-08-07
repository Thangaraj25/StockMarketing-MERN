import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { X, ArrowUpRight, ArrowDownRight, DollarSign, AlertCircle, CheckCircle2, ShoppingBag } from 'lucide-react';

const TradeModal = ({ stock, isOpen, onClose, onTradeSuccess, defaultType = 'BUY' }) => {
  const { user, updateBalanceState } = useAuth();
  const [tradeType, setTradeType] = useState(defaultType);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !stock) return null;

  const currentPrice = stock.currentPrice || 0;
  const totalCost = parseFloat((currentPrice * (quantity || 0)).toFixed(2));
  const availableBalance = user?.balance || 0;

  const handleTrade = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (quantity <= 0) {
      setErrorMsg('Please enter a valid share quantity greater than 0.');
      return;
    }

    if (tradeType === 'BUY' && totalCost > availableBalance) {
      setErrorMsg(`Insufficient buying power. Total cost ($${totalCost}) exceeds your balance ($${availableBalance}).`);
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/trades', {
        stockId: stock._id,
        type: tradeType,
        quantity: parseInt(quantity, 10)
      });

      setSuccessMsg(response.data.message);
      if (response.data.newBalance !== undefined) {
        updateBalanceState(response.data.newBalance);
      }

      setTimeout(() => {
        if (onTradeSuccess) onTradeSuccess();
        onClose();
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Trade execution failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#131927] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-800/80 flex items-center justify-between bg-gradient-to-r from-gray-900 via-gray-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
              {stock.symbol?.slice(0, 3)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{stock.name}</h3>
              <p className="text-xs text-gray-400 font-mono">{stock.symbol} • ${currentPrice.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleTrade} className="p-6 space-y-5">

          {/* Trade Type Selector */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-gray-900 rounded-xl border border-gray-800">
            <button
              type="button"
              onClick={() => { setTradeType('BUY'); setErrorMsg(''); }}
              className={`py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                tradeType === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              BUY STOCK
            </button>

            <button
              type="button"
              onClick={() => { setTradeType('SELL'); setErrorMsg(''); }}
              className={`py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                tradeType === 'SELL'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              SELL STOCK
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quantity Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex justify-between">
              <span>Share Quantity</span>
              <span className="text-gray-500 font-normal">Market Order</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-base font-bold outline-none transition-colors"
                placeholder="1"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                {[1, 5, 10, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuantity(preset)}
                    className="px-2 py-1 text-[10px] font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trade Summary */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Market Price:</span>
              <span className="font-semibold text-gray-200">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Order Type:</span>
              <span className="font-semibold text-gray-200">Instant Execution</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Available Cash:</span>
              <span className="font-semibold text-emerald-400">${availableBalance.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-gray-800 flex justify-between text-sm font-bold text-white">
              <span>Estimated Total:</span>
              <span className={tradeType === 'BUY' ? 'text-indigo-400' : 'text-amber-400'}>
                ${totalCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading || !!successMsg}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
              tradeType === 'BUY'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-600/20'
                : 'bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 shadow-red-600/20'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                CONFIRM {tradeType} ORDER
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default TradeModal;
