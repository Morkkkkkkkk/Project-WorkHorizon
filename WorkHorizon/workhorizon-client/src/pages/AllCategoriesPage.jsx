import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMainCategories } from '../hooks/useMainCategories';
import { masterDataApi } from '../api/masterDataApi';
import {
    LayoutGrid, ChevronRight, Briefcase, User,
    Code, PenTool, Megaphone, Monitor, DollarSign, Globe, Cpu, Database, Layers
} from 'lucide-react';

// Helper to map category names to icons
const getCategoryIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('tech') || lower.includes('it') || lower.includes('developer')) return <Code size={24} />;
    if (lower.includes('design') || lower.includes('art')) return <PenTool size={24} />;
    if (lower.includes('market') || lower.includes('sale')) return <Megaphone size={24} />;
    if (lower.includes('finance') || lower.includes('account')) return <DollarSign size={24} />;
    if (lower.includes('admin') || lower.includes('support')) return <User size={24} />;
    if (lower.includes('data')) return <Database size={24} />;
    if (lower.includes('product')) return <Layers size={24} />;
    return <LayoutGrid size={24} />;
};

const AllCategoriesPage = () => {
    const { mainCategories, isLoadingMainCats } = useMainCategories();
    const [categoriesWithSubs, setCategoriesWithSubs] = useState([]);
    const [isLoadingFullData, setIsLoadingFullData] = useState(true);
    const [viewMode, setViewMode] = useState('JOBS'); // 'JOBS' | 'SERVICES'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    // Fetch subcategories
    useEffect(() => {
        const fetchAllSubCategories = async () => {
            if (mainCategories.length > 0) {
                setIsLoadingFullData(true);
                try {
                    const results = await Promise.all(
                        mainCategories.map(async (cat) => {
                            try {
                                const subs = await masterDataApi.getSubCategories(cat.id);
                                return { ...cat, subCategories: subs || [] };
                            } catch (err) {
                                console.error(`Failed to fetch subs for ${cat.name}`, err);
                                return { ...cat, subCategories: [] };
                            }
                        })
                    );
                    setCategoriesWithSubs(results);
                } catch (error) {
                    console.error("Error fetching all subcategories", error);
                } finally {
                    setIsLoadingFullData(false);
                }
            } else if (!isLoadingMainCats && mainCategories.length === 0) {
                setIsLoadingFullData(false);
            }
        };

        if (!isLoadingMainCats) {
            fetchAllSubCategories();
        }
    }, [mainCategories, isLoadingMainCats]);

    // Auto-select first category when data loads
    useEffect(() => {
        if (!selectedCategory && categoriesWithSubs.length > 0) {
            setSelectedCategory(categoriesWithSubs[0]);
        }
    }, [categoriesWithSubs, selectedCategory]);

    if (isLoadingMainCats || isLoadingFullData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    const isJobMode = viewMode === 'JOBS';

    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat);
    };

    const getImageUrl = (relativeUrl) => {
        if (!relativeUrl || relativeUrl.startsWith("http")) return relativeUrl;
        return `${BACKEND_URL}${relativeUrl}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>

            {/* Header - Simple & Clean */}
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                            หมวดหมู่งานและบริการ
                        </h1>
                        <p className="text-slate-500 mt-1">
                            เลือกหมวดหมู่เพื่อค้นหาผู้เชี่ยวชาญหรือตำแหน่งงานที่คุณต้องการ
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="bg-slate-100 p-1 rounded-xl inline-flex shadow-inner">
                        <button
                            onClick={() => setViewMode('JOBS')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${isJobMode
                                ? 'bg-white text-blue-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Briefcase size={16} />
                            หางาน
                        </button>
                        <button
                            onClick={() => setViewMode('SERVICES')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${!isJobMode
                                ? 'bg-white text-orange-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <User size={16} />
                            หาฟรีแลนซ์
                        </button>
                    </div>
                </div>
            </div>

            {/* Split Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">

                    {/* Left Sidebar (List) */}
                    <div className="w-full lg:w-1/4 shrink-0">
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden sticky top-8">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-500 text-sm uppercase tracking-wide">
                                รายการหมวดหมู่
                            </div>
                            <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden custom-scroll p-2 space-y-1">
                                {categoriesWithSubs.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategoryClick(cat)}
                                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 group ${selectedCategory?.id === cat.id
                                            ? (isJobMode ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' : 'bg-orange-50 text-orange-700 font-bold shadow-sm')
                                            : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${selectedCategory?.id === cat.id
                                            ? 'bg-white shadow-sm'
                                            : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600'
                                            }`}>
                                            {getCategoryIcon(cat.name)}
                                        </div>
                                        <span className="truncate">{cat.name}</span>
                                        {selectedCategory?.id === cat.id && (
                                            <ChevronRight size={16} className="ml-auto opacity-50" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-grow">
                        {selectedCategory ? (
                            <div className="space-y-6 animate-fadeInUp-fast">
                                {/* Hero Banner of Category */}
                                <Link
                                    to={`${isJobMode ? '/jobs/search' : '/services/search'}?mainCategoryId=${selectedCategory.id}`}
                                    className="block group relative h-56 md:h-72 rounded-3xl overflow-hidden shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 cursor-pointer"
                                >
                                    {/* Background Image with Overlay */}
                                    <div className="absolute inset-0 bg-slate-900">
                                        {selectedCategory.imageUrl && (
                                            <img
                                                src={getImageUrl(selectedCategory.imageUrl)}
                                                alt={selectedCategory.name}
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700 mix-blend-overlay"
                                            />
                                        )}
                                        {/* Main Gradient - Solid Dark to Light/Transparent */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-800/90 to-transparent z-10"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="absolute inset-0 z-20 p-8 md:p-10 flex flex-col justify-center items-start text-white">
                                        {/* Badge */}
                                        <div className="px-4 py-1.5 rounded-full text-xs font-bold mb-4 bg-blue-600 text-white shadow-lg shadow-blue-600/30 tracking-wide">
                                            แนะนำ
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight group-hover:text-blue-200 transition-colors">
                                            {selectedCategory.name}
                                        </h2>

                                        {/* Description */}
                                        <p className="text-slate-300 text-lg mb-8 max-w-xl font-light leading-relaxed">
                                            รวมงานและบริการคุณภาพในหมวดหมู่ {selectedCategory.name} ค้นหาเลยเพื่อรับโอกาสที่ดีที่สุดสำหรับคุณ
                                        </p>

                                        {/* Button */}
                                        <div className="flex items-center gap-3 px-6 py-3 rounded-full border-2 border-slate-400/50 bg-white/5 hover:bg-white text-white hover:text-slate-900 font-bold text-sm transition-all duration-300">
                                            ดูทั้งหมดในหมวดนี้
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </Link>

                                {/* Subcategories Grid */}
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                            <LayoutGrid size={18} />
                                        </div>
                                        หมวดหมู่ย่อย
                                    </h3>

                                    {selectedCategory.subCategories && selectedCategory.subCategories.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {selectedCategory.subCategories.map((sub) => (
                                                <Link
                                                    key={sub.id}
                                                    to={`${isJobMode ? '/jobs/search' : '/services/search'}?mainCategoryId=${selectedCategory.id}&subCategoryId=${sub.id}`}
                                                    className="group relative p-5 bg-white border border-slate-100 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <div className="relative flex items-center justify-between z-10">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-white text-slate-400 group-hover:text-orange-500 flex items-center justify-center transition-all shadow-sm group-hover:shadow-md">
                                                                <ChevronRight size={18} className="group-hover:rotate-0 rotate-0 transition-transform" />
                                                            </div>
                                                            <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                                                                {sub.name}
                                                            </span>
                                                        </div>
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                            <ChevronRight size={14} className="text-orange-600" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 px-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
                                                <LayoutGrid size={32} />
                                            </div>
                                            <p className="text-slate-500 font-medium">ยังไม่มีหมวดหมู่ย่อยในขณะนี้</p>
                                            <p className="text-sm text-slate-400 mt-1">โปรดลองเลือกหมวดหมู่อื่นดูสิ</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                เลือกหมวดหมู่ทางซ้ายเพื่อดูรายละเอียด
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllCategoriesPage;
