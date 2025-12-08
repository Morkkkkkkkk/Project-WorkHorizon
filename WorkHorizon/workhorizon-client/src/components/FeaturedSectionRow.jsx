// src/components/FeaturedSectionRow.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobApi } from '../api/jobApi.js';
import { serviceApi } from '../api/serviceApi.js';
import JobCard from './JobCard.jsx';
import ServiceCard from './ServiceCard.jsx';
import { ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { BACKEND_URL } from '../api/apiClient.js';

const FeaturedSectionRow = ({ section, savedJobIds = [], onSaveToggle }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. ประกาศฟังก์ชัน fetchData ภายใน useEffect
    const fetchData = async () => {
      if (!section.mainCategoryId) return;

      setIsLoading(true);
      try {
        let data = [];

        if (section.contentType === 'SERVICE') {
          // (1) ถ้าเป็น Service: เรียก serviceApi
          // ส่ง query ว่าง '', และส่ง mainCategoryId
          const res = await serviceApi.search('', section.mainCategoryId);
          data = res;
        } else {
          // (2) ถ้าเป็น Job: เรียก jobApi
          const res = await jobApi.searchJobs({
            mainCategoryId: section.mainCategoryId,
            page: 1,
            limit: 6
          });
          data = res.jobs;
        }

        setItems(data || []);
      } catch (err) {
        console.error("Failed to fetch items", err);
      } finally {
        setIsLoading(false);
      }
    };

    // 2. เรียกใช้ฟังก์ชันทันที (อยู่ใน useEffect เท่านั้น)
    fetchData();
  }, [section]); // Dependencies ถูกต้อง

  if (isLoading || items.length === 0) return null;

  // ลิงก์ดูทั้งหมด
  const viewAllLink = section.contentType === 'SERVICE'
    ? `/services/search?mainCategoryId=${section.mainCategoryId}`
    : `/jobs/search?mainCategoryId=${section.mainCategoryId}`;

  return (
    <div className="py-12 border-b border-slate-100 last:border-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
          {section.title}
          {/* โชว์ป้ายกำกับ ถ้าเป็นงานฟรีแลนซ์ */}
          {section.contentType === 'SERVICE' && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-normal">Freelance</span>}
        </h2>
        <Link to={viewAllLink} className="btn-secondary-outline text-sm">
          ดูทั้งหมด <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>

      <Swiper
        modules={[Navigation]}
        spaceBetween={24}
        slidesPerView={'auto'}
        navigation
        className="pb-2"
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
      >
        {items.map(item => (
          <SwiperSlide key={item.id} style={{ width: 'auto' }}>
            <div className="h-full w-72 md:w-auto">
              {/* ✅ เลือกแสดงการ์ดให้ถูกประเภท */}
              {section.contentType === 'SERVICE' ? (
                <ServiceCard service={item} />
              ) : (
                <JobCard
                  job={item}
                  isSaved={savedJobIds.includes(item.id)}
                  onSaveToggle={onSaveToggle}
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FeaturedSectionRow;