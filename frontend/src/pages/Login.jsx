import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../config/axiosInstance';
import { motion } from 'motion/react';

export const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState('employee');

  const departmentOptions = [
    'Admin Division',
    'Technical Services',
    'Enforcement Division',
    'Planning & Management',
    'Finance Division',
    'Licenses & Permits',
    'Forestry',
    'Lands',
    'Protected Areas',
    'Others'
  ];

  const positionOptions = [
    'Administrative Officer',
    'Forest Technician',
    'Community Environment Officer',
    'Planning Officer',
    'Finance Officer',
    'Enforcement Officer',
    'Licensing Officer',
    'Forester',
    'Land Management Officer',
    'Protected Area Superintendent',
    'Staff',
    'Others'
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      console.log('🔍 Attempting login with:', { email, password });
      onLogin({ email, password });
      console.log('🎉 onLogin callback called, user should be logged in');
    } catch (err) {
      console.error('❌ Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again or contact your administrator.');
    }
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (!email.endsWith('@denr.gov.ph')) {
      setError('Please use your official @denr.gov.ph email.');
      setIsLoading(false);
      return;
    }
    try {
      await axiosInstance.post('/api/users/register', { // ✅ fixed
        name,
        email,
        password,
        department,
        position,
        role
      });
      setIsRegistering(false);
      setError('Registration successful! You can now log in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          filter: 'blur(8px) brightness(0.6)'
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-2xl overflow-hidden relative z-10 border border-white/20"
      >
        <div className="p-8 text-center bg-emerald-50/50 border-b border-emerald-100">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 p-1 bg-white shadow-lg overflow-hidden">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSffAnIjiFKIVoxn1Ufevzt4rBO6PF2otrRsA&s" 
              alt="DENR Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl font-black text-emerald-900 tracking-tight">DENR WorkMate</h1>
          <p className="text-emerald-600 text-sm font-medium mt-1">Employee Companion System</p>
        </div>

        <div className="p-10">
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all text-sm font-medium"
                    placeholder="Juan Dela Cruz"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Department</label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all text-sm font-medium"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select department</option>
                      {departmentOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Position</label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all text-sm font-medium"
                      value={position}
                      onChange={e => setPosition(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select position</option>
                      {positionOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Role</label>
                  <div className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-xl text-sm font-medium text-gray-700 flex items-center">
                    Employee
                    <span className="text-xs text-gray-500 ml-2">(Admins can change roles in dashboard)</span>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Official Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="email" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all text-sm font-medium"
                  placeholder="name@denr.gov.ph"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                {!isRegistering && (
                  <button
                    type="button"
                    className="text-[9px] font-bold text-emerald-600 hover:text-emerald-800 uppercase tracking-wider"
                    onClick={() => alert('Please contact your HR administrator to reset your password.')}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all text-sm font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-xl text-[10px] font-medium border ${
                  error.includes('successful')
                    ? 'bg-green-50 text-green-600 border-green-100'
                    : 'bg-red-50 text-red-600 border-red-100'
                }`}
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{isRegistering ? 'Create Account' : 'LOG IN'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="text-xs font-bold text-gray-500 hover:text-emerald-700 transition-colors"
            >
              {isRegistering ? 'Already have an account? LOG IN' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-0 w-full text-center text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">
        Department of Environment and Natural Resources
      </div>
    </div>
  );
};