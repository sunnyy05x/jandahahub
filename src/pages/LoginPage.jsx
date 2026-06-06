import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Smartphone, Mail, Store, Bike, Package, UserCircle, Shield, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  
  const [loginMethod, setLoginMethod] = useState(null); // 'google', 'phone'
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return;
    
    setLoading(true);
    setError(null);
    try {
      await sendPhoneOtp(phone);
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 4) return;

    setLoading(true);
    setError(null);
    try {
      await verifyPhoneOtp(phone, otp);
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
          
          {!loginMethod && (
            <div className="space-y-3">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-2xl font-semibold shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5 text-red-500" />}
                Continue with Google
              </button>
              
              <button 
                onClick={() => setLoginMethod('phone')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-teal-500 text-white py-3.5 rounded-2xl font-semibold shadow-md hover:bg-teal-600 transition-colors disabled:opacity-50"
              >
                <Smartphone className="w-5 h-5" />
                Continue with Phone
              </button>
            </div>
          )}

          {loginMethod === 'phone' && !otpSent && (
            <form onSubmit={handleSendOtp} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500">
                  <span className="flex items-center justify-center px-3 bg-gray-50 text-gray-500 font-semibold border-r border-gray-200">
                    +91
                  </span>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="w-full px-4 py-3 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-teal-500 text-white py-3.5 rounded-2xl font-bold shadow-md hover:bg-teal-600 transition-colors disabled:opacity-50 flex justify-center items-center"
                disabled={phone.length < 10 || loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
              </button>
              <button type="button" onClick={() => setLoginMethod(null)} disabled={loading} className="w-full text-sm text-gray-500 mt-4 font-medium hover:text-gray-800 disabled:opacity-50">
                Back to options
              </button>
            </form>
          )}

          {loginMethod === 'phone' && otpSent && (
            <form onSubmit={handleVerifyOtp} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-sm text-gray-500 mb-4 text-center">
                OTP sent to +91 {phone}
              </p>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Enter OTP</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="------"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-xl tracking-widest focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-teal-500 text-white py-3.5 rounded-2xl font-bold shadow-md hover:bg-teal-600 transition-colors disabled:opacity-50 flex justify-center items-center"
                disabled={otp.length < 4 || loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
