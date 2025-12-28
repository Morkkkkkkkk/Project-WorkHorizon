import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Briefcase, CheckCircle2, LogIn, X, Plus, ArrowLeft, Sparkles } from 'lucide-react';
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

  const [recentUsers, setRecentUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  const from = location.state?.from?.pathname || '/';

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
    const newUser = {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      profileImageUrl: userData.profileImageUrl,
      lastLogin: new Date().toISOString(),
      token: userData.token
    };

    let updatedUsers = [...recentUsers]
      .filter(u => u.email !== userData.email)
      .unshift(newUser);
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
      handleLoginSuccess({ ...result.user, token: result.token });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'รหัสผ่านไม่ถูกต้อง';
      setError(errorMessage);

      const knownUser = recentUsers.find(u => u.email === email);
      if (knownUser && !selectedUser) {
        setSelectedUser(knownUser);
        setPassword('');
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
    if (user.token) {
      setIsLoading(true);
      try {
        await loginWithToken(user.token);
        navigate(from, { replace: true });
        return;
      } catch (err) {
        console.log("Token expired");
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
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-orange-50 font-sans">
      {/* Left Side - Hero (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/7 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 text-3xl font-black tracking-tight mb-12 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-7 h-7" />
              </div>
              <span className="bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                WorkHorizon
              </span>
            </Link>

            <h1 className="text-5xl xl:text-6xl font-black leading-tight mb-8">
              ค้นพบโอกาส<br />
              <span className="text-orange-200">ที่ใช่สำหรับคุณ</span>
            </h1>
            <p className="text-xl text-orange-100 mb-12 max-w-lg leading-relaxed">
              เชื่อมต่อนายจ้างและฟรีแลนซ์คุณภาพสูง ด้วยระบบที่ทันสมัย ปลอดภัย และใช้งานง่าย
            </p>

            <div className="space-y-6">
              {[
                { text: "งานคุณภาพสูงจากบริษัทชั้นนำ", icon: Sparkles },
                { text: "ชำระเงินอัตโนมัติ ปลอดภัย 100%", icon: CheckCircle2 },
                { text: "แชทและจัดการโปรเจกต์ในที่เดียว", icon: Briefcase }
              ].map(({ text, icon: Icon }, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-orange-200 text-sm">
            © 2025 WorkHorizon • สร้างโอกาส สร้างอนาคต
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-4/7 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-lg">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-3 text-3xl font-black">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/30">
                <Briefcase className="w-7 h-7" />
              </div>
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                WorkHorizon
              </span>
            </Link>
          </div>

          {/* Recent Users View */}
          {!selectedUser && !isAddingAccount && recentUsers.length > 0 ? (
            <div className="text-center">
              <h2 className="text-4xl font-black text-slate-900 mb-3">เลือกบัญชี</h2>
              <p className="text-slate-600 mb-10 text-lg">เข้าสู่ระบบได้อย่างรวดเร็ว</p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                {recentUsers.map(user => (
                  <div
                    key={user.email}
                    onClick={() => handleSelectUser(user)}
                    className="group relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer"
                  >
                    <button
                      onClick={(e) => handleRemoveRecentUser(e, user.email)}
                      className="absolute top-4 right-4 p-2 bg-white/70 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>

                    <div className="mb-5">
                      <img
                        src={getImageUrl(user.profileImageUrl) || `https://placehold.co/120x120/orange/white?text=${user.firstName[0]}`}
                        alt={user.firstName}
                        className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 truncate">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{user.email}</p>
                  </div>
                ))}

                {/* Add Account */}
                <div
                  onClick={() => {
                    setIsAddingAccount(true);
                    setSelectedUser(null);
                    setEmail('');
                  }}
                  className="bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-400 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:from-orange-50 hover:to-red-50 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-orange-600" />
                  </div>
                  <span className="font-bold text-slate-700 text-lg">เพิ่มบัญชีใหม่</span>
                </div>
              </div>
            </div>
          ) : (
            /* Login Form View */
            <div>
              {(selectedUser || isAddingAccount) && (
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setIsAddingAccount(false);
                    setEmail('');
                    setError(null);
                  }}
                  className="mb-8 flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  {isAddingAccount ? 'ย้อนกลับ' : 'ใช้บัญชีอื่น'}
                </button>
              )}

              {selectedUser ? (
                <div className="text-center mb-10">
                  <img
                    src={getImageUrl(selectedUser.profileImageUrl) || `https://placehold.co/140x140/orange/white?text=${selectedUser.firstName[0]}`}
                    alt={selectedUser.firstName}
                    className="w-32 h-32 rounded-full object-cover mx-auto border-8 border-white shadow-2xl mb-6"
                  />
                  <h2 className="text-3xl font-black text-slate-900">
                    สวัสดี, {selectedUser.firstName}!
                  </h2>
                  <p className="text-slate-600 mt-2">กรอกรหัสผ่านเพื่อเข้าสู่ระบบ</p>
                </div>
              ) : (
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-black text-slate-900 mb-3">เข้าสู่ระบบ</h2>
                  <p className="text-xl text-slate-600">เริ่มต้นใช้งาน WorkHorizon ได้ทันที</p>
                </div>
              )}

              {error && (
                <div className="mb-8 p-5 bg-red-50/80 backdrop-blur border border-red-200 rounded-2xl flex items-center gap-4">
                  <div className="text-2xl">⚠️</div>
                  <p className="text-red-700 font-semibold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {(!selectedUser || isAddingAccount) && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">อีเมล</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-5 py-4 bg-white/70 backdrop-blur border border-slate-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all text-base"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-slate-700">รหัสผ่าน</label>
                    <Link to="/forgot-password" className="text-sm font-bold text-orange-600 hover:text-orange-700">
                      ลืมรหัสผ่าน?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus={!!selectedUser}
                      className="w-full pl-12 pr-5 py-4 bg-white/70 backdrop-blur border border-slate-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all text-base"
                      placeholder="••••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="remember" className="text-slate-700 font-medium">
                    จดจำฉันในอุปกรณ์นี้
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 px-6 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {isLoading ? 'กำลังเข้าสู่ระบบ...' : (
                    <>
                      เข้าสู่ระบบ
                      <LogIn className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {!selectedUser && (
                <div className="mt-10 text-center">
                  <p className="text-slate-600 text-lg">
                    ยังไม่มีบัญชี?{' '}
                    <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700 underline decoration-2 underline-offset-4">
                      สมัครสมาชิกฟรี
                    </Link>
                  </p>
                </div>
              )}

              {selectedUser && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => { setSelectedUser(null); setEmail(''); }}
                    className="text-orange-600 font-semibold hover:underline"
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