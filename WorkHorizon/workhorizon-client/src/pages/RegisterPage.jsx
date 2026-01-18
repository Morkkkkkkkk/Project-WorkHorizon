import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail, Lock, User, Phone, Briefcase,
  Building2, PenTool, ArrowRight,
  ChevronLeft, Sparkles, CheckCircle2
} from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'JOB_SEEKER',
  });

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleTypeSelect = (type) => {
    setUserType(type);
    setFormData(prev => ({
      ...prev,
      role: type === 'GENERAL' ? 'JOB_SEEKER' : 'EMPLOYER'
    }));
    setStep(2);
  };

  const handleRoleChange = (role) =>
    setFormData(prev => ({ ...prev, role }));

  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (pwd.length < 8) return 'weak';
    if (/[A-Z]/.test(pwd) && /\d/.test(pwd)) return 'strong';
    return 'medium';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await register(formData);
      setSuccess('สมัครสมาชิกสำเร็จ! กำลังพาไปหน้าเข้าสู่ระบบ');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.error || 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-orange-50">

      {/* LEFT HERO */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-orange-500 to-red-600 text-white p-14">
        <div className="flex flex-col justify-between w-full">
          <div>
            <Link to="/" className="flex items-center gap-3 text-3xl font-black mb-12">
              <Briefcase className="w-10 h-10" />
              WorkHorizon
            </Link>

            <h1 className="text-5xl font-black leading-tight mb-6">
              เริ่มต้นเส้นทาง <br />
              <span className="text-orange-200">อาชีพของคุณ</span>
            </h1>

            <p className="text-lg text-orange-100 mb-10 max-w-md">
              เชื่อมต่อคนทำงาน ธุรกิจ และโอกาสใหม่ ๆ ด้วยแพลตฟอร์มเดียว
            </p>

            <div className="space-y-5">
              {[
                'ค้นหางานคุณภาพ',
                'ประกาศงานฟรี',
                'จัดการโปรเจกต์ครบวงจร'
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <CheckCircle2 />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-orange-200">
            © 2025 WorkHorizon
          </p>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">

          {/* STEP INDICATOR */}
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2].map(i => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  step === i ? 'bg-orange-500 scale-125' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-4xl font-black mb-4">คุณคือใคร?</h2>
              <p className="text-slate-600 mb-10">
                เลือกประเภทบัญชีที่ใช่สำหรับคุณ
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <AccountCard
                  icon={<User />}
                  title="ผู้หางาน"
                  desc="ค้นหางาน สมัครงาน"
                  color="blue"
                  onClick={() => handleTypeSelect('GENERAL')}
                />
                <AccountCard
                  icon={<Building2 />}
                  title="ธุรกิจ / ฟรีแลนซ์"
                  desc="ประกาศงาน หาโปรเจกต์"
                  color="orange"
                  onClick={() => handleTypeSelect('BUSINESS')}
                />
              </div>

              <p className="mt-10 text-slate-600">
                มีบัญชีแล้ว?{' '}
                <Link to="/login" className="text-orange-600 font-bold underline">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8">

              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-slate-600 hover:text-orange-600 mb-6"
              >
                <ChevronLeft /> ย้อนกลับ
              </button>

              <h2 className="text-3xl font-black mb-6 text-center">
                สมัครสมาชิก
              </h2>

              {error && <Alert type="error" text={error} />}
              {success && <Alert type="success" text={success} />}

              {userType === 'BUSINESS' && (
                <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl mb-6">
                  <RoleButton
                    active={formData.role === 'EMPLOYER'}
                    onClick={() => handleRoleChange('EMPLOYER')}
                    icon={<Building2 />}
                    text="ผู้ประกอบการ"
                  />
                  <RoleButton
                    active={formData.role === 'FREELANCER'}
                    onClick={() => handleRoleChange('FREELANCER')}
                    icon={<PenTool />}
                    text="ฟรีแลนซ์"
                  />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Input label="ชื่อจริง" name="firstName" onChange={handleChange} />
                  <Input label="นามสกุล" name="lastName" onChange={handleChange} />
                </div>

                <Input label="อีเมล" type="email" name="email" icon={<Mail />} onChange={handleChange} />
                <Input label="เบอร์โทร" name="phone" icon={<Phone />} onChange={handleChange} />
                <Input label="รหัสผ่าน" type="password" name="password" icon={<Lock />} onChange={handleChange} />

                {/* PASSWORD STRENGTH */}
                {formData.password && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`h-2 w-24 rounded-full ${
                      getPasswordStrength() === 'weak' ? 'bg-red-400'
                        : getPasswordStrength() === 'medium' ? 'bg-yellow-400'
                          : 'bg-green-500'
                    }`} />
                    <span className="text-slate-600">
                      {getPasswordStrength() === 'weak' && 'รหัสผ่านอ่อน'}
                      {getPasswordStrength() === 'medium' && 'รหัสผ่านปานกลาง'}
                      {getPasswordStrength() === 'strong' && 'รหัสผ่านแข็งแรง'}
                    </span>
                  </div>
                )}

                <button
                  disabled={isLoading || success}
                  className="w-full py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl flex justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  {isLoading ? 'กำลังสร้างบัญชี...' :
                    userType === 'GENERAL'
                      ? 'เริ่มค้นหางานฟรี'
                      : formData.role === 'EMPLOYER'
                        ? 'เริ่มประกาศงาน'
                        : 'เริ่มรับงานฟรีแลนซ์'}
                  <ArrowRight />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- COMPONENTS ---------- */

const Input = ({ label, icon, ...props }) => (
  <div>
    <label className="text-sm font-bold text-slate-700 mb-2 block">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input
        {...props}
        required
        className="w-full pl-12 pr-5 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition"
      />
    </div>
  </div>
);

const AccountCard = ({ icon, title, desc, onClick }) => (
  <button
    onClick={onClick}
    className="p-8 bg-white/80 border rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition text-center"
  >
    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-xl font-black mb-2">{title}</h3>
    <p className="text-slate-600">{desc}</p>
  </button>
);

const RoleButton = ({ active, icon, text, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 py-4 rounded-xl font-bold flex justify-center gap-2 ${
      active ? 'bg-white shadow-lg' : 'text-slate-600'
    }`}
  >
    {icon} {text}
  </button>
);

const Alert = ({ type, text }) => (
  <div className={`mb-6 p-4 rounded-2xl ${
    type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
  }`}>
    {text}
  </div>
);

export default RegisterPage;
