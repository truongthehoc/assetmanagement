import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  Camera, 
  Lock, 
  Check, 
  Save, 
  Key, 
  Eye, 
  EyeOff, 
  Sparkles,
  BadgeCheck,
  Briefcase
} from 'lucide-react';
import { apiUrl, getFileUrl } from '../utils/api';

export default function UserProfile({ theme, onUserUpdated }) {
  const isLight = theme === 'light';
  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  // User Profile State
  const [profile, setProfile] = useState({
    username: 'admin_system',
    fullName: 'Admin System',
    email: 'admin@company.com',
    phone: '0901234567',
    departmentName: 'Phòng Công Nghệ Thông Tin (IT Central)',
    jobTitle: 'Quản Trị Viên Hệ Thống',
    role: 'ADMIN',
    avatarUrl: '',
    authMethod: 'LOCAL'
  });

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Status banners
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load profile from Backend API or LocalStorage on mount
  useEffect(() => {
    const fetchServerProfile = async () => {
      try {
        const saved = localStorage.getItem('app_user_profile');
        let parsed = saved ? JSON.parse(saved) : null;
        const targetUsername = parsed?.username || 'admin_system';

        const res = await fetch(apiUrl(`/api/users/profile?username=${targetUsername}`));
        if (res.ok) {
          const serverData = await res.json();
          if (serverData && serverData.username) {
            const merged = {
              ...parsed,
              ...serverData,
              // prefer server avatarUrl if present
              avatarUrl: serverData.avatarUrl || parsed?.avatarUrl || ''
            };
            setProfile(merged);
            localStorage.setItem('app_user_profile', JSON.stringify(merged));
            return;
          }
        }
        if (parsed) setProfile(parsed);
      } catch (e) {
        console.warn('Profile fetch warning:', e);
      }
    };
    fetchServerProfile();
  }, []);

  // Auto-dismiss success notification after 3 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Auto-dismiss error notification after 3 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Handle Avatar Image File Upload to Server
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Read file as base64 Data URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        const cleanName = `avatar_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;

        try {
          // 2. Upload image file to Backend Server /api/upload
          const res = await fetch(apiUrl('/api/upload'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: cleanName, fileData: base64Data })
          });

          const data = await res.json();
          const serverAvatarUrl = data.url || base64Data;

          // 3. Save updated avatar URL to Backend Database /api/users/profile
          const updated = { ...profile, avatarUrl: serverAvatarUrl };
          setProfile(updated);
          localStorage.setItem('app_user_profile', JSON.stringify(updated));

          await fetch(apiUrl('/api/users/profile'), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: profile.username || 'admin_system',
              avatarUrl: serverAvatarUrl,
              fullName: profile.fullName,
              email: profile.email,
              phone: profile.phone
            })
          });

          setSuccessMsg('Đã lưu ảnh đại diện lên máy chủ thành công!');
          if (onUserUpdated) onUserUpdated(updated);
        } catch (uploadErr) {
          console.error('Server avatar upload error:', uploadErr);
          const fallback = { ...profile, avatarUrl: base64Data };
          setProfile(fallback);
          localStorage.setItem('app_user_profile', JSON.stringify(fallback));
          setSuccessMsg('Đã cập nhật ảnh đại diện cục bộ!');
        } finally {
          setUploadingAvatar(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Avatar file read error:', err);
      setErrorMsg('Không thể đọc tập tin hình ảnh.');
      setUploadingAvatar(false);
    }
  };

  // Handle Profile Information Save to Server Database
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      localStorage.setItem('app_user_profile', JSON.stringify(profile));

      // Save to Backend Database
      await fetch(apiUrl('/api/users/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profile.username || 'admin_system',
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          avatarUrl: profile.avatarUrl
        })
      });

      setSuccessMsg('Đã lưu thông tin tài khoản lên máy chủ thành công!');
      if (onUserUpdated) onUserUpdated(profile);
    } catch (err) {
      console.error('Save profile error:', err);
      setErrorMsg('Không thể lưu thông tin lên máy chủ. Vui lòng thử lại!');
    } finally {
      setSaving(false);
    }
  };

  // Handle Change Password Submit
  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!passwordForm.currentPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setSuccessMsg('Đổi mật khẩu thành công!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6 w-full pb-12">
      
      {/* Toast Alert Banners */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" /> {successMsg}
          </span>
          <button onClick={() => setSuccessMsg('')} className="hover:text-emerald-800">
            &times;
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-between animate-fadeIn">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="hover:text-rose-800">
            &times;
          </button>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Account Summary Card */}
        <div className="space-y-6">
          <div className={`${cardClass} p-6 rounded-2xl text-center space-y-4 relative overflow-hidden`}>
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>

            {/* Avatar Upload Container */}
            <div className="relative w-28 h-28 mx-auto mt-2 group">
              {profile.avatarUrl ? (
                <img 
                  src={getFileUrl(profile.avatarUrl)} 
                  alt={profile.fullName} 
                  className="w-28 h-28 rounded-full object-cover border-4 border-cyan-500/30 shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white font-extrabold text-3xl flex items-center justify-center border-4 border-cyan-500/30 shadow-xl">
                  {profile.fullName ? profile.fullName.split(' ').slice(-2).map(n => n[0]).join('') : 'AD'}
                </div>
              )}

              {/* Upload Overlay Button */}
              <label 
                htmlFor="avatar-upload-input"
                className="absolute inset-0 rounded-full bg-slate-950/60 text-white opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center cursor-pointer backdrop-blur-xs"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">Đổi Avatar</span>
              </label>
              
              <input 
                id="avatar-upload-input" 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload}
                className="hidden" 
              />
            </div>

            <div>
              <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {profile.fullName}
              </h2>
              <p className="text-xs text-cyan-600 font-bold mt-0.5 flex items-center justify-center gap-1">
                <BadgeCheck className="w-4 h-4" /> {profile.jobTitle || 'Quản Trị Viên Hệ Thống'}
              </p>
              <p className="text-xs text-slate-400 mt-1">@{profile.username}</p>
            </div>

            {/* Quick Stats Badges */}
            <div className={`p-4 rounded-xl border space-y-2 text-left text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Quyền Hạn:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                  ADMINISTRATOR
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Phương Thức Đăng Nhập:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">LOCAL AUTH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Trạng Thái Tài Khoản:</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Hoạt Động
                </span>
              </div>
            </div>

            {/* Quick Upload Action Button */}
            <label 
              htmlFor="avatar-upload-input"
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-cyan-50 dark:hover:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Camera className="w-4 h-4" /> {uploadingAvatar ? 'Đang tải ảnh lên...' : 'Tải Ảnh Đại Diện Mới'}
            </label>
          </div>
        </div>

        {/* Right Column (2 Spans): Edit Information Form & Password Change Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Form 1: Profile Information Edit */}
          <form onSubmit={handleSaveProfile} className={`${cardClass} p-6 rounded-2xl space-y-5`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <User className="w-5 h-5 text-cyan-600" /> Thông Tin Cá Nhân & Tài Khoản
              </h3>
              <span className="text-[11px] text-slate-400 italic">Cập nhật hồ sơ cá nhân của bạn</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Họ và tên */}
              <div className="space-y-1">
                <label className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <User className="w-3.5 h-3.5 text-cyan-600" /> Họ và tên <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Nhập họ và tên..."
                  className={`w-full border rounded-xl px-3.5 py-2.5 font-semibold text-xs focus:outline-none focus:border-cyan-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              {/* Tên đăng nhập */}
              <div className="space-y-1">
                <label className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <BadgeCheck className="w-3.5 h-3.5 text-cyan-600" /> Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={profile.username}
                  readOnly
                  className={`w-full border rounded-xl px-3.5 py-2.5 font-bold text-xs cursor-not-allowed opacity-80 ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-950/80 border-slate-800 text-slate-400'
                  }`}
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <Mail className="w-3.5 h-3.5 text-cyan-600" /> Địa chỉ Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="Nhập địa chỉ email..."
                  className={`w-full border rounded-xl px-3.5 py-2.5 font-semibold text-xs focus:outline-none focus:border-cyan-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1">
                <label className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <Phone className="w-3.5 h-3.5 text-cyan-600" /> Số điện thoại
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Nhập số điện thoại..."
                  className={`w-full border rounded-xl px-3.5 py-2.5 font-semibold text-xs focus:outline-none focus:border-cyan-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              {/* Chức danh (Khóa không cho sửa) */}
              <div className="space-y-1">
                <label className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <Briefcase className="w-3.5 h-3.5 text-cyan-600" /> Chức danh / Vị trí <Lock className="w-3 h-3 text-slate-400" />
                </label>
                <input
                  type="text"
                  value={profile.jobTitle}
                  readOnly
                  className={`w-full border rounded-xl px-3.5 py-2.5 font-bold text-xs cursor-not-allowed opacity-80 ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-950/80 border-slate-800 text-slate-400'
                  }`}
                />
              </div>

              {/* Phòng ban / Đơn vị (Khóa không cho sửa) */}
              <div className="space-y-1">
                <label className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <Building2 className="w-3.5 h-3.5 text-cyan-600" /> Phòng ban / Khoa đơn vị <Lock className="w-3 h-3 text-slate-400" />
                </label>
                <input
                  type="text"
                  value={profile.departmentName}
                  readOnly
                  className={`w-full border rounded-xl px-3.5 py-2.5 font-bold text-xs cursor-not-allowed opacity-80 ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-950/80 border-slate-800 text-slate-400'
                  }`}
                />
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Lưu Thay Đổi Thông Tin'}
              </button>
            </div>
          </form>

          {/* Form 2: Change Password Section */}
          <form onSubmit={handleChangePasswordSubmit} className={`${cardClass} p-6 rounded-2xl space-y-5`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Lock className="w-5 h-5 text-amber-500" /> Đổi Mật Khẩu Đăng Nhập
              </h3>
              <span className="text-[11px] text-slate-400 italic">Bảo vệ an toàn cho tài khoản hệ thống</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Mật khẩu hiện tại */}
              <div className="space-y-1">
                <label className={`font-bold text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Mật khẩu hiện tại..."
                    className={`w-full border rounded-xl pl-3.5 pr-9 py-2.5 font-semibold text-xs focus:outline-none focus:border-amber-500 ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div className="space-y-1">
                <label className={`font-bold text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Mật khẩu mới (tối thiểu 6 ký tự)..."
                    className={`w-full border rounded-xl pl-3.5 pr-9 py-2.5 font-semibold text-xs focus:outline-none focus:border-amber-500 ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div className="space-y-1">
                <label className={`font-bold text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới..."
                    className={`w-full border rounded-xl pl-3.5 pr-9 py-2.5 font-semibold text-xs focus:outline-none focus:border-amber-500 ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-2 transition"
              >
                <Key className="w-4 h-4" /> Cập Nhật Mật Khẩu
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
}
