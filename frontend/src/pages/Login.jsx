import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Eye, EyeOff, ArrowRight, Activity, Check, Sparkles } from 'lucide-react';

export default function Login({ onLogin, systemInfo, orgInfo, theme }) {
  const isLight = theme === 'light';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const softwareName = systemInfo?.softwareName || 'IT AssetGuard Enterprise';
  const developer = systemInfo?.developer || 'Google DeepMind Team';
  const logoUrl = orgInfo?.logoUrl || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Vui lòng nhập Tên đăng nhập.');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập Mật khẩu.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.user) {
        const userProfile = data.user;
        localStorage.setItem('app_user_profile', JSON.stringify(userProfile));
        if (onLogin) onLogin(userProfile);
      } else {
        setError(data.error || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      setError('Lỗi kết nối đến máy chủ xác thực.');
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden font-['Mulish',sans-serif] ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

      {/* Main Login Box Container */}
      <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden ${
        isLight 
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50' 
          : 'bg-slate-900/95 border-slate-800 text-white shadow-slate-950/80'
      }`}>
        
        {/* Flush Top Gradient Accent Line */}
        <div className="w-full h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>

        {/* Form Body Inner Padding */}
        <div className="p-8 pt-6 space-y-4">
          
          {/* Brand Header */}
          <div className="text-center space-y-2 pb-2">
            <div className="mx-auto mb-2 flex items-center justify-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-16 object-contain max-w-[220px]" />
              ) : (
                <Activity className="w-14 h-14 text-cyan-600" />
              )}
            </div>
            <div>
              <h1 className={`text-xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {softwareName}
              </h1>
              <p className="text-xs text-cyan-600 font-bold mt-1">
                Đăng nhập để sử dụng hệ thống!
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-between animate-fadeIn">
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')} className="hover:text-rose-800">&times;</button>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <User className="w-3.5 h-3.5 text-cyan-600" /> Tên đăng nhập
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập..."
                  className={`w-full border rounded-xl pl-3.5 pr-4 py-2.5 font-semibold text-xs focus:outline-none focus:border-cyan-500 transition ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <Lock className="w-3.5 h-3.5 text-cyan-600" /> Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className={`w-full border rounded-xl pl-3.5 pr-10 py-2.5 font-semibold text-xs focus:outline-none focus:border-cyan-500 transition ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 font-semibold">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 dark:border-slate-700"
                />
                Ghi nhớ đăng nhập
              </label>
              <span className="text-cyan-600 font-bold hover:underline cursor-pointer">Quên mật khẩu?</span>
            </div>

            {/* Dynamic Animated Submit Button with Light Flare Beam */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-[length:200%_auto] hover:bg-right text-white font-extrabold text-xs shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/50 flex items-center justify-center gap-2 transition-all duration-500 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 mt-3 relative overflow-hidden group"
            >
              {/* Continuous Light Flare Beam Sweep Effect */}
              <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-flare pointer-events-none"></span>

              {/* Pulsing Glow Light Effect */}
              <span className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none opacity-30"></span>

              {isLoading ? (
                <span className="flex items-center gap-2 relative z-10">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang xác thực...
                </span>
              ) : (
                <span className="flex items-center gap-2 relative z-10 tracking-wider uppercase text-[11px]">
                  Đăng Nhập Hệ Thống <ArrowRight className="w-4 h-4 transition transform group-hover:translate-x-1" />
                </span>
              )}
            </button>
          </form>

        {/* Footer Credit */}
        <div className="mt-6 text-center text-[10px] text-slate-400 space-y-0.5">
          <p>© 2026 {softwareName}. v2.5.0-Enterprise</p>
          <p>
            Phát triển bởi: <span className="font-semibold text-slate-500 dark:text-slate-400">{developer}</span>
          </p>
        </div>

        </div>
      </div>
    </div>
  );
}
