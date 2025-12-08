import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Briefcase, Building2, PenTool, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // State for Multi-step flow
  const [step, setStep] = useState(1); // 1: Select Type, 2: Fill Form
  const [userType, setUserType] = useState(null); // 'GENERAL' (Job Seeker) or 'BUSINESS' (Employer/Freelancer)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'JOB_SEEKER', // Default, will be updated based on selection
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
    // Set default role based on type
    if (type === 'GENERAL') {
      setFormData(prev => ({ ...prev, role: 'JOB_SEEKER' }));
    } else {
      setFormData(prev => ({ ...prev, role: 'EMPLOYER' })); // Default to Employer for Business path
    }
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
      setSuccess('สมัครสมาชิกสำเร็จ! กำลังนำคุณไปหน้าเข้าสู่ระบบ...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.error || 'การสมัครล้มเหลว (อีเมลอาจซ้ำ หรือข้อมูลไม่ครบ)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
      {/* --- Left Side: Hero Section --- */}
      <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-orange-600 to-red-600 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight mb-10 text-white hover:text-blue-200 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Briefcase className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span>WorkHorizon</span>
          </Link>

          <h1 className="text-4xl font-bold leading-tight mb-6">
            แพลตฟอร์มระดับองค์กร<br />เพื่อการจ้างงานที่เหนือกว่า
          </h1>
          <p className="text-slate-300 text-lg mb-8">
            เชื่อมต่อบุคลากรคุณภาพและธุรกิจชั้นนำ ด้วยระบบที่ทันสมัยและเชื่อถือได้
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-400">
          © 2024 WorkHorizon Enterprise.
        </div>
      </div>

      {/* --- Right Side: Form Section --- */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-4 sm:p-8 md:p-12">
        <div className="w-full max-w-xl">

          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-slate-800">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Briefcase size={24} strokeWidth={2.5} />
              </div>
              <span className="text-slate-900">WorkHorizon</span>
            </Link>
          </div>

          {/* Step 1: Select User Type */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">เลือกประเภทบัญชีของคุณ</h2>
              <p className="text-slate-500 mb-8">กรุณาเลือกประเภทการใช้งานเพื่อเริ่มต้น</p>

              <div className="grid grid-cols-1 gap-4">
                {/* General User Card */}
                <button
                  onClick={() => handleTypeSelect('GENERAL')}
                  className="group relative p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all text-left flex items-start gap-5"
                >
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <User size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">ผู้ใช้งานทั่วไป (Job Seeker)</h3>
                    <p className="text-slate-500 mt-1">สำหรับผู้ที่ต้องการฝากประวัติ ค้นหางาน และสมัครงานกับบริษัทชั้นนำ</p>
                  </div>
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                    <ArrowRight size={24} />
                  </div>
                </button>

                {/* Business User Card */}
                <button
                  onClick={() => handleTypeSelect('BUSINESS')}
                  className="group relative p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-orange-500 hover:shadow-xl transition-all text-left flex items-start gap-5"
                >
                  <div className="p-4 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Building2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-700 transition-colors">ผู้ประกอบการ / ฟรีแลนซ์</h3>
                    <p className="text-slate-500 mt-1">สำหรับบริษัทที่ต้องการประกาศงาน หรือฟรีแลนซ์ที่ต้องการรับงาน</p>
                  </div>
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500">
                    <ArrowRight size={24} />
                  </div>
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-slate-600">
                  มีบัญชีผู้ใช้แล้ว?{' '}
                  <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                    เข้าสู่ระบบ
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Registration Form */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
              >
                <ChevronLeft size={16} /> ย้อนกลับ
              </button>

              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {userType === 'GENERAL' ? 'สมัครสมาชิกผู้หางาน' : 'สมัครสมาชิกธุรกิจ'}
              </h2>
              <p className="text-slate-500 mb-6">กรอกข้อมูลส่วนตัวเพื่อสร้างบัญชี</p>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                  <div className="text-red-500 mt-0.5">⚠️</div>
                  <div className="text-sm text-red-700 font-medium">{error}</div>
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 flex items-start gap-3">
                  <div className="text-green-500 mt-0.5">✅</div>
                  <div className="text-sm text-green-700 font-medium">{success}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Role Selection for Business Users */}
                {userType === 'BUSINESS' && (
                  <div className="p-1 bg-slate-100 rounded-xl flex mb-4">
                    <button
                      type="button"
                      onClick={() => handleRoleChange('EMPLOYER')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${formData.role === 'EMPLOYER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      <Building2 size={16} /> ผู้ประกอบการ (Employer)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange('FREELANCER')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${formData.role === 'FREELANCER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      <PenTool size={16} /> ฟรีแลนซ์ (Freelancer)
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputGroup
                    label="ชื่อจริง"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    icon={<User className="w-4 h-4" />}
                    placeholder="ระบุชื่อจริง"
                  />
                  <InputGroup
                    label="นามสกุล"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    icon={<User className="w-4 h-4" />}
                    placeholder="ระบุนามสกุล"
                  />
                </div>

                <InputGroup
                  label="อีเมล"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={<Mail className="w-4 h-4" />}
                  placeholder="name@example.com"
                />
                <InputGroup
                  label="เบอร์โทรศัพท์"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  icon={<Phone className="w-4 h-4" />}
                  placeholder="08x-xxx-xxxx"
                />
                <InputGroup
                  label="รหัสผ่าน"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  icon={<Lock className="w-4 h-4" />}
                  placeholder="กำหนดรหัสผ่านอย่างน้อย 6 ตัว"
                />

                <button
                  type="submit"
                  disabled={isLoading || success}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all transform active:scale-[0.98] ${userType === 'GENERAL'
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                      : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'
                    } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'กำลังสร้างบัญชี...' : 'ลงทะเบียน'}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// Input Component
const InputGroup = ({ label, type = "text", name, value, onChange, icon, placeholder }) => (
  <div>
    <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white hover:border-slate-300"
      />
    </div>
  </div>
);

export default RegisterPage;