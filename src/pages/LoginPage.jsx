import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Smartphone, Mail, Store, Bike, Package, UserCircle, Shield } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState(null); // 'google', 'phone'
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  
  // For simulation: allow user to select their role during sign in
  const [selectedRole, setSelectedRole] = useState('customer');

  const roles = [
    { id: 'customer', name: 'Customer', icon: UserCircle, color: 'text-teal-600' },
    { id: 'shopkeeper', name: 'Shopkeeper', icon: Store, color: 'text-orange-500' },
    { id: 'driver', name: 'Cab/Rapido', icon: Bike, color: 'text-blue-500' },
    { id: 'delivery', name: 'Deliveryman', icon: Package, color: 'text-green-600' },
    { id: 'admin', name: 'Admin', icon: Shield, color: 'text-red-500' },
  ];

  const handleSimulatedLogin = (e) => {
    e.preventDefault();
    
    // Simulate user profile based on role
    const mockUser = {
      name: loginMethod === 'google' ? 'Google User' : 'Phone User',
      phone: phone || '9876543210',
      address: 'Ward 7, Jandaha, Vaishali',
      avatar: selectedRole === 'admin' ? '🛡️' : '👤',
      id: `user-${Date.now()}`
    };

    login(mockUser, selectedRole);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length >= 10) setOtpSent(true);
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
        
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">1. Select Your Role</h2>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((role) => {
              const Icon = role.icon;
              const isActive = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                    isActive 
                      ? 'border-teal-500 bg-teal-50 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-1 ${isActive ? role.color : 'text-gray-400'}`} />
                  <span className={`text-xs font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    {role.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">2. Login Method</h2>
          
          {!loginMethod && (
            <div className="space-y-3">
              <button 
                onClick={() => setLoginMethod('google')}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-2xl font-semibold shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-5 h-5 text-red-500" />
                Continue with Google
              </button>
              
              <button 
                onClick={() => setLoginMethod('phone')}
                className="w-full flex items-center justify-center gap-2 bg-teal-500 text-white py-3.5 rounded-2xl font-semibold shadow-md hover:bg-teal-600 transition-colors"
              >
                <Smartphone className="w-5 h-5" />
                Continue with Phone
              </button>
            </div>
          )}

          {loginMethod === 'google' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-sm text-gray-500 mb-4 text-center">
                Simulating Google Authentication...
              </p>
              <button 
                onClick={handleSimulatedLogin}
                className="w-full bg-teal-500 text-white py-3.5 rounded-2xl font-bold shadow-md hover:bg-teal-600 transition-colors"
              >
                Authenticate Now
              </button>
              <button onClick={() => setLoginMethod(null)} className="w-full text-sm text-gray-500 mt-4 font-medium hover:text-gray-800">
                Back to options
              </button>
            </div>
          )}

          {loginMethod === 'phone' && !otpSent && (
            <form onSubmit={handleSendOtp} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-teal-500 text-white py-3.5 rounded-2xl font-bold shadow-md hover:bg-teal-600 transition-colors disabled:opacity-50"
                disabled={phone.length < 10}
              >
                Send OTP
              </button>
              <button type="button" onClick={() => setLoginMethod(null)} className="w-full text-sm text-gray-500 mt-4 font-medium hover:text-gray-800">
                Back to options
              </button>
            </form>
          )}

          {loginMethod === 'phone' && otpSent && (
            <form onSubmit={handleSimulatedLogin} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-sm text-gray-500 mb-4 text-center">
                OTP sent to +91 {phone}
              </p>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Enter OTP (Any 4 digits for demo)</label>
                <input 
                  type="number" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="----"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-xl tracking-widest focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-teal-500 text-white py-3.5 rounded-2xl font-bold shadow-md hover:bg-teal-600 transition-colors disabled:opacity-50"
                disabled={otp.length < 4}
              >
                Verify & Login
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
