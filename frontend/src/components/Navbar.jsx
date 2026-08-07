import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DepositModal from './DepositModal';
import { TrendingUp, PieChart, ShieldAlert, LogOut, User, DollarSign, Search, PlusCircle, Clock } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 glass-panel border-b border-gray-800/80 bg-opacity-80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-indigo-300 bg-clip-text text-transparent">
                  Shop<span className="text-indigo-400">EZ</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 -mt-1">
                  Stock Exchange
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/') 
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/market"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isActive('/market') 
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Search className="w-4 h-4" />
                Markets
              </Link>

              {user && (
                <>
                  <Link
                    to="/portfolio"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isActive('/portfolio') 
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <PieChart className="w-4 h-4" />
                    Portfolio
                  </Link>

                  <Link
                    to="/history"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isActive('/history') 
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Order History
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/admin') 
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                      : 'text-purple-300 hover:text-purple-200 hover:bg-purple-900/30'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  Admin Suite
                </Link>
              )}
            </div>

            {/* User Profile / Auth Action */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Virtual Cash Balance Badge */}
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Buying Power: ${user.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <button
                      onClick={() => setIsDepositOpen(true)}
                      className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
                      title="Add high amount buying power funds"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Add Funds
                    </button>
                  </div>

                  {/* Profile Badge & Role */}
                  <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center font-bold text-indigo-300 text-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="hidden xl:flex flex-col">
                      <span className="text-xs font-semibold text-gray-200 leading-tight">{user.name}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">{user.role}</span>
                    </div>
                    
                    <button
                      onClick={logout}
                      title="Logout"
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Deposit Funds Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={refreshProfile}
      />
    </>
  );
};

export default Navbar;
