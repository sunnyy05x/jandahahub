import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      // Auth state will change automatically and redirect
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      
      {/* Logo/Branding */}
      <div className="w-full max-w-sm mb-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-2xl shadow-xl mx-auto flex items-center justify-center mb-4">
          <span className="text-4xl">🚀</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">JandahaHub</h1>
        <p className="text-gray-500 font-medium">Your Village Super App</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
        
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Login / Signup</h2>
          
          <div className="space-y-3">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-2xl font-semibold shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5 text-red-500" />}
              Continue with Google
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
