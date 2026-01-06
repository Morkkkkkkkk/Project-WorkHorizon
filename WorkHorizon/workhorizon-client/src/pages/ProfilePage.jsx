import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import EducationForm from '../components/EducationForm.jsx';
import ExperienceForm from '../components/ExperienceForm.jsx';
import BasicInfoForm from '../components/BasicInfoForm.jsx';
import SkillsForm from '../components/SkillsForm.jsx';
import ResumeForm from '../components/ResumeForm.jsx';
import ChangePasswordForm from '../components/ChangePasswordForm.jsx';
// อย่าลืม import CompanyForm ถ้าสร้างแล้ว
import { userApi } from '../api/userApi.js';
import { Link } from 'react-router-dom';
import { BACKEND_URL } from '../api/apiClient.js';
import { toast } from 'react-toastify';

/* === ICONS === */
import {
  User, BookOpen, Briefcase, Puzzle, FileText, Lock, LayoutGrid, ShieldCheck, 
  Users, Package, Megaphone, Database, MonitorPlay, Edit, Plus, Trash2, 
  Calendar, ExternalLink, DollarSign, Camera, Wallet, Building, CheckCircle, 
  Star, CreditCard, ArrowUpRight, ArrowDownLeft, Mail, Phone, MapPin, Globe
} from 'lucide-react';

/* === HELPER FUNCTIONS === */
const formatDate = (dateString) => {
  if (!dateString) return 'ปัจจุบัน';
  return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'short' });
};

const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/* === UI COMPONENTS (PREMIUM DESIGN) === */

// 1. Modern Card Container
const SectionCard = ({ title, icon, children, action, className = "" }) => (
  <div className={`bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden mb-8 transition-all duration-300 hover:shadow-lg ${className}`}>
    <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100/50">
          {icon}
        </div>
        {title}
      </h2>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
    <div className="p-8">{children}</div>
  </div>
);

// 2. Timeline Style Item Row
const ItemRow = ({ title, subtitle, date, description, onEdit, onDelete, isDeleting }) => (
  <div className="relative pl-8 pb-8 group last:pb-0">
    {/* Timeline Line */}
    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-100 group-last:bg-transparent"></div>
    <div className="absolute left-[-5px] top-1.5 w-3 h-3 rounded-full bg-blue-100 border-2 border-blue-500 box-content"></div>

    <div className="flex justify-between items-start group-hover:translate-x-1 transition-transform duration-300">
      <div className="flex-1 pr-4">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-blue-600 font-medium text-sm mb-1">{subtitle}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1 mb-2 bg-slate-50 inline-block px-2 py-1 rounded-md">
          <Calendar size={12} /> {date}
        </p>
        {description && <p className="text-slate-600 text-sm leading-relaxed mt-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">{description}</p>}
      </div>
      
      {/* Actions (Visible on Hover) */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
        <button onClick={onEdit} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
        <button onClick={onDelete} disabled={isDeleting} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
      </div>
    </div>
  </div>
);

// 3. Premium Add Button
const AddButton = ({ onClick, label = 'เพิ่มข้อมูล', icon = <Plus size={18} /> }) => (
  <button onClick={onClick} className="w-full mt-2 group relative overflow-hidden rounded-2xl bg-slate-50 p-4 transition-all hover:bg-blue-50 border border-dashed border-slate-300 hover:border-blue-300">
    <div className="flex items-center justify-center gap-2 text-slate-500 font-semibold group-hover:text-blue-600 transition-colors">
      <div className="p-1 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <span>{label}</span>
    </div>
  </button>
);

/* === MAIN COMPONENT === */
const ProfilePage = () => {
  const { isJobSeeker, isAdmin, isFreelancer, isEmployer, refreshAuthUser } = useAuth();
  const { profile, isLoading, error, refreshProfile } = useUserProfile();
  
  const [modalState, setModalState] = useState({ isOpen: false, mode: null, data: null });
  const [isDeleting, setIsDeleting] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // --- Handlers ---
  const openModal = (mode, data = null) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => setModalState({ isOpen: false, mode: null, data: null });
  const getImageUrl = (relativeUrl) => (!relativeUrl || relativeUrl.startsWith('http')) ? relativeUrl : `${BACKEND_URL}${relativeUrl}`;

  const handleSuccess = async () => {
    closeModal();
    const { data } = await userApi.getProfile();
    refreshAuthUser(data);
    refreshProfile();
    toast.success("บันทึกข้อมูลสำเร็จ");
  };

  const handleDelete = async (type, id, name) => {
    if (!window.confirm(`ยืนยันการลบ "${name}"?`)) return;
    setIsDeleting(id);
    try {
      if (type === 'edu') await userApi.deleteEducation(id);
      if (type === 'exp') await userApi.deleteExperience(id);
      if (type === 'resume') await userApi.deleteResume(id);
      await refreshProfile();
      toast.success("ลบข้อมูลสำเร็จ");
    } catch (err) { toast.error("เกิดข้อผิดพลาด"); } 
    finally { setIsDeleting(null); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      await userApi.uploadProfileImage(formData);
      const { data } = await userApi.getProfile();
      refreshAuthUser(data);
      refreshProfile();
      toast.success("อัปเดตรูปโปรไฟล์สำเร็จ");
    } catch (err) { toast.error("อัปโหลดไม่สำเร็จ"); } 
    finally { setIsUploadingImage(false); }
  };

  if (isLoading) return <LoadingSpinner text="กำลังโหลด..." />;
  if (error || !profile) return <div className="flex h-screen items-center justify-center text-slate-500">ไม่สามารถโหลดข้อมูลได้</div>;

  const profileImageUrl = getImageUrl(profile.profileImageUrl);
  const isVerified = profile.company?.isVerified || profile.freelancerProfile?.isVerified;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      
      {/* 1. HERO HEADER (NEW DESIGN) */}
      <div className="relative mb-24">
        {/* Cover Gradient */}
        <div className="h-64 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#F8FAFC] to-transparent"></div>
        </div>

        <div className="container mx-auto max-w-6xl px-4">
          <div className="relative -mt-20 flex flex-col md:flex-row items-end md:items-end gap-6 pb-6">
            
            {/* Profile Image with Ring */}
            <div className="relative group mx-auto md:mx-0">
              <div className="w-40 h-40 rounded-full p-1.5 bg-white shadow-2xl ring-4 ring-white/50 relative overflow-hidden">
                 <img 
                   src={profileImageUrl || `https://ui-avatars.com/api/?name=${profile.firstName}&background=f1f5f9&color=64748b&size=200`} 
                   alt="Profile" 
                   className="w-full h-full rounded-full object-cover bg-slate-100"
                 />
                 {/* Upload Overlay */}
                 <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 backdrop-blur-sm text-white">
                    {isUploadingImage ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div> : <Camera size={24} />}
                    <span className="text-xs mt-1 font-medium">เปลี่ยนรูป</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                 </label>
              </div>
              {isVerified && (
                <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg" title="ยืนยันตัวตนแล้ว">
                  <CheckCircle size={18} fill="white" className="text-blue-500" />
                </div>
              )}
            </div>

            {/* Name & Basic Info */}
            <div className="flex-1 text-center md:text-left mb-2 md:mb-4">
               <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-3">
                 {profile.firstName} {profile.lastName}
                 {/* Role Badge */}
                 <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                    {profile.role.replace('_', ' ')}
                 </span>
               </h1>
               <p className="text-slate-500 mt-2 max-w-2xl text-lg font-medium">
                 {profile.bio || "เพิ่มคำอธิบายตัวตนของคุณเพื่อให้ผู้อื่นรู้จักคุณมากขึ้น"}
               </p>
               
               {/* Contact Info Row */}
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                    <Mail size={14} className="text-blue-500"/> {profile.email}
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                      <Phone size={14} className="text-green-500"/> {profile.phone}
                    </div>
                  )}
                  {profile.company?.address && (
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                      <MapPin size={14} className="text-red-500"/> {profile.company.address}
                    </div>
                  )}
               </div>
            </div>

            {/* Edit Button */}
            <div className="flex-shrink-0 mb-4 md:mb-6">
               <button onClick={() => openModal('edit-info', profile)} className="px-6 py-2.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all flex items-center gap-2">
                 <Edit size={18}/> แก้ไขข้อมูล
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === LEFT COLUMN (Wallet & Menu) === */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 2. WALLET CARD (Fintech Style) - SHOW ONLY IF FREELANCER OR JOBSEEKER */}
          {(isFreelancer || isJobSeeker) && (
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
               {/* Decorative Background */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 group-hover:opacity-30 transition-opacity duration-500"></div>
               
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                     <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                        <Wallet className="text-blue-300" size={24}/>
                     </div>
                     <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/30">Active</span>
                  </div>
                  
                  <p className="text-slate-400 text-sm font-medium mb-1">ยอดเงินคงเหลือ</p>
                  <h2 className="text-4xl font-black tracking-tight mb-8">
                     ฿{formatCurrency(profile.walletBalance)}
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                     <Link to="/wallet" className="flex items-center justify-center gap-2 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                        <ArrowUpRight size={18}/> เติมเงิน
                     </Link>
                     <Link to="/wallet" className="flex items-center justify-center gap-2 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 backdrop-blur-sm transition-colors">
                        <ArrowDownLeft size={18}/> ถอนเงิน
                     </Link>
                  </div>
               </div>
            </div>
          )}

          {/* 3. MENU / SHORTCUTS */}
          {isAdmin && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <ShieldCheck className="text-indigo-500" size={20}/> Admin Tools
               </h3>
               <div className="grid grid-cols-2 gap-3">
                  {[
                    { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutGrid/>, color: "text-blue-600 bg-blue-50" },
                    { to: "/admin/verify", label: "อนุมัติ", icon: <CheckCircle/>, color: "text-green-600 bg-green-50" },
                    { to: "/admin/users", label: "ผู้ใช้", icon: <Users/>, color: "text-purple-600 bg-purple-50" },
                    { to: "/admin/jobs", label: "งาน", icon: <Package/>, color: "text-orange-600 bg-orange-50" },
                  ].map((item, idx) => (
                    <Link key={idx} to={item.to} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl hover:scale-105 transition-transform ${item.color}`}>
                       <div className="text-2xl">{item.icon}</div>
                       <span className="text-xs font-bold">{item.label}</span>
                    </Link>
                  ))}
                  <Link to="/admin/dashboard" className="col-span-2 p-3 text-center text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors">
                     ดูเมนูทั้งหมด →
                  </Link>
               </div>
            </div>
          )}

          {/* Security Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                   <Lock size={20}/>
                </div>
                <div className="flex-1">
                   <h4 className="font-bold text-slate-800">ความปลอดภัย</h4>
                   <p className="text-xs text-slate-500">จัดการรหัสผ่านของคุณ</p>
                </div>
             </div>
             <button onClick={() => openModal('change-password')} className="w-full mt-4 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors">
                เปลี่ยนรหัสผ่าน
             </button>
          </div>

        </div>

        {/* === RIGHT COLUMN (Content) === */}
        <div className="lg:col-span-8 space-y-8">

          {/* 4. EMPLOYER SECTION */}
          {isEmployer && (
            <SectionCard title="ข้อมูลบริษัท" icon={<Building size={20}/>} 
              action={profile.company && (
                <button onClick={() => openModal('edit-company', profile.company)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"><Edit size={18}/></button>
              )}
            >
              {profile.company ? (
                <div className="flex gap-6 items-start">
                   <img src={getImageUrl(profile.company.logoUrl) || "https://placehold.co/100x100?text=Logo"} className="w-24 h-24 rounded-2xl border border-slate-100 object-cover shadow-sm" alt="Company Logo"/>
                   <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        {profile.company.companyName}
                        {profile.company.isVerified && <CheckCircle size={18} className="text-blue-500" title="Verified Company"/>}
                      </h3>
                      <p className="text-slate-600 mt-2 text-sm leading-relaxed line-clamp-3">{profile.company.description || "ยังไม่มีคำอธิบายบริษัท"}</p>
                      <div className="flex gap-4 mt-4">
                         {profile.company.website && <a href={profile.company.website} target="_blank" className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-100"><Globe size={14}/> Website</a>}
                         <Link to="/employer/jobs/create" className="text-xs font-bold text-white bg-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-700 shadow-md shadow-slate-200"><Plus size={14}/> ลงประกาศงาน</Link>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-300"><Building size={32}/></div>
                   <p className="text-slate-500 mb-4 font-medium">เพิ่มความน่าเชื่อถือด้วยข้อมูลบริษัท</p>
                   <Link to="/employer/register-company" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">ลงทะเบียนบริษัท</Link>
                </div>
              )}
            </SectionCard>
          )}

          {/* 5. FREELANCER SECTION */}
          {isFreelancer && (
            <SectionCard title="โปรไฟล์ฟรีแลนซ์" icon={<MonitorPlay size={20}/>} className="border-t-4 border-t-purple-500">
              {profile.freelancerProfile ? (
                <>
                  <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="flex-1 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                       <h3 className="text-lg font-bold text-purple-900 mb-1">{profile.freelancerProfile.professionalTitle || "ตำแหน่งงาน"}</h3>
                       <div className="flex items-center gap-2 text-2xl font-black text-purple-700 my-2">
                          <span>฿{Number(profile.freelancerProfile.hourlyRate).toLocaleString()}</span>
                          <span className="text-sm font-medium text-purple-400">/ ชั่วโมง</span>
                       </div>
                       <p className="text-purple-800/70 text-sm line-clamp-2">{profile.freelancerProfile.bio}</p>
                    </div>
                    
                    <div className="w-full md:w-48 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                       <div className="text-4xl font-black text-yellow-400 flex items-center gap-1 mb-1">
                          {profile.freelancerProfile.rating || "0.0"} <Star size={24} fill="currentColor"/>
                       </div>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rating Score</p>
                       <Link to={`/freelancers/${profile.id}`} target="_blank" className="mt-3 text-xs text-blue-600 font-bold hover:underline">ดูหน้า Public</Link>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <Link to="/freelancer/services" className="p-4 rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all flex items-center gap-3 group">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors"><Package/></div>
                        <div className="text-left"><h4 className="font-bold text-slate-800">จัดการงานบริการ</h4><p className="text-xs text-slate-500">เพิ่ม/แก้ไขงานที่คุณรับทำ</p></div>
                     </Link>
                     <Link to="/freelancer/profile" className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex items-center gap-3 group">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><Edit/></div>
                        <div className="text-left"><h4 className="font-bold text-slate-800">แก้ไขข้อมูลรับงาน</h4><p className="text-xs text-slate-500">เรทราคา, ประสบการณ์</p></div>
                     </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                   <p className="text-slate-500 mb-4">เริ่มรับงานฟรีแลนซ์ง่ายๆ เพียงสร้างโปรไฟล์</p>
                   <Link to="/freelancer/profile" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform">สร้างโปรไฟล์ฟรีแลนซ์</Link>
                </div>
              )}
            </SectionCard>
          )}

          {/* 6. JOB SEEKER SECTIONS */}
          {isJobSeeker && (
            <>
              <SectionCard title="ประวัติการศึกษา" icon={<BookOpen size={20}/>}>
                <div className="space-y-6">
                  {profile.educations?.map(edu => (
                    <ItemRow key={edu.id} title={edu.institute} subtitle={`${edu.degree} • ${edu.fieldOfStudy}`} date={`${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`} onEdit={() => openModal('edit-edu', edu)} onDelete={() => handleDelete('edu', edu.id, edu.institute)} isDeleting={isDeleting === edu.id} />
                  ))}
                </div>
                <AddButton onClick={() => openModal('add-edu')} label="เพิ่มประวัติการศึกษา" />
              </SectionCard>

              <SectionCard title="ประสบการณ์ทำงาน" icon={<Briefcase size={20}/>}>
                <div className="space-y-6">
                  {profile.experiences?.map(exp => (
                    <ItemRow key={exp.id} title={exp.title} subtitle={exp.company} date={`${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`} description={exp.description} onEdit={() => openModal('edit-exp', exp)} onDelete={() => handleDelete('exp', exp.id, exp.title)} isDeleting={isDeleting === exp.id} />
                  ))}
                </div>
                <AddButton onClick={() => openModal('add-exp')} label="เพิ่มประสบการณ์ทำงาน" />
              </SectionCard>

              <SectionCard title="ทักษะความสามารถ" icon={<Puzzle size={20}/>} action={<button onClick={() => openModal('edit-skills', profile.skills)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Edit size={18}/></button>}>
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.length > 0 ? profile.skills.map(skill => (
                    <span key={skill.id} className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold border border-slate-100 shadow-sm hover:border-blue-200 hover:text-blue-600 transition-colors cursor-default">
                      {skill.name}
                    </span>
                  )) : <p className="text-slate-400 text-sm">ยังไม่มีข้อมูลทักษะ</p>}
                </div>
              </SectionCard>

              <SectionCard title="ไฟล์เรซูเม่" icon={<FileText size={20}/>}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.resumes?.map(resume => (
                    <div key={resume.id} className="group relative p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-white hover:shadow-md transition-all">
                       <div className="flex items-start gap-3">
                          <div className="p-3 bg-red-100 text-red-500 rounded-xl">
                             <FileText size={24}/>
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-slate-800 truncate" title={resume.filename}>{resume.filename}</h4>
                             <p className="text-xs text-slate-400 mt-1">{formatDate(resume.uploadedAt)}</p>
                          </div>
                       </div>
                       <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={getImageUrl(resume.url)} target="_blank" rel="noreferrer" className="p-1.5 bg-white text-blue-600 rounded-lg shadow-sm border border-slate-100 hover:bg-blue-50"><ExternalLink size={16}/></a>
                          <button onClick={() => handleDelete('resume', resume.id, resume.filename)} disabled={isDeleting === resume.id} className="p-1.5 bg-white text-red-600 rounded-lg shadow-sm border border-slate-100 hover:bg-red-50"><Trash2 size={16}/></button>
                       </div>
                    </div>
                  ))}
                </div>
                <AddButton onClick={() => openModal('add-resume')} label="อัปโหลดเรซูเม่" icon={<Plus size={18}/>} />
              </SectionCard>
            </>
          )}

        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={modalState.isOpen} onClose={closeModal} title={
        modalState.mode === 'edit-info' ? "แก้ไขข้อมูลส่วนตัว" :
        modalState.mode === 'add-edu' ? "เพิ่มประวัติการศึกษา" :
        modalState.mode === 'edit-edu' ? "แก้ไขประวัติการศึกษา" :
        modalState.mode === 'add-exp' ? "เพิ่มประสบการณ์ทำงาน" :
        modalState.mode === 'edit-exp' ? "แก้ไขประสบการณ์ทำงาน" :
        modalState.mode === 'edit-skills' ? "แก้ไขทักษะ" :
        modalState.mode === 'add-resume' ? "อัปโหลดเรซูเม่" :
        modalState.mode === 'change-password' ? "เปลี่ยนรหัสผ่าน" :
        modalState.mode === 'edit-company' ? "แก้ไขข้อมูลบริษัท" : ""
      }>
        {modalState.mode === 'edit-info' && <BasicInfoForm onClose={closeModal} onSuccess={handleSuccess} initialData={profile} />}
        {(modalState.mode === 'add-edu' || modalState.mode === 'edit-edu') && <EducationForm onClose={closeModal} onSuccess={handleSuccess} initialData={modalState.data} />}
        {(modalState.mode === 'add-exp' || modalState.mode === 'edit-exp') && <ExperienceForm onClose={closeModal} onSuccess={handleSuccess} initialData={modalState.data} />}
        {modalState.mode === 'edit-skills' && <SkillsForm onClose={closeModal} onSuccess={handleSuccess} initialData={modalState.data} />}
        {modalState.mode === 'add-resume' && <ResumeForm onClose={closeModal} onSuccess={handleSuccess} />}
        {modalState.mode === 'change-password' && <ChangePasswordForm onClose={closeModal} onSuccess={closeModal} />}
        {modalState.mode === 'edit-company' && <div className="p-8 text-center text-slate-500">กรุณาสร้าง Component CompanyForm ก่อนใช้งาน</div>}
      </Modal>
    </div>
  );
};

export default ProfilePage;