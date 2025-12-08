import React, { useState, useEffect, useCallback } from 'react';
import { companyApi } from '../api/companyApi';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { BACKEND_URL } from '../api/apiClient.js';
import { masterDataApi } from '../api/masterDataApi.js';

/* === MODERNIZED UI - Import Icons === */
import {
  Building, Link as LinkIcon, Users, MapPin, UploadCloud,
  Building2, Globe, Briefcase, ShieldCheck, AlertCircle, CheckCircle,
  Save, ExternalLink, FileText
} from 'lucide-react';

/* === MODERNIZED: Info Block Component === */
const InfoBlock = ({ icon, label, children, required = false }) => (
  <div>
    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
      {icon && <span className="text-slate-400">{icon}</span>}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div>{children}</div>
  </div>
);

const CompanyProfilePage = () => {
  const { user } = useAuth();

  /* === States === */
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    website: '',
    address: '',
    companySize: '',
    industryId: '',
  });

  const [logoUrl, setLogoUrl] = useState(null);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [industries, setIndustries] = useState([]);

  /* === Helper Functions === */
  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  /* === Data Fetching === */
  const fetchCompany = useCallback(async () => {
    try {
      const { data } = await companyApi.getMyCompany();
      setFormData({
        companyName: data.companyName,
        description: data.description,
        website: data.website || '',
        address: data.address || '',
        companySize: data.companySize || '',
        industryId: data.industryId || '',
      });
      setLogoUrl(data.logoUrl);
      setIsVerified(data.isVerified);
      setCompanyId(data.id);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลบริษัทได้");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const data = await masterDataApi.getIndustries();
        setIndustries(data);
      } catch (err) {
        console.error("Failed to load industries", err);
      }
    };
    fetchIndustries();
    fetchCompany();
  }, [fetchCompany]);

  /* === Event Handlers === */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await companyApi.updateMyCompany(formData);
      setSuccess("บันทึกข้อมูลสำเร็จ!");
      await fetchCompany();
    } catch (err) {
      setError(err.response?.data?.error || "บันทึกไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedLogo) return;
    setIsUploading(true);
    setError(null);

    const fd = new FormData();
    fd.append('logoFile', selectedLogo);

    try {
      const { data } = await companyApi.uploadLogo(fd);
      setLogoUrl(data.logoUrl);
      setSelectedLogo(null);
      setSuccess("อัปโหลดโลโก้สำเร็จ!");
    } catch (err) {
      setError("อัปโหลดโลโก้ไม่สำเร็จ");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedLogo(e.target.files[0]);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="กำลังโหลดโปรไฟล์บริษัท..." />;
  }

  const companyLogoUrl = getImageUrl(logoUrl) ||
    `https://placehold.co/150x150/E0E0E0/777?text=${formData.companyName.charAt(0)}`;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">

      {/* === MODERNIZED: Header with Gradient Background === */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-1">
                จัดการโปรไฟล์บริษัท
              </h1>
              <p className="text-blue-100">อัปเดตข้อมูลและดึงดูดผู้สมัครงานมากขึ้น</p>
            </div>
          </div>

          {companyId && (
            <a
              href={isVerified ? `/company/${companyId}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${isVerified
                  ? 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30'
                  : 'bg-white/10 text-white/50 cursor-not-allowed border border-white/20'
                }`}
              title={isVerified ? 'ดูหน้าโปรไฟล์สาธารณะ' : 'โปรไฟล์จะแสดงต่อสาธารณะหลังได้รับการอนุมัติ'}
            >
              <ExternalLink size={18} /> ดูหน้าสาธารณะ
            </a>
          )}
        </div>
      </div>

      {/* === MODERNIZED: Alert Messages === */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-red-800 mb-1">เกิดข้อผิดพลาด</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-3">
          <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-green-800 mb-1">สำเร็จ!</h4>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {!isVerified && (
        <div className="mb-6 p-5 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="text-yellow-600 shrink-0 mt-0.5" size={24} />
          <div>
            <h4 className="font-bold text-yellow-800 mb-1">รอการอนุมัติจาก Admin</h4>
            <p className="text-sm text-yellow-700">โปรไฟล์ของคุณกำลังอยู่ระหว่างรอการตรวจสอบ จะสามารถแสดงสาธารณะได้หลังจากได้รับการอนุมัติ</p>
          </div>
        </div>
      )}

      {/* === MODERNIZED: Main Form === */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* === MODERNIZED: Logo Upload Card === */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <Building size={20} />
            </div>
            โลโก้บริษัท
          </h2>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Logo Preview */}
            <div className="relative group">
              <img
                src={companyLogoUrl}
                alt="Logo"
                className="w-32 h-32 rounded-2xl object-cover border-4 border-slate-100 shadow-md group-hover:border-blue-200 transition-colors"
              />
              {selectedLogo && (
                <div className="absolute inset-0 bg-blue-600/90 rounded-2xl flex items-center justify-center">
                  <UploadCloud className="text-white" size={32} />
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-slate-700 mb-3">เลือกไฟล์โลโก้ใหม่</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:font-bold hover:file:bg-blue-100"
              />
              {selectedLogo && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 font-medium">
                    ✓ เลือก: {selectedLogo.name}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogoUpload}
                    disabled={isUploading}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        กำลังอัปโหลด...
                      </>
                    ) : (
                      <>
                        <UploadCloud size={18} /> อัปโหลดโลโก้
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === MODERNIZED: Company Information Card === */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 bg-green-600 text-white rounded-xl">
              <Briefcase size={20} />
            </div>
            ข้อมูลบริษัท
          </h2>

          <div className="space-y-6">
            {/* Company Name */}
            <InfoBlock icon={<Building size={16} />} label="ชื่อบริษัท" required>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                placeholder="ชื่อบริษัทของคุณ"
              />
            </InfoBlock>

            {/* Description */}
            <InfoBlock icon={<FileText size={16} />} label="เกี่ยวกับบริษัท (รองรับ Markdown)" required>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400 resize-none"
                placeholder="รายละเอียด, สวัสดิการ, วัฒนธรรมองค์กร, โอกาสในการเติบโต..."
              />
            </InfoBlock>

            {/* Website & Company Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoBlock icon={<Globe size={16} />} label="เว็บไซต์">
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                  placeholder="https://example.com"
                />
              </InfoBlock>

              <InfoBlock icon={<Users size={16} />} label="ขนาดบริษัท">
                <input
                  type="text"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  placeholder="เช่น 1-50 คน, 50-200 คน"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                />
              </InfoBlock>
            </div>

            {/* Industry */}
            <InfoBlock icon={<Briefcase size={16} />} label="อุตสาหกรรม">
              <select
                name="industryId"
                value={formData.industryId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 appearance-none"
              >
                <option value="">- เลือกอุตสาหกรรม -</option>
                {industries.map(industry => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
            </InfoBlock>

            {/* Address */}
            <InfoBlock icon={<MapPin size={16} />} label="ที่อยู่ (สำนักงานใหญ่)">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                placeholder="123 ถนนสุขุมวิท แขวง... เขต... กรุงเทพฯ 10110"
              />
            </InfoBlock>
          </div>
        </div>

        {/* === MODERNIZED: Submit Button === */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3 text-lg"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save size={20} /> บันทึกการแก้ไข
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
};

export default CompanyProfilePage;