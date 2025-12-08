import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Briefcase, CheckCircle2, LogIn, X, Plus, ArrowLeft } from 'lucide-react';
import { BACKEND_URL } from '../api/apiClient';

const LoginPage = () => {
  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Recent Users State
  const [recentUsers, setRecentUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false); // ✅ NEW: State for adding account

  const from = location.state?.from?.pathname || '/';

  // Load recent users from localStorage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('workhorizon_recent_users');
    if (storedUsers) {
      setRecentUsers(JSON.parse(storedUsers));
    }
  }, []);

  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  const handleLoginSuccess = (userData) => {
    // Save to recent users
    const newUser = {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      profileImageUrl: userData.profileImageUrl,
      lastLogin: new Date().toISOString(),
      token: userData.token // ✅ Store token if available (handled in login)
    };

    let updatedUsers = [...recentUsers];
    // Remove if exists
    updatedUsers = updatedUsers.filter(u => u.email !== userData.email);
    // Add to top
    updatedUsers.unshift(newUser);
    // Limit to 4
    updatedUsers = updatedUsers.slice(0, 4);

    if (rememberMe) {
      localStorage.setItem('workhorizon_recent_users', JSON.stringify(updatedUsers));
    }

    navigate(from, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      // login now returns { user, token }
      handleLoginSuccess({ ...result.user, token: result.token });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'รหัสผ่านไม่ถูกต้อง';
      setError(errorMessage);

      // ✅ NEW: If login fails (wrong password) and we know this user (from recent list),
      // switch to the "Selected User" view to show their profile picture.
      // This mimics Facebook's "Is this you?" flow.
      const knownUser = recentUsers.find(u => u.email === email);
      if (knownUser && !selectedUser) {
        setSelectedUser(knownUser);
        setPassword(''); // Clear password
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRecentUser = (e, emailToRemove) => {
    e.stopPropagation();
    const updated = recentUsers.filter(u => u.email !== emailToRemove);
    setRecentUsers(updated);
    localStorage.setItem('workhorizon_recent_users', JSON.stringify(updated));
    if (selectedUser?.email === emailToRemove) {
      setSelectedUser(null);
      setEmail('');
    }
  };

  const handleSelectUser = async (user) => {
    // ✅ NEW: Check for token and try auto-login
    if (user.token) {
      setIsLoading(true);
      try {
        await loginWithToken(user.token);
        // If successful, redirect
        navigate(from, { replace: true });
        return;
      } catch (err) {
        // Token invalid/expired, fall back to password entry
        console.log("Token expired, requiring password");
      } finally {
        setIsLoading(false);
      }
    }

    setSelectedUser(user);
    setEmail(user.email);
    setPassword('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
      {/* --- Left Side: Hero Section (Hidden on mobile) --- */}
      <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-orange-600 to-red-600 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight mb-10 text-white hover:text-orange-100 transition-colors">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Briefcase className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <span>WorkHorizon</span>
          </Link>

          <h1 className="text-4xl font-bold leading-tight mb-6">
            ยินดีต้อนรับกลับสู่<br />ชุมชนคนทำงาน
          </h1>
          <p className="text-orange-100 text-lg mb-8">
            เข้าสู่ระบบเพื่อจัดการงาน สมัครงาน หรือค้นหาฟรีแลนซ์ที่คุณถูกใจได้ทันที
          </p>

          {/* Feature List */}
          <div className="space-y-4">
            {['อัปเดตสถานะงานได้ตลอดเวลา', 'แชทคุยงานได้สะดวกรวดเร็ว', 'ระบบชำระเงินที่ปลอดภัย'].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-orange-50">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-orange-200">
          © 2024 WorkHorizon. All rights reserved.
        </div>
      </div>

      {/* --- Right Side: Login Form --- */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-4 sm:p-8 md:p-12">
        <div className="w-full max-w-md">

          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-slate-800">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Briefcase size={24} strokeWidth={2.5} />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">WorkHorizon</span>
            </Link>
          </div>

          {/* === RECENT LOGINS VIEW === */}
          {!selectedUser && !isAddingAccount && recentUsers.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">เข้าสู่ระบบล่าสุด</h2>
              <p className="text-slate-500 mb-8 text-center">คลิกที่รูปโปรไฟล์หรือเพิ่มบัญชีใหม่</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {recentUsers.map(user => (
                  <div
                    key={user.email}
                    onClick={() => handleSelectUser(user)}
                    className="relative group bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:shadow-md hover:border-orange-200 transition-all"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={(e) => handleRemoveRecentUser(e, user.email)}
                      className="absolute top-2 left-2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      title="ลบบัญชีนี้ออกจากเครื่อง"
                    >
                      <X size={16} />
                    </button>

                    {/* Avatar */}
                    <div className="relative mb-3">
                      <img
                        src={getImageUrl(user.profileImageUrl) || `https://placehold.co/100x100/FF9800/FFFFFF?text=${user.firstName.charAt(0)}`}
                        alt={user.firstName}
                        className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-sm group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <h3 className="font-bold text-slate-800 truncate w-full text-center">{user.firstName} {user.lastName}</h3>
                  </div>
                ))}

                {/* Add Account Button */}
                <div
                  onClick={() => {
                    setIsAddingAccount(true); // ✅ Switch to login form
                    setSelectedUser(null);
                    setEmail('');
                    setError(null);
                  }}
                  className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-all min-h-[160px]"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-orange-600">
                    <Plus size={24} />
                  </div>
                  <span className="font-bold text-slate-600">เพิ่มบัญชี</span>
                </div>
              </div>
            </div>
          ) : (
            /* === LOGIN FORM VIEW === */
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">

              {/* Back Button (if coming from recent users or adding account) */}
              {(selectedUser || isAddingAccount) && (
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setIsAddingAccount(false); // ✅ Go back to list
                    setEmail('');
                    setError(null);
                  }}
                  className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
                >
                  <ArrowLeft size={18} /> {isAddingAccount ? 'ย้อนกลับ' : 'ไม่ใช่คุณ?'}
                </button>
              )}

              <div className="mb-8 text-center">
                {selectedUser ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={getImageUrl(selectedUser.profileImageUrl) || `https://placehold.co/100x100/FF9800/FFFFFF?text=${selectedUser.firstName.charAt(0)}`}
                      alt={selectedUser.firstName}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-4"
                    />
                    <h2 className="text-2xl font-bold text-slate-900">ยินดีต้อนรับ, {selectedUser.firstName}</h2>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-slate-900">เข้าสู่ระบบ</h2>
                    <p className="text-slate-500 mt-2">กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งาน</p>
                  </>
                )}
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-pulse">
                  <div className="text-red-500 mt-0.5">⚠️</div>
                  <div className="text-sm text-red-700 font-medium">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {(!selectedUser || isAddingAccount) && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">อีเมล</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-white hover:border-slate-300"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-bold text-slate-700">รหัสผ่าน</label>
                    <Link to="/forgot-password" className="text-sm font-bold text-orange-600 hover:text-orange-700 hover:underline">
                      ลืมรหัสผ่าน?
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-white hover:border-slate-300"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus={!!selectedUser}
                    />
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                    จำการเข้าสู่ระบบของฉัน
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-600/20 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                >
                  {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                  {!isLoading && <LogIn size={18} />}
                </button>
              </form>

              {!selectedUser && (
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                  <p className="text-sm text-slate-600">
                    ยังไม่มีบัญชีผู้ใช้?{' '}
                    <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition">
                      สมัครสมาชิกฟรี
                    </Link>
                  </p>
                </div>
              )}

              {/* If selected user, show option to switch account */}
              {selectedUser && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => { setSelectedUser(null); setEmail(''); }}
                    className="text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors"
                  >
                    เข้าสู่ระบบด้วยบัญชีอื่น
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
