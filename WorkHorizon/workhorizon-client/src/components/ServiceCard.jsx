import React from 'react';
import { Link } from 'react-router-dom';
import { BACKEND_URL } from '../api/apiClient.js';
import { Star, ShieldCheck } from 'lucide-react';

const ServiceCard = ({ service }) => {
  const getImageUrl = (url) => url ? (url.startsWith('http') ? url : `${BACKEND_URL}${url}`) : null;

  const coverImage = getImageUrl(service.coverImage) || `https://placehold.co/300x200/E0E0E0/777?text=${service.title.charAt(0)}`;
  const freelancerImg = getImageUrl(service.freelancer?.profileImageUrl) || `https://placehold.co/50x50/E0E0E0/777?text=User`;
  const freelancerName = `${service.freelancer?.firstName} ${service.freelancer?.lastName}`;
  const professionalTitle = service.freelancer?.freelancerProfile?.professionalTitle;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-orange-900/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <Link to={`/services/${service.id}`} className="block w-full h-full">
          <img
            src={coverImage}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </Link>
        {/* Price Tag - Modern Style */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/50 flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-0.5">เริ่มต้น</span>
          <span className="text-sm font-extrabold text-orange-600 leading-none">฿{service.price.toLocaleString()}</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="font-bold text-slate-800 text-lg mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
          <Link to={`/services/${service.id}`}>
            {service.title}
          </Link>
        </h3>

        {/* Freelancer Info */}
        <div className="mt-auto pt-4 flex items-center gap-3 border-t border-slate-50">
          <Link to={`/freelancers/${service.freelancer?.id}`} className="shrink-0 relative">
            <img
              src={freelancerImg}
              alt={freelancerName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-orange-100 transition-colors"
            />
            {/* Mock Verified Badge for Freelancer (if applicable in future) */}
            {/* <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <ShieldCheck size={12} className="text-orange-500 fill-orange-500" />
            </div> */}
          </Link>
          <div className="flex flex-col min-w-0">
            <Link
              to={`/freelancers/${service.freelancer?.id}`}
              className="text-sm font-bold text-slate-700 truncate hover:text-orange-600 transition-colors"
            >
              {freelancerName}
            </Link>
            <span className="text-xs text-slate-400 truncate">
              {professionalTitle || "Freelancer"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;