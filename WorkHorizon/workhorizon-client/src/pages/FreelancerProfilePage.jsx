import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { freelancerApi } from '../api/freelancerApi';
import { userApi } from '../api/userApi';
import { BACKEND_URL } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import BasicInfoForm from '../components/BasicInfoForm';
import SkillsForm from '../components/SkillsForm';
import ExperienceForm from '../components/ExperienceForm';
import EducationForm from '../components/EducationForm';
import ResumeForm from '../components/ResumeForm';
import {
  User, DollarSign, Briefcase, Link as IconLink,
  UploadCloud, Award, Edit, ExternalLink, MapPin, ShieldCheck,
  GraduationCap, FileText, ChevronRight, Plus, Trash2, Calendar,
  Camera, Mail, Phone, CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const FreelancerProfilePage = () => {
  const { refreshAuthUser } = useAuth();
  const { profile, isLoading, refreshProfile } = useUserProfile();

  const [activeTab, setActiveTab] = useState('overview');
  const [modalState, setModalState] = useState({ isOpen: false, mode: null, data: null });
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  // Form State for Freelancer Specifics
  const [freelancerForm, setFreelancerForm] = useState({
    professionalTitle: '',
    bio: '',
    hourlyRate: '',
    yearsOfExperience: '',
    portfolioUrl: '',
  });

  useEffect(() => {
    if (profile?.freelancerProfile) {
      const fp = profile.freelancerProfile;
      setFreelancerForm({
        professionalTitle: fp.professionalTitle || '',
        bio: fp.bio || '',
        hourlyRate: fp.hourlyRate || '',
        yearsOfExperience: fp.yearsOfExperience || '',
        portfolioUrl: fp.portfolioUrl || '',
      });
    }
  }, [profile]);

  const handleFreelancerUpdate = async (e) => {
    e.preventDefault();
    try {
      await freelancerApi.updateMyProfile(freelancerForm);
      refreshProfile();
      toast.success("บันทึกข้อมูลเรียบร้อย");
    } catch (err) {
      toast.error("บันทึกไม่สำเร็จ: " + err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('profileImage', file);
      await freelancerApi.uploadProfilePicture(fd);
      refreshProfile();
      toast.success("อัปโหลดรูปโปรไฟล์เรียบร้อย");
    } catch (err) {
      toast.error("อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteExperience = async (id) => {
    if (!window.confirm("คุณต้องการลบข้อมูลประสบการณ์นี้ใช่หรือไม่?")) return;
    setIsDeleting(id);
    try {
      await userApi.deleteExperience(id);
      refreshProfile();
      toast.success("ลบข้อมูลประสบการณ์เรียบร้อย");
    } catch (err) {
      toast.error("ลบไม่สำเร็จ");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteEducation = async (id) => {
    if (!window.confirm("คุณต้องการลบข้อมูลการศึกษานี้ใช่หรือไม่?")) return;
    setIsDeleting(id);
    try {
      await userApi.deleteEducation(id);
      refreshProfile();
      toast.success("ลบข้อมูลการศึกษาเรียบร้อย");
    } catch (err) {
      toast.error("ลบไม่สำเร็จ");
    } finally {
      setIsDeleting(null);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
  };

  if (isLoading || !profile) return <LoadingSpinner text="กำลังโหลดข้อมูล..." />;

  const fp = profile.freelancerProfile || {};
  const displayImage = getImageUrl(fp.profileImageUrl) ||
    `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=0D8ABC&color=fff&size=150`;

  const tabs = [
    { id: 'overview', label: 'ข้อมูลส่วนตัว', icon: User, desc: 'ข้อมูลติดต่อพื้นฐาน' },
    { id: 'freelancer', label: 'ข้อมูลฟรีแลนซ์', icon: Briefcase, desc: 'เรทราคาและตำแหน่ง' },
    { id: 'experience', label: 'ประสบการณ์', icon: Award, desc: 'ประวัติการทำงาน' },
    { id: 'education', label: 'การศึกษา', icon: GraduationCap, desc: 'วุฒิการศึกษา' },
    { id: 'skills', label: 'ทักษะ', icon: ShieldCheck, desc: 'ความเชี่ยวชาญ' },
    { id: 'resume', label: 'เรซูเม่', icon: FileText, desc: 'ไฟล์เอกสาร' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="relative mb-24">
        {/* Cover Gradient */}
        <div className="h-60 w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 overflow-hidden relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
           <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50/50 to-transparent"></div>
        </div>

        <div className="container mx-auto max-w-6xl px-4">
          <div className="relative -mt-20 flex flex-col md:flex-row items-end gap-6">
            
            {/* Profile Image with Hover Upload */}
            <div className="relative group mx-auto md:mx-0">
              <div className="w-40 h-40 rounded-full p-1.5 bg-white shadow-xl ring-1 ring-slate-100 relative overflow-hidden">
                 <img 
                   src={displayImage} 
                   alt="Profile" 
                   className="w-full h-full rounded-full object-cover"
                 />
                 {/* Upload Overlay */}
                 <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 backdrop-blur-sm text-white">
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Camera size={24} className="mb-1" />
                        <span className="text-xs font-medium">เปลี่ยนรูป</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                 </label>
              </div>
              {/* Status Badge (Example) */}
              <div className="absolute bottom-3 right-3 bg-green-500 w-5 h-5 rounded-full border-4 border-white shadow-sm" title="Online"></div>
            </div>

            {/* Name & Basic Info */}
            <div className="flex-1 text-center md:text-left pb-4">
               <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
                 {profile.firstName} {profile.lastName}
               </h1>
               <p className="text-lg text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 mb-4">
                 {freelancerForm.professionalTitle || "ระบุตำแหน่งงานของคุณ (เช่น Graphic Designer)"}
               </p>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <a href={`/freelancers/${profile.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm">
                    <ExternalLink size={16}/> ดูหน้าสาธารณะ
                  </a>
                  <a href="/freelancer/services" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all">
                    <Briefcase size={16}/> จัดการงานบริการ
                  </a>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* --- SIDEBAR NAVIGATION --- */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">เมนูจัดการ</h3>
            </div>
            <div className="p-2 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'}`}>
                    <tab.icon size={18} />
                  </div>
                  <div>
                    <span className="block font-semibold text-sm">{tab.label}</span>
                    <span className="block text-[10px] opacity-70 font-normal">{tab.desc}</span>
                  </div>
                  {activeTab === tab.id && <ChevronRight size={16} className="ml-auto text-blue-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="lg:col-span-9 space-y-6">

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">ข้อมูลส่วนตัว</h2>
                  <p className="text-slate-500 text-sm">ข้อมูลพื้นฐานสำหรับการติดต่อ</p>
                </div>
                <button onClick={() => setModalState({ isOpen: true, mode: 'basic' })} className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all shadow-sm">
                  <Edit size={18} />
                </button>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><User size={20}/></div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ชื่อ-นามสกุล</label>
                        <p className="text-base font-semibold text-slate-800 mt-0.5">{profile.firstName} {profile.lastName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Mail size={20}/></div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">อีเมล</label>
                        <p className="text-base font-semibold text-slate-800 mt-0.5">{profile.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Phone size={20}/></div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">เบอร์โทรศัพท์</label>
                        <p className="text-base font-semibold text-slate-800 mt-0.5">{profile.phone || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><ShieldCheck size={20}/></div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">สถานะบัญชี</label>
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            <CheckCircle size={12} /> Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FREELANCER INFO */}
          {activeTab === 'freelancer' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 bg-gradient-to-r from-white to-slate-50">
                <h2 className="text-xl font-bold text-slate-800">ข้อมูลการทำงาน</h2>
                <p className="text-slate-500 text-sm">ตั้งค่าข้อมูลวิชาชีพของคุณเพื่อให้ลูกค้าตัดสินใจจ้างงาน</p>
              </div>

              <div className="p-8">
                <form onSubmit={handleFreelancerUpdate} className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2">ตำแหน่งงานที่เชี่ยวชาญ</label>
                    <input
                      type="text"
                      value={freelancerForm.professionalTitle}
                      onChange={(e) => setFreelancerForm({ ...freelancerForm, professionalTitle: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                      placeholder="เช่น Senior Graphic Designer"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">ค่าจ้างรายชั่วโมง (บาท)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><DollarSign size={18}/></div>
                        <input
                          type="number"
                          value={freelancerForm.hourlyRate}
                          onChange={(e) => setFreelancerForm({ ...freelancerForm, hourlyRate: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">ประสบการณ์ (ปี)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Award size={18}/></div>
                        <input
                          type="number"
                          value={freelancerForm.yearsOfExperience}
                          onChange={(e) => setFreelancerForm({ ...freelancerForm, yearsOfExperience: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Bio (แนะนำตัว & ประสบการณ์)</label>
                    <textarea
                      rows={5}
                      value={freelancerForm.bio}
                      onChange={(e) => setFreelancerForm({ ...freelancerForm, bio: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400 resize-none"
                      placeholder="เขียนเกี่ยวกับตัวคุณ จุดแข็ง และสิ่งที่คุณทำได้..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Portfolio Link</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><IconLink size={18}/></div>
                      <input
                        type="url"
                        value={freelancerForm.portfolioUrl}
                        onChange={(e) => setFreelancerForm({ ...freelancerForm, portfolioUrl: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 text-sm font-mono"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end border-t border-slate-50">
                    <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5">
                      บันทึกการเปลี่ยนแปลง
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB: EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">ประสบการณ์ทำงาน</h2>
                  <p className="text-slate-500 text-sm">ประวัติการทำงานที่ผ่านมา</p>
                </div>
                <button onClick={() => setModalState({ isOpen: true, mode: 'experience' })} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
                  <Plus size={18} /> เพิ่มใหม่
                </button>
              </div>

              <div className="p-8">
                {profile.experiences?.length > 0 ? (
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {profile.experiences.map((exp, index) => (
                      <div key={exp.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Timeline Icon */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          <Briefcase size={18}/>
                        </div>
                        {/* Content Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-2">
                             <div>
                                <h3 className="font-bold text-lg text-slate-800">{exp.title}</h3>
                                <div className="text-blue-600 font-medium text-sm">{exp.company}</div>
                             </div>
                             <div className="flex gap-1">
                                <button onClick={() => setModalState({ isOpen: true, mode: 'experience', data: exp })} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                                <button onClick={() => handleDeleteExperience(exp.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                             </div>
                          </div>
                          <time className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-slate-50 text-slate-500 border border-slate-100">
                            <Calendar size={12}/> 
                            {new Date(exp.startDate).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })} - 
                            {exp.endDate ? new Date(exp.endDate).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }) : 'ปัจจุบัน'}
                          </time>
                          {exp.description && <p className="text-slate-600 text-sm leading-relaxed mt-2">{exp.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                      <Award size={32} />
                    </div>
                    <h3 className="text-slate-900 font-bold mb-1">ยังไม่มีข้อมูลประสบการณ์</h3>
                    <p className="text-slate-500 text-sm mb-6">เพิ่มประวัติการทำงานเพื่อเพิ่มความน่าเชื่อถือ</p>
                    <button onClick={() => setModalState({ isOpen: true, mode: 'experience' })} className="text-blue-600 font-bold hover:underline">
                      + เพิ่มประสบการณ์
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: EDUCATION */}
          {activeTab === 'education' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">ประวัติการศึกษา</h2>
                  <p className="text-slate-500 text-sm">วุฒิการศึกษาและสถาบัน</p>
                </div>
                <button onClick={() => setModalState({ isOpen: true, mode: 'education' })} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
                  <Plus size={18} /> เพิ่มใหม่
                </button>
              </div>

              <div className="p-8 grid gap-4">
                {profile.educations?.length > 0 ? (
                  profile.educations.map(edu => (
                    <div key={edu.id} className="flex gap-4 p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white group">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <GraduationCap size={24}/>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-slate-800">{edu.institute}</h3>
                            <p className="text-slate-600 font-medium">{edu.degree} • {edu.fieldOfStudy}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setModalState({ isOpen: true, mode: 'education', data: edu })} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                            <button onClick={() => handleDeleteEducation(edu.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mt-2">
                          <Calendar size={14} />
                          {new Date(edu.startDate).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })} - 
                          {edu.endDate ? new Date(edu.endDate).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }) : 'ปัจจุบัน'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                    <GraduationCap size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">ยังไม่มีข้อมูลการศึกษา</p>
                    <button onClick={() => setModalState({ isOpen: true, mode: 'education' })} className="text-blue-600 font-bold mt-2 hover:underline">
                      + เพิ่มการศึกษา
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SKILLS */}
          {activeTab === 'skills' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">ทักษะความเชี่ยวชาญ</h2>
                  <p className="text-slate-500 text-sm">ทักษะที่คุณมีเพื่อดึงดูดลูกค้า</p>
                </div>
                <button onClick={() => setModalState({ isOpen: true, mode: 'skills' })} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all">
                  <Edit size={18} /> แก้ไขทักษะ
                </button>
              </div>

              <div className="p-8">
                {profile.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {profile.skills.map(skill => (
                      <span key={skill.id} className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm cursor-default hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <ShieldCheck size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">ยังไม่มีข้อมูลทักษะ</p>
                    <button onClick={() => setModalState({ isOpen: true, mode: 'skills' })} className="text-blue-600 font-bold mt-2 hover:underline">
                      + เพิ่มทักษะ
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: RESUME */}
          {activeTab === 'resume' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">เรซูเม่ / CV</h2>
                  <p className="text-slate-500 text-sm">ไฟล์เอกสารเพื่อให้ลูกค้าดาวน์โหลด</p>
                </div>
                <button onClick={() => setModalState({ isOpen: true, mode: 'resume' })} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
                  <UploadCloud size={18} /> อัปโหลดใหม่
                </button>
              </div>

              <div className="p-8">
                {profile.resumeUrl ? (
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-red-100 text-red-600 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                        <FileText size={32} />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-slate-800 group-hover:text-blue-700 transition-colors">ไฟล์เรซูเม่ปัจจุบัน</p>
                        <p className="text-sm text-slate-500 mt-1">พร้อมใช้งานสำหรับการสมัครงาน</p>
                      </div>
                    </div>
                    <a href={getImageUrl(profile.resumeUrl)} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-800 hover:text-white transition-all shadow-sm">
                      ดาวน์โหลด
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">ยังไม่มีไฟล์เรซูเม่</p>
                    <button onClick={() => setModalState({ isOpen: true, mode: 'resume' })} className="text-blue-600 font-bold mt-2 hover:underline">
                      + อัปโหลดเรซูเม่
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: null, data: null })}
        title={
          modalState.mode === 'basic' ? "แก้ไขข้อมูลส่วนตัว" :
          modalState.mode === 'skills' ? "จัดการทักษะ" :
          modalState.mode === 'experience' ? (modalState.data ? "แก้ไขประสบการณ์" : "เพิ่มประสบการณ์") :
          modalState.mode === 'education' ? (modalState.data ? "แก้ไขประวัติการศึกษา" : "เพิ่มประวัติการศึกษา") :
          "อัปโหลดเรซูเม่"
        }
      >
        {modalState.mode === 'basic' && (
          <BasicInfoForm
            initialData={profile}
            onClose={() => setModalState({ isOpen: false, mode: null })}
            onSuccess={() => {
              refreshProfile();
              refreshAuthUser(profile);
              setModalState({ isOpen: false, mode: null });
            }}
          />
        )}
        {modalState.mode === 'skills' && (
          <SkillsForm
            initialData={profile.skills}
            onClose={() => setModalState({ isOpen: false, mode: null })}
            onSuccess={() => {
              refreshProfile();
              setModalState({ isOpen: false, mode: null });
            }}
          />
        )}
        {modalState.mode === 'experience' && (
          <ExperienceForm
            initialData={modalState.data}
            onClose={() => setModalState({ isOpen: false, mode: null, data: null })}
            onSuccess={() => {
              refreshProfile();
              setModalState({ isOpen: false, mode: null, data: null });
            }}
          />
        )}
        {modalState.mode === 'education' && (
          <EducationForm
            initialData={modalState.data}
            onClose={() => setModalState({ isOpen: false, mode: null, data: null })}
            onSuccess={() => {
              refreshProfile();
              setModalState({ isOpen: false, mode: null, data: null });
            }}
          />
        )}
        {modalState.mode === 'resume' && (
          <ResumeForm
            onClose={() => setModalState({ isOpen: false, mode: null })}
            onSuccess={() => {
              refreshProfile();
              setModalState({ isOpen: false, mode: null });
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default FreelancerProfilePage;