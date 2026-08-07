import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { X, DollarSign, PlusCircle, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const DepositModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, updateBalanceState } = useAuth();
  const [amount, setAmount] = useState(50000);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const presets = [10000, 50000, 100000, 500000, 1000000];

  const handleDeposit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!amount || amount <= 0) {
      setErrorMsg('Please enter a valid deposit amount greater than $0.');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/deposit', { amount: parseFloat(amount) });
      setSuccessMsg(response.data.message);
      if (response.data.newBalance !== undefined) {
        updateBalanceState(response.data.newBalance);
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Deposit failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#131927] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-800/80 flex items-center justify-between bg-gradient-to-r from-emerald-950/60 via-gray-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white leading-tight">Deposit Virtual Capital</h3>
              <p className="text-xs text-gray-400">Add high amount buying power to your account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleDeposit} className="p-6 space-y-5">

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

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 flex justify-between">
              <span>Deposit Amount ($)</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Instant Credit
              </span>
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-black text-lg">$</span>
              <input
                type="number"
                min="100"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-3 text-white text-xl font-black outline-none transition-colors"
                placeholder="50000"
              />
            </div>
          </div>

          {/* High Amount Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quick High Amount Presets:</span>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs border transition-all ${
                    amount === p
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                      : 'bg-gray-900 text-gray-300 border-gray-800 hover:bg-gray-800'
                  }`}
                >
                  +${p >= 1000000 ? `${p / 1000000}M` : `${p / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Balance Preview */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Current Cash Balance:</span>
              <span className="font-semibold text-gray-200">${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="pt-2 border-t border-gray-800 flex justify-between text-sm font-bold text-white">
              <span>New Total Buying Power:</span>
              <span className="text-emerald-400">
                ${((user?.balance || 0) + (parseFloat(amount) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !!successMsg}
            className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                ADD ${parseFloat(amount || 0).toLocaleString()} TO BUYING POWER
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default DepositModal;
