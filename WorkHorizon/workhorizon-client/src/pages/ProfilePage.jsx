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
import { userApi } from '../api/userApi.js';
import { Link } from 'react-router-dom';
import { BACKEND_URL } from '../api/apiClient.js';
import { toast } from 'react-toastify';

/* === MODERNIZED UI - Import Icons === */
import {
  User, BookOpen, Briefcase, Puzzle, FileText, Bell,
  Lock, LayoutGrid, ShieldCheck, Users, Package, Megaphone, Database, MonitorPlay,
  Edit, Plus, Trash2, Calendar, ExternalLink, DollarSign, Save, Camera
} from 'lucide-react';

/* === Helper Functions === */
const formatDate = (dateString) => {
  if (!dateString) return 'ปัจจุบัน';
  return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'short' });
};

/* === MODERNIZED: Section Card Component === */
const SectionCard = ({ title, icon, children, action }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 relative overflow-hidden">
    {/* Decorative Background */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50"></div>

    <div className="relative z-10">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl">
            {icon}
          </div>
          {title}
        </h2>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  </div>
);

/* === MODERNIZED: Item Row Component === */
const ItemRow = ({ title, subtitle, date, description, onEdit, onDelete, isDeleting }) => (
  <div className="group p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-600 font-medium mb-1">{subtitle}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Calendar size={12} /> {date}
        </p>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 bg-white border border-slate-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
          title="แก้ไข"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-2 bg-white border border-slate-200 text-red-600 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
          title="ลบ"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
    {description && (
      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mt-3 pt-3 border-t border-slate-100">{description}</p>
    )}
  </div>
);

/* === MODERNIZED: Add Button Component === */
const AddButton = ({ onClick, label = '+ เพิ่ม', icon = <Plus size={18} /> }) => (
  <button
    onClick={onClick}
    className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
  >
    {icon} {label}
  </button>
);

/* === MODERNIZED: Skill Badge Component === */
const SkillBadge = ({ skill }) => (
  <span className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all cursor-default">
    {skill.name}
  </span>
);

/* === Main Component === */
const ProfilePage = () => {
  const { isJobSeeker, isAdmin, isFreelancer, refreshAuthUser } = useAuth();
  const { profile, isLoading, error, refreshProfile } = useUserProfile();

  const [modalState, setModalState] = useState({ isOpen: false, mode: null, data: null });
  const [isDeleting, setIsDeleting] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const openModal = (mode, data = null) => {
    setModalState({ isOpen: true, mode, data });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: null, data: null });
  };

  const handleSuccess = async () => {
    closeModal();
    const { data } = await userApi.getProfile();
    refreshAuthUser(data);
    refreshProfile();
    toast.success("บันทึกข้อมูลเรียบร้อย");
  };

  const handleDelete = async (type, id, name) => {
    const isConfirmed = window.confirm(`คุณต้องการลบ "${name}" ใช่หรือไม่?`);
    if (!isConfirmed) return;

    setIsDeleting(id);
    try {
      if (type === 'edu') await userApi.deleteEducation(id);
      if (type === 'exp') await userApi.deleteExperience(id);
      if (type === 'resume') await userApi.deleteResume(id);
      await refreshProfile();
      toast.success("ลบข้อมูลเรียบร้อย");
    } catch (err) { toast.error("ลบไม่สำเร็จ: " + err.message); }
    finally { setIsDeleting(null); }
  };

  // ✅ Helper function to construct full URL from relative path
  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  // ✅ Handle Profile Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      await userApi.uploadProfileImage(formData);
      // Refresh profile and auth user to update header
      const { data } = await userApi.getProfile();
      refreshAuthUser(data);
      refreshProfile();
      toast.success("อัปโหลดรูปโปรไฟล์เรียบร้อย");
    } catch (err) {
      toast.error("อัปโหลดรูปโปรไฟล์ไม่สำเร็จ: " + (err.response?.data?.error || err.message));
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoading) return <LoadingSpinner text="กำลังโหลดโปรไฟล์..." />;
  if (error || !profile) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200">
        <h1 className="text-2xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h1>
        <p className="text-slate-600">ไม่สามารถโหลดข้อมูลโปรไฟล์ได้</p>
      </div>
    </div>
  );

  const profileImageUrl = getImageUrl(profile.profileImageUrl) ||
    `https://placehold.co/150x150/E0E0E0/777?text=${profile.firstName?.charAt(0) || '?'}`;

  return (
    <>
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">

        {/* === MODERNIZED: Admin Quick Access Section === */}
        {isAdmin && (
          <SectionCard title="แผงควบคุม Admin" icon={<LayoutGrid className="w-6 h-6" />}>
            <p className="text-slate-600 mb-6">ทางลัดสำหรับกลับไปยังส่วนจัดการระบบ</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-all">
                <LayoutGrid size={20} /> แผงควบคุม
              </Link>
              <Link to="/admin/verify" className="flex items-center gap-3 px-4 py-3 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-100 transition-all">
                <ShieldCheck size={20} /> อนุมัติบริษัท
              </Link>
              <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition-all">
                <Users size={20} /> จัดการผู้ใช้
              </Link>
              <Link to="/admin/jobs" className="flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-700 font-bold rounded-xl hover:bg-orange-100 transition-all">
                <Package size={20} /> จัดการงาน
              </Link>
              <Link to="/admin/ads" className="flex items-center gap-3 px-4 py-3 bg-pink-50 text-pink-700 font-bold rounded-xl hover:bg-pink-100 transition-all">
                <Megaphone size={20} /> จัดการโฆษณา
              </Link>
              <Link to="/admin/master-data" className="flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-all">
                <Database size={20} /> ข้อมูลหลัก
              </Link>
            </div>
          </SectionCard>
        )}

        {/* === MODERNIZED: Freelancer Profile Section === */}
        {isFreelancer && (
          <SectionCard title="ข้อมูลฟรีแลนซ์" icon={<MonitorPlay className="w-6 h-6" />}>
            {profile.freelancerProfile ? (
              <>
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {profile.freelancerProfile.professionalTitle || "ยังไม่ระบุตำแหน่งงาน"}
                  </h3>
                  <div className="flex items-center gap-2 text-blue-700 font-bold mb-3">
                    <DollarSign size={18} />
                    <span>
                      {profile.freelancerProfile.hourlyRate
                        ? `฿${profile.freelancerProfile.hourlyRate.toLocaleString()}/ชม.`
                        : "ยังไม่ระบุค่าจ้าง"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
                    {profile.freelancerProfile.bio || "ยังไม่มีข้อมูลแนะนำตัว"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/freelancer/profile" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">
                    <Edit size={18} /> แก้ไขข้อมูลรับงาน
                  </Link>
                  <Link to="/freelancer/services" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">
                    <Package size={18} /> จัดการงานบริการ
                  </Link>
                  <Link to={`/freelancers/${profile.id}`} target="_blank" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all ml-auto">
                    <ExternalLink size={18} /> ดูหน้าสาธารณะ
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <MonitorPlay size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 mb-4 font-medium">คุณยังไม่ได้สร้างข้อมูลโปรไฟล์ฟรีแลนซ์</p>
                <Link to="/freelancer/profile" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">
                  <Plus size={20} /> เริ่มต้นสร้างโปรไฟล์
                </Link>
              </div>
            )}
          </SectionCard>
        )}

        {/* === MODERNIZED: Basic Info Section === */}
        <SectionCard
          title="ข้อมูลส่วนตัว"
          icon={<User className="w-6 h-6" />}
          action={
            <button
              onClick={() => openModal('edit-info', profile)}
              className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all flex items-center gap-2"
            >
              <Edit size={16} /> แก้ไข
            </button>
          }
        >
          <div className="flex items-start gap-6">
            {/* ✅ Profile Image with Upload Overlay */}
            <div className="relative group">
              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-100 shadow-md transition-all group-hover:brightness-90"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                {isUploadingImage ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera className="text-white w-8 h-8 drop-shadow-md" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                />
              </label>
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {profile.firstName} {profile.lastName}
              </h3>
              <div className="space-y-2 text-slate-600">
                <p className="flex items-center gap-2">
                  <span className="font-semibold">อีเมล:</span> {profile.email}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">โทรศัพท์:</span> {profile.phone || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
              <FileText size={16} /> Bio
            </h4>
            <p className="text-slate-600 italic whitespace-pre-wrap leading-relaxed">
              {profile.bio || "ยังไม่มีข้อมูล Bio"}
            </p>
          </div>
        </SectionCard>

        {/* === MODERNIZED: Security Section === */}
        <SectionCard title="ความปลอดภัย" icon={<Lock className="w-6 h-6" />}>
          <p className="text-slate-600 mb-4">จัดการรหัสผ่านและการตั้งค่าความปลอดภัยของบัญชี</p>
          <button
            onClick={() => openModal('change-password')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <Lock size={18} /> เปลี่ยนรหัสผ่าน
          </button>
        </SectionCard>

        {/* === Job Seeker Sections (Education, Experience, Skills, Resume) === */}
        {isJobSeeker && (
          <>
            {/* === MODERNIZED: Education Section === */}
            <SectionCard title="ประวัติการศึกษา" icon={<BookOpen className="w-6 h-6" />}>
              {profile.educations?.length > 0 ? (
                <>
                  {profile.educations.map(edu => (
                    <ItemRow
                      key={edu.id}
                      title={edu.institute}
                      subtitle={`${edu.degree} (${edu.fieldOfStudy})`}
                      date={`${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`}
                      onEdit={() => openModal('edit-edu', edu)}
                      onDelete={() => handleDelete('edu', edu.id, edu.institute)}
                      isDeleting={isDeleting === edu.id}
                    />
                  ))}
                </>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">ยังไม่มีข้อมูลการศึกษา</p>
                </div>
              )}
              <AddButton onClick={() => openModal('add-edu')} label="เพิ่มการศึกษา" />
            </SectionCard>

            {/* === MODERNIZED: Experience Section === */}
            <SectionCard title="ประสบการณ์ทำงาน" icon={<Briefcase className="w-6 h-6" />}>
              {profile.experiences?.length > 0 ? (
                <>
                  {profile.experiences.map(exp => (
                    <ItemRow
                      key={exp.id}
                      title={exp.title}
                      subtitle={exp.company}
                      date={`${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`}
                      description={exp.description}
                      onEdit={() => openModal('edit-exp', exp)}
                      onDelete={() => handleDelete('exp', exp.id, exp.title)}
                      isDeleting={isDeleting === exp.id}
                    />
                  ))}
                </>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <Briefcase size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">ยังไม่มีข้อมูลประสบการณ์ทำงาน</p>
                </div>
              )}
              <AddButton onClick={() => openModal('add-exp')} label="เพิ่มประสบการณ์" />
            </SectionCard>

            {/* === MODERNIZED: Skills Section === */}
            <SectionCard
              title="ทักษะ"
              icon={<Puzzle className="w-6 h-6" />}
              action={
                <button
                  onClick={() => openModal('edit-skills', profile.skills)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all flex items-center gap-2"
                >
                  <Edit size={16} /> แก้ไข
                </button>
              }
            >
              {profile.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map(skill => <SkillBadge key={skill.id} skill={skill} />)}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <Puzzle size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">ยังไม่มีข้อมูลทักษะ</p>
                </div>
              )}
            </SectionCard>

            {/* === MODERNIZED: Resume Section ✅ FIXED === */}
            <SectionCard title="ไฟล์เรซูเม่" icon={<FileText className="w-6 h-6" />}>
              <div className="space-y-3">
                {profile.resumes?.length > 0 ? profile.resumes.map(resume => (
                  <div key={resume.id} className="group flex justify-between items-center p-4 border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-md transition-all bg-white">
                    {/* ✅ FIX: Add BACKEND_URL prefix to resume.url using getImageUrl() */}
                    <a
                      href={getImageUrl(resume.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-blue-600 hover:text-blue-700 font-medium flex-1"
                    >
                      <FileText size={20} />
                      <span>{resume.filename}</span>
                    </a>
                    <button
                      onClick={() => handleDelete('resume', resume.id, resume.filename)}
                      disabled={isDeleting === resume.id}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {isDeleting === resume.id ? '...' : <Trash2 size={18} />}
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">ยังไม่มีไฟล์เรซูเม่</p>
                  </div>
                )}
              </div>
              <AddButton onClick={() => openModal('add-resume')} label="อัปโหลดเรซูเม่" icon={<Plus size={18} />} />
            </SectionCard>
          </>
        )}
      </div>

      {/* === Modals === */}
      <Modal isOpen={modalState.isOpen} onClose={closeModal} title={
        modalState.mode === 'edit-info' ? "แก้ไขข้อมูลส่วนตัว" :
          modalState.mode === 'add-edu' ? "เพิ่มประวัติการศึกษา" :
            modalState.mode === 'edit-edu' ? "แก้ไขประวัติการศึกษา" :
              modalState.mode === 'add-exp' ? "เพิ่มประสบการณ์ทำงาน" :
                modalState.mode === 'edit-exp' ? "แก้ไขประสบการณ์ทำงาน" :
                  modalState.mode === 'edit-skills' ? "แก้ไขทักษะ" :
                    modalState.mode === 'add-resume' ? "อัปโหลดเรซูเม่" :
                      modalState.mode === 'change-password' ? "เปลี่ยนรหัสผ่าน" : ""
      }>
        {modalState.mode === 'edit-info' && <BasicInfoForm onClose={closeModal} onSuccess={handleSuccess} initialData={profile} />}
        {(modalState.mode === 'add-edu' || modalState.mode === 'edit-edu') && <EducationForm onClose={closeModal} onSuccess={handleSuccess} initialData={modalState.data} />}
        {(modalState.mode === 'add-exp' || modalState.mode === 'edit-exp') && <ExperienceForm onClose={closeModal} onSuccess={handleSuccess} initialData={modalState.data} />}
        {modalState.mode === 'edit-skills' && <SkillsForm onClose={closeModal} onSuccess={handleSuccess} initialData={modalState.data} />}
        {modalState.mode === 'add-resume' && <ResumeForm onClose={closeModal} onSuccess={handleSuccess} />}
        {modalState.mode === 'change-password' && <ChangePasswordForm onClose={closeModal} onSuccess={closeModal} />}
      </Modal>
    </>
  );
};

export default ProfilePage;