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
  GraduationCap, FileText, Settings, ChevronRight, Plus, Trash2, Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';

const FreelancerProfilePage = () => {
  const { user, refreshAuthUser } = useAuth();
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
    `https://placehold.co/150x150/E0E0E0/777?text=${profile.firstName?.charAt(0)}`;

  const tabs = [
    { id: 'overview', label: 'ภาพรวม & ข้อมูลส่วนตัว', icon: User },
    { id: 'freelancer', label: 'ข้อมูลการทำงาน', icon: Briefcase },
    { id: 'experience', label: 'ประสบการณ์ทำงาน', icon: Award },
    { id: 'education', label: 'ประวัติการศึกษา', icon: GraduationCap },
    { id: 'skills', label: 'ทักษะความเชี่ยวชาญ', icon: ShieldCheck },
    { id: 'resume', label: 'เรซูเม่ / CV', icon: FileText },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">

      {/* Header Profile Card */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end md:items-center gap-6 -mt-12">
          <div className="relative group">
            <img
              src={displayImage}
              alt="Profile"
              className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg bg-white"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <UploadCloud size={28} className="text-white" />
              <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={isUploading} />
            </div>
          </div>

          <div className="flex-1 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{profile.firstName} {profile.lastName}</h1>
            <p className="text-slate-500 flex items-center gap-2 mt-1 font-medium">
              {freelancerForm.professionalTitle || "ระบุตำแหน่งงานของคุณ"}
            </p>
          </div>

          <div className="flex gap-3 mb-4 md:mb-0">
            <a
              href={`/freelancers/${profile.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
            >
              <ExternalLink size={18} /> ดูหน้าสาธารณะ
            </a>
            <a
              href="/freelancer/services"
              className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <Briefcase size={18} /> จัดการงานบริการ
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'} />
                {tab.label}
                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto text-blue-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <User className="text-blue-600" size={24} /> ข้อมูลส่วนตัว
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">ข้อมูลพื้นฐานสำหรับการติดต่อ</p>
                </div>
                <button
                  onClick={() => setModalState({ isOpen: true, mode: 'basic' })}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Edit size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ชื่อ-นามสกุล</label>
                    <p className="text-lg font-medium text-slate-800 mt-1">{profile.firstName} {profile.lastName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">อีเมล</label>
                    <p className="text-lg font-medium text-slate-800 mt-1">{profile.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">เบอร์โทรศัพท์</label>
                    <p className="text-lg font-medium text-slate-800 mt-1">{profile.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">สถานะบัญชี</label>
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                        <ShieldCheck size={12} /> Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Freelancer Info */}
          {activeTab === 'freelancer' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="text-blue-600" size={24} /> ข้อมูลการทำงาน
                </h2>
                <p className="text-slate-500 text-sm mt-1">ตั้งค่าข้อมูลวิชาชีพของคุณเพื่อให้ลูกค้าจ้างงาน</p>
              </div>

              <form onSubmit={handleFreelancerUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ตำแหน่งงานที่เชี่ยวชาญ (Professional Title)</label>
                  <input
                    type="text"
                    value={freelancerForm.professionalTitle}
                    onChange={(e) => setFreelancerForm({ ...freelancerForm, professionalTitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                    placeholder="เช่น Senior Graphic Designer, React Developer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                      <DollarSign size={16} className="text-slate-400" /> ค่าจ้างรายชั่วโมง (บาท)
                    </label>
                    <input
                      type="number"
                      value={freelancerForm.hourlyRate}
                      onChange={(e) => setFreelancerForm({ ...freelancerForm, hourlyRate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                      <Award size={16} className="text-slate-400" /> ประสบการณ์ (ปี)
                    </label>
                    <input
                      type="number"
                      value={freelancerForm.yearsOfExperience}
                      onChange={(e) => setFreelancerForm({ ...freelancerForm, yearsOfExperience: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">แนะนำตัว & ประสบการณ์ (Bio)</label>
                  <textarea
                    rows={5}
                    value={freelancerForm.bio}
                    onChange={(e) => setFreelancerForm({ ...freelancerForm, bio: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400 resize-none"
                    placeholder="เขียนเกี่ยวกับตัวคุณ จุดแข็ง และสิ่งที่คุณทำได้..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                    <IconLink size={16} className="text-slate-400" /> Portfolio Link (URL)
                  </label>
                  <input
                    type="url"
                    value={freelancerForm.portfolioUrl}
                    onChange={(e) => setFreelancerForm({ ...freelancerForm, portfolioUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                    placeholder="https://..."
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">
                    บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Experience */}
          {activeTab === 'experience' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Award className="text-blue-600" size={24} /> ประสบการณ์ทำงาน
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">ประวัติการทำงานที่ผ่านมาของคุณ</p>
                </div>
                <button
                  onClick={() => setModalState({ isOpen: true, mode: 'experience' })}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all"
                >
                  <Plus size={18} /> เพิ่มประสบการณ์
                </button>
              </div>

              <div className="space-y-4">
                {profile.experiences?.length > 0 ? (
                  profile.experiences.map(exp => (
                    <div key={exp.id} className="group p-5 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-slate-50/50 hover:bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-slate-800">{exp.title}</h3>
                          <div className="text-blue-600 font-medium mb-1">{exp.company}</div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar size={14} />
                            {new Date(exp.startDate).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })} -
                            {exp.endDate ? new Date(exp.endDate).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }) : 'ปัจจุบัน'}
                          </div>
                          {exp.description && <p className="text-slate-600 text-sm mt-3 leading-relaxed">{exp.description}</p>}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setModalState({ isOpen: true, mode: 'experience', data: exp })}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteExperience(exp.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            {isDeleting === exp.id ? '...' : <Trash2 size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Award size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">ยังไม่มีข้อมูลประสบการณ์ทำงาน</p>
                    <button
                      onClick={() => setModalState({ isOpen: true, mode: 'experience' })}
                      className="text-blue-600 font-bold mt-2 hover:underline"
                    >
                      + เพิ่มประสบการณ์
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Education */}
          {activeTab === 'education' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="text-blue-600" size={24} /> ประวัติการศึกษา
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">วุฒิการศึกษาและสถาบันที่คุณจบมา</p>
                </div>
                <button
                  onClick={() => setModalState({ isOpen: true, mode: 'education' })}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all"
                >
                  <Plus size={18} /> เพิ่มการศึกษา
                </button>
              </div>

              <div className="space-y-4">
                {profile.educations?.length > 0 ? (
                  profile.educations.map(edu => (
                    <div key={edu.id} className="group p-5 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-slate-50/50 hover:bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-slate-800">{edu.institute}</h3>
                          <div className="text-blue-600 font-medium mb-1">{edu.degree} • {edu.fieldOfStudy}</div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar size={14} />
                            {new Date(edu.startDate).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })} -
                            {edu.endDate ? new Date(edu.endDate).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }) : 'ปัจจุบัน'}
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setModalState({ isOpen: true, mode: 'education', data: edu })}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteEducation(edu.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            {isDeleting === edu.id ? '...' : <Trash2 size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <GraduationCap size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">ยังไม่มีข้อมูลการศึกษา</p>
                    <button
                      onClick={() => setModalState({ isOpen: true, mode: 'education' })}
                      className="text-blue-600 font-bold mt-2 hover:underline"
                    >
                      + เพิ่มการศึกษา
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Skills */}
          {activeTab === 'skills' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="text-blue-600" size={24} /> ทักษะความเชี่ยวชาญ
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">ทักษะที่คุณมีเพื่อดึงดูดลูกค้า</p>
                </div>
                <button
                  onClick={() => setModalState({ isOpen: true, mode: 'skills' })}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all"
                >
                  <Edit size={18} /> จัดการทักษะ
                </button>
              </div>

              {profile.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map(skill => (
                    <span key={skill.id} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all cursor-default">
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <ShieldCheck size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">ยังไม่มีข้อมูลทักษะ</p>
                  <button
                    onClick={() => setModalState({ isOpen: true, mode: 'skills' })}
                    className="text-blue-600 font-bold mt-2 hover:underline"
                  >
                    + เพิ่มทักษะ
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab: Resume */}
          {activeTab === 'resume' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="text-blue-600" size={24} /> เรซูเม่ / CV
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">อัปโหลดไฟล์เรซูเม่ของคุณเพื่อให้ลูกค้าดาวน์โหลด</p>
                </div>
                <button
                  onClick={() => setModalState({ isOpen: true, mode: 'resume' })}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all"
                >
                  <UploadCloud size={18} /> อัปโหลดใหม่
                </button>
              </div>

              {profile.resumeUrl ? (
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">ไฟล์เรซูเม่ปัจจุบัน</p>
                      <p className="text-xs text-slate-500">อัปโหลดเมื่อ: {new Date().toLocaleDateString('th-TH')}</p>
                    </div>
                  </div>
                  <a
                    href={getImageUrl(profile.resumeUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all text-sm"
                  >
                    ดาวน์โหลด
                  </a>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">ยังไม่มีไฟล์เรซูเม่</p>
                  <button
                    onClick={() => setModalState({ isOpen: true, mode: 'resume' })}
                    className="text-blue-600 font-bold mt-2 hover:underline"
                  >
                    + อัปโหลดเรซูเม่
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modals */}
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
