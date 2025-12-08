import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MapPin, BriefcaseBusiness, CircleDollarSign, Building2, ShieldCheck, Clock } from 'lucide-react';
import { BACKEND_URL } from '../api/apiClient.js';

const formatSalary = (min, max, isNegotiable) => {
  if (isNegotiable) return 'ตามตกลง';
  if (min && max) return `฿${min.toLocaleString()} - ฿${max.toLocaleString()}`;
  if (min) return `เริ่มต้น ฿${min.toLocaleString()}`;
  return 'ไม่ระบุ';
};

const JobCard = ({ job, isSaved, onSaveToggle }) => {
  const { isJobSeeker } = useAuth();

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSaveToggle) {
      onSaveToggle(job.id, !isSaved);
    }
  };

  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  let cardImageUrl;
  let cardImageAlt = `${job.company.companyName} logo`;

  if (job.images && job.images.length > 0) {
    cardImageUrl = getImageUrl(job.images[0].url);
    cardImageAlt = job.title;
  }
  else {
    cardImageUrl = getImageUrl(job.company.logoUrl) ||
      `https://placehold.co/300x200/E0E0E0/777?text=${job.company.companyName}`;
  }

  const companyLogoUrl = getImageUrl(job.company.logoUrl) ||
    `https://placehold.co/50x50/E0E0E0/777?text=${job.company.companyName.charAt(0)}`;

  if (job.images && job.images.length > 0) {
    cardImageUrl = getImageUrl(job.images[0].url);
    cardImageAlt = job.title;
  }
  else {
    cardImageUrl = `https://placehold.co/300x200/E0E0E0/777?text=${job.company.companyName.charAt(0)}`;
    cardImageAlt = `${job.company.companyName} logo placeholder`;
  }

  const displaySalary = formatSalary(job.salaryMin, job.salaryMax, job.isSalaryNegotiable);

  return (
    <div
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm 
                 hover:shadow-xl hover:shadow-orange-900/5 hover:-translate-y-1 transition-all duration-300 
                 flex flex-col h-full overflow-hidden"
    >
      {/* 💖 Save Button (z-30) */}
      {(isJobSeeker) && (
        <button
          onClick={handleSaveClick}
          className="absolute top-3 right-3 z-30 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-slate-100
                     text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all duration-200 group/btn"
          title={isSaved ? 'เลิกบันทึก' : 'บันทึกงานนี้'}
        >
          <Heart
            size={18}
            className={`${isSaved ? 'text-red-500 fill-red-500' : 'group-hover/btn:scale-110 transition-transform'}`}
          />
        </button>
      )}

      {/* --- Image and Price Tag --- */}
      <div className="relative z-20 aspect-[4/3] overflow-hidden bg-slate-50">
        <Link to={`/jobs/${job.id}`} className="block w-full h-full">
          <img
            src={cardImageUrl}
            alt={cardImageAlt}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) =>
              (e.currentTarget.src = 'https://placehold.co/300x200/E0E0E0/777?text=No+Image')
            }
          />
        </Link>

        {/* Salary Tag - Modern Style */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/50 flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-0.5">
            {job.isSalaryNegotiable ? 'ตามตกลง' : 'เงินเดือน'}
          </span>
          <span className="text-sm font-extrabold text-orange-600 leading-none">
            {displaySalary}
          </span>
        </div>
      </div>

      {/* --- Content Body --- */}
      <div className="p-5 flex flex-col flex-grow relative z-10">

        {/* Job Title Link */}
        <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-3 group-hover:text-orange-600 transition-colors leading-snug">
          <Link to={`/jobs/${job.id}`}>
            {job.title}
          </Link>
        </h3>

        {/* Location & Type */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
            <MapPin size={12} />
            <span className="truncate max-w-[100px]">{job.province.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-100">
            <Clock size={12} />
            <span>{job.jobType.name}</span>
          </div>
        </div>

        {/* Company Info */}
        <div className="mt-auto pt-4 flex items-center gap-3 border-t border-slate-50">
          <Link to={`/company/${job.company.id}`} className="shrink-0 relative">
            <img
              src={companyLogoUrl}
              alt={`${job.company.companyName} logo`}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-orange-100 transition-colors"
            />
            {job.company.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <ShieldCheck size={12} className="text-orange-500 fill-orange-500" />
              </div>
            )}
          </Link>
          <div className="flex flex-col min-w-0">
            <Link
              to={`/company/${job.company.id}`}
              className="text-sm font-bold text-slate-700 truncate hover:text-orange-600 transition-colors"
            >
              {job.company.companyName}
            </Link>
            <span className="text-xs text-slate-400 truncate">
              {job.company.industry || "บริษัทชั้นนำ"}
            </span>
          </div>
        </div>
      </div>

      {/* Ghost Link */}
      <Link
        to={`/jobs/${job.id}`}
        className="absolute inset-0 z-0"
        aria-label={`View job: ${job.title}`}
      />
    </div>
  );
};

export default JobCard;