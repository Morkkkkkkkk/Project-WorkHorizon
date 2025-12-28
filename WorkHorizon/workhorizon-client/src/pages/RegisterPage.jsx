import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Briefcase, Building2, PenTool, ArrowRight, ChevronLeft, Sparkles,CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState(null); // 'GENERAL' or 'BUSINESS'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'JOB_SEEKER',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type) => {
    setUserType(type);
    setFormData(prev => ({
      ...prev,
      role: type === 'GENERAL' ? 'JOB_SEEKER' : 'EMPLOYER'
    }));
    setStep(2);
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      await register(formData);
      setSuccess('สมัครสมาชิกสำเร็จ! กำลังพาคุณไปหน้าเข้าสู่ระบบ...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.error || 'การสมัครล้มเหลว (อีเมลอาจซ้ำ หรือข้อมูลไม่ครบถ้วน)');
    } finally {
      setIsLoading(false);
    }
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
              เริ่มต้นเส้นทาง<br />
              <span className="text-orange-200">อาชีพของคุณวันนี้</span>
            </h1>
            <p className="text-xl text-orange-100 mb-12 max-w-lg leading-relaxed">
              เข้าร่วมชุมชนคนทำงานและธุรกิจกว่าแสนราย ที่เชื่อมต่อโอกาสดี ๆ ด้วยเทคโนโลยีทันสมัย
            </p>

            <div className="space-y-6">
              {[
                { text: "ค้นหางานและฟรีแลนซ์คุณภาพสูง", icon: Sparkles },
                { text: "ประกาศงานฟรี ไม่มีค่าธรรมเนียมแอบแฝง", icon: Briefcase },
                { text: "ระบบจัดการโปรเจกต์ครบวงจร", icon: CheckCircle2 }
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
            © 2025 WorkHorizon • สร้างอนาคตการทำงานที่ดีกว่า
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 xl:w-4/7 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-xl">

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

          {/* Step 1: Choose Account Type */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-4xl font-black text-slate-900 mb-4">คุณคือใครใน WorkHorizon?</h2>
              <p className="text-xl text-slate-600 mb-12">เลือกประเภทบัญชีที่ตรงกับเป้าหมายของคุณ</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Job Seeker */}
                <button
                  onClick={() => handleTypeSelect('GENERAL')}
                  className="group relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 cursor-pointer hover:scale-105"
                >
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                      <User className="w-10 h-10" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3">ผู้หางาน</h3>
                  <p className="text-slate-600 leading-relaxed">
                    สร้างโปรไฟล์ ฝากประวัติ<br />ค้นหางานและสมัครได้ทันที
                  </p>
                  <ArrowRight className="w-8 h-8 mx-auto mt-6 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Business / Freelancer */}
                <button
                  onClick={() => handleTypeSelect('BUSINESS')}
                  className="group relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 cursor-pointer hover:scale-105"
                >
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                      <Building2 className="w-10 h-10" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3">ธุรกิจ / ฟรีแลนซ์</h3>
                  <p className="text-slate-600 leading-relaxed">
                    ประกาศงาน รับสมัคร<br />หรือหาโปรเจกต์ใหม่ ๆ
                  </p>
                  <ArrowRight className="w-8 h-8 mx-auto mt-6 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>

              <div className="mt-12 text-center">
                <p className="text-slate-600 text-lg">
                  มีบัญชีแล้ว?{' '}
                  <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700 underline decoration-2">
                    เข้าสู่ระบบเลย
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Registration Form */}
          {step === 2 && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="mb-8 flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                ย้อนกลับ
              </button>

              <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-slate-900 mb-3">
                  สมัครสมาชิก{userType === 'GENERAL' ? 'ผู้หางาน' : 'ธุรกิจ/ฟรีแลนซ์'}
                </h2>
                <p className="text-xl text-slate-600">กรอกข้อมูลให้ครบถ้วนเพื่อเริ่มใช้งาน</p>
              </div>

              {error && (
                <div className="mb-8 p-5 bg-red-50/80 backdrop-blur border border-red-200 rounded-2xl flex items-center gap-4">
                  <div className="text-2xl">⚠️</div>
                  <p className="text-red-700 font-semibold">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-8 p-5 bg-green-50/80 backdrop-blur border border-green-200 rounded-2xl flex items-center gap-4">
                  <div className="text-2xl">✅</div>
                  <p className="text-green-700 font-semibold">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Switch for Business */}
                {userType === 'BUSINESS' && (
                  <div className="p-2 bg-slate-100 rounded-2xl flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleRoleChange('EMPLOYER')}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${formData.role === 'EMPLOYER' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-600'}`}
                    >
                      <Building2 className="w-5 h-5" /> ผู้ประกอบการ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange('FREELANCER')}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${formData.role === 'FREELANCER' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-600'}`}
                    >
                      <PenTool className="w-5 h-5" /> ฟรีแลนซ์
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputGroup label="ชื่อจริง" name="firstName" value={formData.firstName} onChange={handleChange} icon={<User />} placeholder="ชื่อจริง" />
                  <InputGroup label="นามสกุล" name="lastName" value={formData.lastName} onChange={handleChange} icon={<User />} placeholder="นามสกุล" />
                </div>

                <InputGroup label="อีเมล" type="email" name="email" value={formData.email} onChange={handleChange} icon={<Mail />} placeholder="you@example.com" />
                <InputGroup label="เบอร์โทรศัพท์" type="tel" name="phone" value={formData.phone} onChange={handleChange} icon={<Phone />} placeholder="08x-xxx-xxxx" />
                <InputGroup label="รหัสผ่าน" type="password" name="password" value={formData.password} onChange={handleChange} icon={<Lock />} placeholder="อย่างน้อย 8 ตัวอักษร" />

                <button
                  type="submit"
                  disabled={isLoading || success}
                  className="w-full py-5 px-6 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {isLoading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
                  {!isLoading && !success && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Input Component (Modern Style)
const InputGroup = ({ label, type = "text", name, value, onChange, icon, placeholder }) => (
  <div>
    <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className="w-full pl-12 pr-5 py-4 bg-white/70 backdrop-blur border border-slate-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all text-base"
      />
    </div>
  </div>
);

export default RegisterPage;