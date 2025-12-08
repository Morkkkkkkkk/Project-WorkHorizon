import React, { useState, useCallback, useEffect } from 'react';
import { useCategorySelector } from '../hooks/useCategorySelector.js';
import { masterDataApi } from '../api/masterDataApi.js';
import SearchableCombobox from './SearchableCombobox.jsx';
import SearchableMultiCombobox from './SearchableMultiCombobox.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import { jobApi } from '../api/jobApi.js';
import { BACKEND_URL } from '../api/apiClient.js';
import { UploadCloud, Trash2, ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Component นี้ถูกเรียกใช้ใน DashboardPage และ AdminJobManagementPage
 * @param {object} props
 * @param {object} props.initialData - ข้อมูลงานเดิม (ถ้าเป็นโหมดแก้ไข)
 * @param {Function} props.onSubmit - (Backend รับ Callback นี้)
 * @param {Function} props.onClose - ฟังก์ชันปิด Modal
 * @param {boolean} props.isSubmitting - สถานะกำลังส่ง
 */
const JobForm = ({ initialData, onSubmit, onClose, isSubmitting }) => {
  const isEditMode = !!initialData;

  // (State สำหรับข้อมูลในฟอร์ม)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    salaryMin: initialData?.salaryMin || '',
    salaryMax: initialData?.salaryMax || '',
    status: initialData?.status || 'DRAFT',

    responsibilities: initialData?.responsibilities || '',
    benefits: initialData?.benefits || '',
    workingHours: initialData?.workingHours || '',
    location: initialData?.location || '',
    isSalaryNegotiable: initialData?.isSalaryNegotiable || false, // Default to false

    // (Backend คาดหวัง Object หรือ null)
    jobType: initialData?.jobType || null,
    province: initialData?.province || null,
    district: initialData?.district || null,
    skills: initialData?.skills || [], // (Skills เป็น Array)
  });

  const [selectedFiles, setSelectedFiles] = useState([]); // ✅ New state for files
  const [error, setError] = useState(null);

  // 1. (เรียกใช้ Hook หมวดหมู่)
  const {
    selectedMainCat,
    selectedSubCat,
    mainCategories,
    filteredSubCategories,
    isLoadingCategories,
    handleMainCategoryChange: setMainCat, // (ใช้ set ตรงๆ)
    handleSubCategoryChange: setSubCat,   // (ใช้ set ตรงๆ)
  } = useCategorySelector(
    initialData?.mainCategory?.id, // (ส่ง ID ของ MainCat)
    initialData?.subCategory?.id  // (ส่ง ID ของ SubCat)
  );

  // (Effect) ถ้าหมวดหมู่ย่อยโหลดเสร็จ และมีค่าเริ่มต้น, ให้ตั้งค่า
  useEffect(() => {
    if (isEditMode && initialData?.subCategory && filteredSubCategories.length > 0) {
      const exists = filteredSubCategories.some(s => s.id === initialData.subCategory.id);
      if (exists) {
        // (ต้องส่ง Event object เข้าไป)
        setSubCat({ target: { value: initialData.subCategory.id } });
      }
    }
    // (eslint-disable-next-line react-hooks/exhaustive-deps)
  }, [isEditMode, initialData, filteredSubCategories]); // (ตั้งใจให้ทำงานเมื่อ SubCats โหลดเสร็จ)


  // 2. (Handlers สำหรับ Text Inputs)
  const handleTextChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value // Handle checkbox
    }));
  };

  // 3. (Handlers สำหรับ Comboboxes - รับ Object)
  const handleComboboxChange = (name) => (value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      province: value,
      district: null, // (ล้างอำเภอ เมื่อจังหวัดเปลี่ยน)
    }));
  };

  // (Helper สำหรับดึงอำเภอ - ส่ง provinceId ไปด้วย)
  const fetchDistricts = (query) => {
    const provinceId = formData.province?.id;
    if (!provinceId) return Promise.resolve([]);
    return masterDataApi.getDistricts(provinceId, query);
  };

  // ✅ Handler for file selection (New Job)
  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // 4. (Submit)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // (Validation)
    if (!selectedMainCat) {
      setError("กรุณาเลือกหมวดหมู่หลัก");
      return;
    }
    if (!formData.jobType) {
      setError("กรุณาเลือกประเภทงาน");
      return;
    }
    if (!formData.province) {
      setError("กรุณาเลือกจังหวัด");
      return;
    }
    if (!formData.district) {
      setError("กรุณาเลือกอำเภอ/เขต");
      return;
    }

    // (สร้าง Payload ที่ Backend ต้องการ)
    const payload = {
      ...formData,
      salaryMin: formData.salaryMin || null,
      salaryMax: formData.salaryMax || null,
      // (Backend ต้องการ Object {id, name} หรือ {name} สำหรับการสร้างใหม่)
      mainCategory: mainCategories.find(c => c.id === selectedMainCat),
      subCategory: filteredSubCategories.find(s => s.id === selectedSubCat) || null,
      jobType: formData.jobType,
      province: formData.province,
      district: { ...formData.district, provinceId: formData.province?.id }, // (ส่ง provinceId ไปให้ Backend)
      skills: formData.skills,
    };

    // (ส่งกลับไปที่ Page (DashboardPage หรือ AdminJobManagementPage))
    // ✅ Pass selectedFiles as the second argument if creating a new job
    onSubmit(payload, initialData?.id || selectedFiles);
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scroll">

      {error && (
        <div className="alert-danger">
          {error}
        </div>
      )}

      <div>
        <label className="label-text">ตำแหน่งงาน *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleTextChange}
          required
          className="form-input"
        />
      </div>

      <div>
        <label className="label-text">รายละเอียดงาน (รองรับ Markdown) *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleTextChange}
          required
          rows={5}
          className="form-input"
          placeholder="รายละเอียด, คุณสมบัติ, สวัสดิการ..."
        />
      </div>

      {/* --- Salary Section (แก้ไข) --- */}
      <div className="pt-4 border-t border-slate-100">
        <label className="label-text">เงินเดือน</label>
        <div className="flex items-center space-x-4">

          {/* ✅ 3. Checkbox: เงินเดือนตามตกลง */}
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              name="isSalaryNegotiable"
              checked={formData.isSalaryNegotiable}
              onChange={handleTextChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="ml-2">เงินเดือนตามตกลง</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          {/* 4. Input เงินเดือน (Disable เมื่อเลือกตามตกลง) */}
          <div>
            <label className="label-text">ขั้นต่ำ</label>
            <input
              type="number"
              name="salaryMin"
              value={formData.salaryMin}
              onChange={handleTextChange}
              className="form-input"
              disabled={formData.isSalaryNegotiable}
              required={!formData.isSalaryNegotiable} // บังคับใส่ถ้าไม่เลือกตามตกลง
            />
          </div>
          <div>
            <label className="label-text">สูงสุด</label>
            <input
              type="number"
              name="salaryMax"
              value={formData.salaryMax}
              onChange={handleTextChange}
              className="form-input"
              disabled={formData.isSalaryNegotiable}
              required={!formData.isSalaryNegotiable}
            />
          </div>
        </div>
      </div>

      {/* (Dropdowns หมวดหมู่) */}
      {isLoadingCategories ? (
        <LoadingSpinner text="กำลังโหลดหมวดหมู่..." />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">หมวดหมู่หลัก *</label>
            <select
              value={selectedMainCat}
              onChange={setMainCat} // (ส่ง Event object)
              required
              className="form-input"
            >
              <option value="">-- เลือกหมวดหมู่หลัก --</option>
              {mainCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">หมวดหมู่ย่อย</label>
            <select
              value={selectedSubCat}
              onChange={setSubCat} // (ส่ง Event object)
              disabled={!selectedMainCat || filteredSubCategories.length === 0}
              className="form-input"
            >
              <option value="">-- (เลือกหมวดหมู่ย่อย ถ้ามี) --</option>
              {filteredSubCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div>
        <label className="label-text">ประเภทงาน *</label>
        <SearchableCombobox
          placeholder="- เลือก หรือ พิมพ์ประเภทงาน -"
          fetchFunction={masterDataApi.getJobTypes}
          value={formData.jobType}
          onChange={handleComboboxChange("jobType")}
          allowCreate={true}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">จังหวัด *</label>
          <SearchableCombobox
            placeholder="- กรุณาเลือกจังหวัด -"
            fetchFunction={masterDataApi.getProvinces}
            value={formData.province}
            onChange={handleProvinceChange} // (ใช้ Handler พิเศษ)
            allowCreate={false}
          />
        </div>
        <div>
          <label className="label-text">อำเภอ/เขต *</label>
          <SearchableCombobox
            placeholder="- เลือก หรือ พิมพ์อำเภอ -"
            fetchFunction={fetchDistricts} // (ใช้ Helper ที่ส่ง provinceId)
            value={formData.district}
            onChange={handleComboboxChange("district")}
            disabled={!formData.province?.id} // (ปิด ถ้ายังไม่เลือกจังหวัด)
            allowCreate={true}
          />
        </div>
      </div>

      {/* --- ✅ 5. เพิ่มรายละเอียดเพิ่มเติม --- */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <h3 className="label-text font-semibold text-lg">รายละเอียดเพิ่มเติม</h3>

        {/* ความรับผิดชอบ (Responsibilities) */}
        <div>
          <label className="label-text">ความรับผิดชอบ *</label>
          <textarea
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleTextChange}
            required
            rows={4}
            className="form-input"
            placeholder="หน้าที่หลัก, เป้าหมาย, งานประจำวัน..."
          />
        </div>

        {/* สวัสดิการ (Benefits) */}
        <div>
          <label className="label-text">สวัสดิการ *</label>
          <textarea
            name="benefits"
            value={formData.benefits}
            onChange={handleTextChange}
            required
            rows={4}
            className="form-input"
            placeholder="ประกันสุขภาพ, วันหยุดพักร้อน, โบนัส, Work From Home..."
          />
        </div>

        {/* เวลาทำงาน (Working Hours) */}
        <div>
          <label className="label-text">เวลาทำงาน *</label>
          <input
            type="text"
            name="workingHours"
            value={formData.workingHours}
            onChange={handleTextChange}
            required
            className="form-input"
            placeholder="เช่น 9:00 - 18:00 (จันทร์-ศุกร์) หรือ Flexible"
          />
        </div>

        {/* สถานที่ทำงาน (Location - ที่อยู่จริง) */}
        <div>
          <label className="label-text">สถานที่ทำงาน (ที่อยู่เต็ม) *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleTextChange}
            required
            className="form-input"
            placeholder="เช่น อาคาร A ชั้น 10, 58/1 ถนนสุขุมวิท"
          />
        </div>
      </div>

      <div>
        <label className="label-text">ทักษะที่ต้องการ (Skills)</label>
        <SearchableMultiCombobox
          placeholder="- ค้นหา หรือ พิมพ์ทักษะใหม่ -"
          fetchFunction={masterDataApi.getSkills}
          value={formData.skills}
          onChange={handleComboboxChange("skills")}
        />
      </div>


      <div>
        <label className="label-text">สถานะ *</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleTextChange}
          required
          className="form-input"
        >
          <option value="DRAFT">แบบร่าง (Draft)</option>
          <option value="PUBLISHED">เผยแพร่ (Publish)</option>
          <option value="ARCHIVED">ปิดรับ (Archive)</option>
        </select>

      </div>

      {/* ──────────────── Image Upload Section ──────────────── */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ImageIcon className="text-orange-500" /> รูปภาพประกอบ
        </h3>

        {isEditMode ? (
          <JobImageUploader
            jobId={initialData.id}
            initialImages={initialData.images || []}
          />
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              เลือกรูปภาพ (สามารถเลือกได้หลายรูป)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-700
                hover:file:bg-orange-100
              "
            />
            <p className="text-xs text-slate-500 mt-2">
              * รองรับไฟล์ .jpg, .png, .jpeg
            </p>
          </div>
        )}
      </div>

      {/* ปุ่ม Submit */}
      <div className="flex justify-end pt-4 space-x-2 border-t">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoadingCategories}
          className="btn-primary"
        >
          {isSubmitting ? 'กำลังบันทึก...' : (isEditMode ? 'บันทึกการแก้ไข' : 'สร้างงาน')}
        </button>
      </div>
    </form>
  );
};

export default JobForm;


// --- (เพิ่ม Component ใหม่นี้ที่ด้านล่างไฟล์ JobForm.jsx) ---

const JobImageUploader = ({ jobId, initialImages }) => {
  const [images, setImages] = useState(initialImages);
  const [isUploading, setIsUploading] = useState(false);

  // (Helper)
  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('jobImages', files[i]);
    }

    setIsUploading(true);
    try {
      const { data: newImages } = await jobApi.uploadJobImages(jobId, formData);
      setImages(prev => [...prev, ...newImages]);
      toast.success("อัปโหลดรูปภาพเรียบร้อยแล้ว");
    } catch (err) {
      toast.error("อัปโหลดรูปไม่สำเร็จ: " + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm("ยืนยันการลบรูปภาพนี้?")) return;
    try {
      await jobApi.deleteJobImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success("ลบรูปภาพเรียบร้อยแล้ว");
    } catch (err) {
      toast.error("ลบรูปไม่สำเร็จ: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <label className="label-text">แกลเลอรีรูปภาพ (สำหรับ Job Card และหน้า Job Detail)</label>

      {/* (แสดงรูปที่อัปโหลดแล้ว) */}
      <div className="grid grid-cols-3 gap-3">
        {images.map(img => (
          <div key={img.id} className="relative group">
            <img src={getImageUrl(img.url)} alt="Job" className="w-full h-24 object-cover rounded-md border" />
            <button
              type="button"
              onClick={() => handleDelete(img.id)}
              className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* (ปุ่มอัปโหลด) */}
      <div>
        <label className="btn-secondary-outline w-full cursor-pointer">
          <UploadCloud size={16} className="mr-2" />
          {isUploading ? "กำลังอัปโหลด..." : "เลือกรูปภาพ (หลายรูปได้)"}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
};