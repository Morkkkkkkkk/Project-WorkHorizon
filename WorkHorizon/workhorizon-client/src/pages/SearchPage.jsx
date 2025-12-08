import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCategorySelector } from '../hooks/useCategorySelector';
import { masterDataApi } from '../api/masterDataApi';
import { jobApi } from '../api/jobApi';
import { Search, MapPin, DollarSign, Briefcase, Filter, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

import JobCard from '../components/JobCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserProfile } from '../hooks/useUserProfile.js';
import { userApi } from '../api/userApi.js';
import SearchableCombobox from '../components/SearchableCombobox.jsx';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // ✅ State สำหรับ Filters (ตัวกรอง)
    const initialKeyword = searchParams.get('q') || "";
    const initialMain = searchParams.get('mainCategoryId') || "";
    const initialSub = searchParams.get('subCategoryId') || "";
    const initialProvinceId = searchParams.get('provinceId') || "";
    const initialDistrictId = searchParams.get('districtId') || "";
    const initialSalary = searchParams.get('salaryMin') || "";

    const [keyword, setKeyword] = useState(initialKeyword);
    const [province, setProvince] = useState(null);
    const [district, setDistrict] = useState(null);
    const [salaryMin, setSalaryMin] = useState(initialSalary);

    // ✅ State สำหรับผลลัพธ์และ Pagination
    const [jobs, setJobs] = useState([]);
    const [page, setPage] = useState(1); // หน้าปัจจุบัน
    const [totalPages, setTotalPages] = useState(1); // จำนวนหน้าทั้งหมด
    const [totalJobs, setTotalJobs] = useState(0); // จำนวนงานทั้งหมด
    const [isSearching, setIsSearching] = useState(true);

    // ✅ Hook สำหรับ Category Dropdown
    const {
        selectedMainCat,
        selectedSubCat,
        mainCategories,
        filteredSubCategories,
        isLoadingCategories,
        handleMainCategoryChange,
        handleSubCategoryChange,
    } = useCategorySelector(initialMain, initialSub);

    // ✅ Hooks สำหรับระบบ "Save Job" (บันทึกงาน)
    const { isJobSeeker, isFreelancer } = useAuth();
    const { profile, refreshProfile } = useUserProfile(isJobSeeker || isFreelancer);

    const savedJobIdSet = useMemo(() => {
        if ((isJobSeeker || isFreelancer) && profile?.savedJobs) {
            return new Set(profile.savedJobs.map(job => job.jobId));
        }
        return new Set();
    }, [isJobSeeker, isFreelancer, profile]);

    const handleSaveToggle = useCallback(async (jobId, shouldSave) => {
        if (!isJobSeeker && !isFreelancer) {
            toast.warning("กรุณาเข้าสู่ระบบเพื่อบันทึกงาน");
            return;
        }
        try {
            if (shouldSave) {
                await userApi.addSavedJob(jobId);
                toast.success("บันทึกงานเรียบร้อยแล้ว");
            } else {
                await userApi.deleteSavedJob(jobId);
                toast.success("ยกเลิกการบันทึกงานเรียบร้อยแล้ว");
            }
            if (refreshProfile) refreshProfile();
        } catch (err) {
            console.error("Save job failed:", err);
            toast.error("เกิดข้อผิดพลาดในการบันทึก");
        }
    }, [isJobSeeker, isFreelancer, refreshProfile]);

    // ✅ Load initial location data (โหลดข้อมูลจังหวัด/อำเภอเริ่มต้น)
    useEffect(() => {
        const loadInitialLocation = async () => {
            if (initialProvinceId) {
                try {
                    const provs = await masterDataApi.getProvinces('');
                    const foundProv = provs.find(p => p.id === initialProvinceId);
                    if (foundProv) {
                        setProvince(foundProv);
                        if (initialDistrictId) {
                            const districts = await masterDataApi.getDistricts(initialProvinceId, '');
                            const foundDist = districts.find(d => d.id === initialDistrictId);
                            if (foundDist) setDistrict(foundDist);
                        }
                    }
                } catch (err) {
                    console.error("Failed to load location data", err);
                }
            }
        };
        loadInitialLocation();
    }, [initialProvinceId, initialDistrictId]);

    // ✅ Location handlers (จัดการเปลี่ยนจังหวัด/อำเภอ)
    const handleProvinceChange = (newProvince) => {
        setProvince(newProvince);
        setDistrict(null);
        setPage(1); // รีเซ็ตหน้าเป็น 1 เมื่อเปลี่ยนตัวกรอง
    };

    const handleDistrictChange = (newDistrict) => {
        setDistrict(newDistrict);
        setPage(1);
    };

    const handleSalaryChange = (e) => {
        setSalaryMin(e.target.value);
        setPage(1);
    };

    // ✅ Helper function for fetching districts
    const fetchDistricts = useCallback((query) => {
        const provinceId = province?.id || initialProvinceId;
        if (!provinceId) return Promise.resolve([]);
        return masterDataApi.getDistricts(provinceId, query);
    }, [province?.id, initialProvinceId]);

    // ✅ Effect สำหรับดึงข้อมูลงาน (Fetch Jobs)
    useEffect(() => {
        // อัปเดต URL
        const params = new URLSearchParams();
        if (keyword) params.set('q', keyword);
        if (selectedMainCat) params.set('mainCategoryId', selectedMainCat);
        if (selectedSubCat) params.set('subCategoryId', selectedSubCat);
        if (province?.id) params.set('provinceId', province.id);
        if (district?.id) params.set('districtId', district.id);
        if (salaryMin) params.set('salaryMin', salaryMin);

        // (ไม่จำเป็นต้องใส่ page ใน URL ก็ได้ หรือจะใส่ก็ได้)
        // params.set('page', page); 

        setSearchParams(params, { replace: true });

        // ฟังก์ชันดึงข้อมูล
        const fetchJobs = async () => {
            setIsSearching(true);
            // setJobs([]); // (Optional: ไม่ต้องเคลียร์ jobs ก็ได้เพื่อให้ดู smooth ขึ้น)
            try {
                const searchCriteria = {
                    q: keyword,
                    mainCategoryId: selectedMainCat,
                    subCategoryId: selectedSubCat,
                    provinceId: province?.id,
                    districtId: district?.id,
                    salaryMin: salaryMin,
                    page: page, // ✅ ส่งหน้าปัจจุบันไป
                    limit: 12, // (กำหนดจำนวนต่อหน้า)
                };

                const results = await jobApi.searchJobs(searchCriteria);
                setJobs(results.jobs || []);
                setTotalPages(results.totalPages || 1);
                setTotalJobs(results.totalJobs || 0);

            } catch (err) {
                console.error("Search failed:", err);
                setJobs([]);
            } finally {
                setIsSearching(false);
            }
        };

        // Debounce - หน่วงเวลาค้นหา
        const timer = setTimeout(() => {
            fetchJobs();
        }, 500);

        return () => clearTimeout(timer);

    }, [keyword, selectedMainCat, selectedSubCat, province?.id, district?.id, salaryMin, page, setSearchParams]);

    // ✅ ฟังก์ชันเปลี่ยนหน้า (Pagination Handler)
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // เลื่อนขึ้นบนสุด
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
            {/* ✅ Hero Section - Gradient Background (Orange Theme) */}
            <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="container mx-auto px-4 py-16 relative z-10">
                    {/* ✅ Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-bold mb-4">
                        <TrendingUp size={16} />
                        ค้นหางานที่ใช่สำหรับคุณ
                    </div>

                    {/* ✅ Title */}
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                        ค้นหางานและโอกาส
                    </h1>
                    <p className="text-orange-100 text-lg md:text-xl mb-0 max-w-2xl">
                        กรองและค้นหางานที่ตรงกับความต้องการของคุณ
                    </p>
                </div>
            </div>

            {/* ✅ Filter Form Section - Modern Card Design */}
            <div className="container mx-auto px-4 -mt-8 relative z-20 mb-8">
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8"
                >
                    {/* ✅ Section Header */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <Filter size={20} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900">ตัวกรองการค้นหา</h2>
                    </div>

                    {/* ✅ Filter Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Keyword Input */}
                        <div className="lg:col-span-3">
                            <label htmlFor="keyword" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Search size={16} className="text-orange-600" />
                                คำค้นหา (ตำแหน่งงาน, ทักษะ, บริษัท)
                            </label>
                            <input
                                id="keyword"
                                type="text"
                                placeholder="เช่น Web Developer, React, Google..."
                                value={keyword}
                                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-medium"
                            />
                        </div>

                        {/* Main Category */}
                        {!isLoadingCategories && (
                            <div>
                                <label htmlFor="mainCat" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Briefcase size={16} className="text-orange-600" />
                                    หมวดหมู่หลัก
                                </label>
                                <select
                                    id="mainCat"
                                    value={selectedMainCat}
                                    onChange={(e) => { handleMainCategoryChange(e); setPage(1); }}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-medium bg-white"
                                >
                                    <option value="">-- ทุกหมวดหมู่ --</option>
                                    {mainCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Sub Category */}
                        {!isLoadingCategories && (
                            <div>
                                <label htmlFor="subCat" className="block text-sm font-bold text-slate-700 mb-2">
                                    หมวดหมู่ย่อย
                                </label>
                                <select
                                    id="subCat"
                                    value={selectedSubCat}
                                    onChange={(e) => { handleSubCategoryChange(e); setPage(1); }}
                                    disabled={!selectedMainCat || filteredSubCategories.length === 0}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-medium bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">-- ทุกหมวดหมู่ย่อย --</option>
                                    {filteredSubCategories.map((sub) => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Salary Min */}
                        <div>
                            <label htmlFor="salary" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <DollarSign size={16} className="text-green-600" />
                                เงินเดือนขั้นต่ำ (บาท)
                            </label>
                            <input
                                id="salary"
                                type="number"
                                placeholder="เช่น 15000"
                                value={salaryMin}
                                onChange={handleSalaryChange}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-medium"
                            />
                        </div>

                        {/* Province */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <MapPin size={16} className="text-red-600" />
                                จังหวัด
                            </label>
                            <SearchableCombobox
                                placeholder="-- เลือกจังหวัด --"
                                fetchFunction={masterDataApi.getProvinces}
                                value={province}
                                onChange={handleProvinceChange}
                                allowCreate={false}
                            />
                        </div>

                        {/* District */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                อำเภอ/เขต
                            </label>
                            <SearchableCombobox
                                placeholder="-- เลือกอำเภอ --"
                                fetchFunction={fetchDistricts}
                                value={district}
                                onChange={handleDistrictChange}
                                disabled={!province?.id}
                                fetchParams={{ provinceId: province?.id }}
                                allowCreate={false}
                            />
                        </div>
                    </div>
                </form>
            </div>

            {/* ✅ Results Section */}
            <div className="container mx-auto px-4 pb-12">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-extrabold text-slate-900">
                        ผลการค้นหา
                        {!isSearching && (
                            <span className="ml-3 text-lg text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border-2 border-orange-100">
                                {totalJobs} งาน
                            </span>
                        )}
                    </h2>
                </div>

                {/* Loading State */}
                {isSearching && (
                    <LoadingSpinner text="กำลังค้นหางาน..." />
                )}

                {/* Empty State */}
                {!isSearching && jobs.length === 0 && (
                    <div className="bg-white rounded-3xl shadow-sm border-2 border-dashed border-slate-200 p-16 text-center">
                        <Briefcase size={80} className="mx-auto text-slate-300 mb-6" />
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">ไม่พบผลการค้นหา</h3>
                        <p className="text-slate-500 text-lg mb-6">ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองดูนะครับ</p>
                        <button
                            onClick={() => {
                                setKeyword("");
                                handleMainCategoryChange({ target: { value: "" } });
                                setProvince(null);
                                setDistrict(null);
                                setSalaryMin("");
                                setPage(1);
                            }}
                            className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-bold transition-all shadow-lg"
                        >
                            ล้างตัวกรอง
                        </button>
                    </div>
                )}

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {!isSearching && jobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            isSaved={savedJobIdSet.has(job.id)}
                            onSaveToggle={handleSaveToggle}
                        />
                    ))}
                </div>

                {/* ✅ Pagination Controls (ตัวแบ่งหน้า) */}
                {!isSearching && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                        {/* ปุ่มย้อนกลับ */}
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {/* ตัวเลขหน้า */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                                // แสดงเฉพาะหน้าใกล้เคียง (Optional Logic for many pages)
                                if (
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= page - 1 && pageNum <= page + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`
                                                w-10 h-10 rounded-lg font-bold text-sm transition-all
                                                ${page === pageNum
                                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
                                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}
                                            `}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (
                                    pageNum === page - 2 ||
                                    pageNum === page + 2
                                ) {
                                    return <span key={pageNum} className="text-slate-400 px-1">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        {/* ปุ่มถัดไป */}
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;