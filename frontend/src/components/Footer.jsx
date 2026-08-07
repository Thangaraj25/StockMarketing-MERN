import React from 'react';
import { TrendingUp, ShieldCheck, Activity, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-gray-800/80 bg-[#080b12] text-gray-400 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-wide">
                Shop<span className="text-indigo-400">EZ</span> Stock Exchange
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Empowering smart investors with real-time market data, simulated stock execution, portfolio analytics, and automated moderation for an effortless trading experience.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Price Ticker Engine Online (5s polling)
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Markets & Asset Classes</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-indigo-400 transition-colors">Technology Equities</li>
              <li className="hover:text-indigo-400 transition-colors">Semiconductor Giants</li>
              <li className="hover:text-indigo-400 transition-colors">Automotive & EV Innovation</li>
              <li className="hover:text-indigo-400 transition-colors">Global E-Commerce Leaders</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Security & Compliance</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> JWT Encrypted Tokens
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Activity className="w-4 h-4 text-emerald-400" /> Virtual Trading Sandbox
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Globe className="w-4 h-4 text-purple-400" /> Role-Based Access Control
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} ShopEZ Stock Exchange Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with MERN Stack (MongoDB, Express, React, Node.js)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
