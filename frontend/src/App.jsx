import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Market from './pages/Market';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

import { useAuth } from './context/AuthContext';
import { AlertCircle, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthBanner = () => {
  const { authError, clearAuthError } = useAuth();

  if (!authError) return null;

  return (
    <div className="bg-red-950/90 border-b border-red-500/50 text-red-200 px-4 py-3 text-center text-sm font-semibold flex items-center justify-center gap-2 animate-fade-in">
      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
      <span>{authError}</span>
      <Link
        to="/login"
        onClick={clearAuthError}
        className="ml-2 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-red-600/30 transition-all hover:scale-105"
      >
        <LogIn className="w-3.5 h-3.5" />
        Log In
      </Link>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col justify-between bg-[#0b0f19] text-gray-100">
          <AuthBanner />
          <Navbar />

          <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/market" element={<Market />} />
              <Route path="/stock/:id" element={<StockDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Investor Portfolio Route */}
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />

              {/* Protected Order History Route */}
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Suite Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
