import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { serviceApi } from '../api/serviceApi';
import { masterDataApi } from '../api/masterDataApi';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, X, DollarSign, MapPin, LayoutGrid, ChevronDown } from 'lucide-react';

const ServiceSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. รับค่าจาก URL Query Params
  const initialQuery = searchParams.get('q') || '';
  const mainCategoryId = searchParams.get('mainCategoryId') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const locationParam = searchParams.get('location') || '';

  // 2. States
  const [query, setQuery] = useState(initialQuery);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(mainCategoryId);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [location, setLocation] = useState(locationParam);

  // Categories from API
  const [categories, setCategories] = useState([]);

  // 3. Fetch categories สำหรับ filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await masterDataApi.getMainCategories();
        setCategories(cats || []);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  // 4. ดึงข้อมูล Services เมื่อ URL เปลี่ยน
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        // NOTE: serviceApi.search อาจต้องรองรับ filters เพิ่มเติมจาก backend
        // ตอนนี้ส่งไปแค่ query และ mainCategoryId
        // ในอนาคตอาจต้องปรับ API ให้รับ minPrice, maxPrice, location
        const data = await serviceApi.search(initialQuery, mainCategoryId);

        // Client-side filtering (ถ้า backend ยังไม่รองรับ)
        let filteredData = data || [];

        // Filter by price range
        if (minPriceParam) {
          filteredData = filteredData.filter(s => s.price >= parseFloat(minPriceParam));
        }
        if (maxPriceParam) {
          filteredData = filteredData.filter(s => s.price <= parseFloat(maxPriceParam));
        }

        // Filter by location (simple text match)
        if (locationParam) {
          filteredData = filteredData.filter(s =>
            s.location?.toLowerCase().includes(locationParam.toLowerCase())
          );
        }

        setServices(filteredData);
        setCurrentPage(1); // Reset page on new search/filter
      } catch (err) {
        console.error("Failed to search services", err);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [initialQuery, mainCategoryId, minPriceParam, maxPriceParam, locationParam]);

  // Pagination Logic
  const totalPages = Math.ceil(services.length / ITEMS_PER_PAGE);
  const displayedServices = services.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ฟังก์ชันค้นหาใหม่ (search bar)
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // ฟังก์ชัน Apply Filters
  const applyFilters = (newCategory = selectedCategory) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (newCategory) params.set('mainCategoryId', newCategory);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (location) params.set('location', location);
    setSearchParams(params);
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    // Apply immediate filter when clicking sidebar
    const params = new URLSearchParams(searchParams);
    if (catId) {
      params.set('mainCategoryId', catId);
    } else {
      params.delete('mainCategoryId');
    }
    setSearchParams(params);
  };

  // ฟังก์ชัน Clear Filters
  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setSearchParams({});
  };

  // นับจำนวน active filters
  const activeFiltersCount = [selectedCategory, minPrice, maxPrice, location].filter(Boolean).length;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">

      {/* ========== Header & Search Bar ========== */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <LayoutGrid size={32} className="text-orange-600" />
          ค้นหาบริการฟรีแลนซ์
        </h1>

        {/* Search Bar */}
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-3.5 rounded-full border-2 transition-colors ${isSidebarOpen
              ? 'bg-orange-50 border-orange-200 text-orange-600'
              : 'bg-white border-slate-200 text-slate-500 hover:border-orange-500 hover:text-orange-600'
              }`}
            title={isSidebarOpen ? "ซ่อนหมวดหมู่" : "แสดงหมวดหมู่"}
          >
            <LayoutGrid size={20} />
          </button>

          <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาบริการ เช่น ออกแบบโลโก้, เขียนเว็บไซต์..."
              className="w-full pl-12 pr-24 py-3.5 rounded-full border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none font-medium text-slate-800 shadow-sm"
            />
            <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
            <button
              type="submit"
              className="absolute right-2 top-2 bg-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-600/20"
            >
              ค้นหา
            </button>
          </form>

          {/* Toggle Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-5 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-full hover:border-orange-500 hover:text-orange-600 transition flex items-center gap-2 shadow-sm"
          >
            <Filter size={18} />
            ตัวกรอง
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex gap-8 relative">
        {/* ========== Sidebar (Categories) ========== */}
        <aside
          className={`
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'w-64 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-4 overflow-hidden'}
            shrink-0
          `}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-lg">หมวดหมู่</h2>
              {selectedCategory && (
                <button
                  onClick={() => handleCategorySelect('')}
                  className="text-xs text-orange-600 font-medium hover:underline"
                >
                  ล้างค่า
                </button>
              )}
            </div>

            <div className="space-y-1">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedCategory
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                ทั้งหมด
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat.id
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ========== Main Content ========== */}
        <div className="flex-1 min-w-0">

          {/* ========== Filters Panel (Top) ========== */}
          {showFilters && (
            <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-slate-100 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Filter size={20} className="text-orange-600" />
                  ตัวกรองเพิ่มเติม
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Wrapped in Form for Enter Key support */}
              <form onSubmit={handleFilterSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Min Price Filter */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      <DollarSign size={14} className="inline mr-1" />
                      ราคาต่ำสุด (฿)
                    </label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none font-medium"
                    />
                  </div>

                  {/* Max Price Filter */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      <DollarSign size={14} className="inline mr-1" />
                      ราคาสูงสุด (฿)
                    </label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="ไม่จำกัด"
                      min="0"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none font-medium"
                    />
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      <MapPin size={14} className="inline mr-1" />
                      สถานที่
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="เช่น กรุงเทพ"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition"
                  >
                    ใช้ตัวกรอง
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                  >
                    ล้างทั้งหมด
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========== Active Filters Display ========== */}
          {activeFiltersCount > 0 && (
            <div className="mb-6 flex flex-wrap gap-2 items-center">
              <span className="text-sm font-bold text-slate-600">ตัวกรองที่เลือก:</span>

              {selectedCategory && (
                <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-bold rounded-full flex items-center gap-2">
                  {categories.find(c => c.id === selectedCategory)?.name || 'หมวดหมู่'}
                  <button onClick={() => handleCategorySelect('')}>
                    <X size={14} />
                  </button>
                </span>
              )}

              {minPrice && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-bold rounded-full flex items-center gap-2">
                  ≥ ฿{minPrice}
                  <button onClick={() => { setMinPrice(''); applyFilters(); }}>
                    <X size={14} />
                  </button>
                </span>
              )}

              {maxPrice && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-bold rounded-full flex items-center gap-2">
                  ≤ ฿{maxPrice}
                  <button onClick={() => { setMaxPrice(''); applyFilters(); }}>
                    <X size={14} />
                  </button>
                </span>
              )}

              {location && (
                <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-bold rounded-full flex items-center gap-2">
                  <MapPin size={14} /> {location}
                  <button onClick={() => { setLocation(''); applyFilters(); }}>
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* ========== Results ========== */}
          {isLoading ? (
            <LoadingSpinner text="กำลังค้นหาบริการ..." />
          ) : (
            <>
              {/* Results Count */}
              <p className="text-sm text-slate-600 mb-4">
                พบ <span className="font-bold text-slate-800">{services.length}</span> บริการ
              </p>

              {displayedServices.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
                    {displayedServices.map(service => (
                      <div key={service.id} className="h-full">
                        <ServiceCard service={service} />
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ก่อนหน้า
                      </button>

                      {/* Simple Page Numbers */}
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                          // Show only some pages if too many (Simple logic: first, last, current, neighbors)
                          // For simplicity in this iteration: show all if < 7, otherwise show current window
                          if (totalPages > 7 && Math.abs(currentPage - page) > 2 && page !== 1 && page !== totalPages) {
                            if (Math.abs(currentPage - page) === 3) return <span key={page} className="px-2 text-slate-400">...</span>;
                            return null;
                          }

                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-lg font-bold transition-colors ${currentPage === page
                                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                                  : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ถัดไป
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-slate-300" />
                  </div>
                  <p className="text-lg font-bold text-slate-700 mb-2">ไม่พบบริการที่ค้นหา</p>
                  <p className="text-sm text-slate-500 mb-4">ลองปรับเปลี่ยนคำค้นหาหรือตัวกรอง</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-600/20"
                  >
                    ล้างการค้นหาทั้งหมด
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceSearchPage;