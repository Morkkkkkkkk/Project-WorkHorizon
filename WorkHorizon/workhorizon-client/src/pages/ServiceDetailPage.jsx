import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { serviceApi } from '../api/serviceApi';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  MessageCircle,
  Share2,
  ShieldCheck,
  Star,
  CheckCircle2,
  Briefcase,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]); // ✅ State สำหรับงานที่เกี่ยวข้อง
  const [isLoading, setIsLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  // Helper to resolve image URLs
  const getImageUrl = (url) =>
    url ? (url.startsWith("http") ? url : `${BACKEND_URL}${url}`) : null;

  // Fetch Main Service Data
  useEffect(() => {
    const fetchService = async () => {
      try {
        setIsLoading(true);
        const data = await serviceApi.getById(id);
        setService(data);
      } catch (err) {
        console.error(err);
        toast.error("ไม่สามารถโหลดข้อมูลบริการได้");
      } finally {
        setIsLoading(false);
      }
    };
    fetchService();
  }, [id]);

  // ✅ Fetch Related Services (เมื่อได้ข้อมูล service มาแล้ว)
  useEffect(() => {
    if (service?.mainCategoryId) {
      const fetchRelated = async () => {
        try {
          // ค้นหา Service ในหมวดหมู่เดียวกัน
          const res = await serviceApi.search(null, service.mainCategoryId);
          const servicesList = res.services || res.data || res; // รองรับ response structure หลายแบบ
          
          if (Array.isArray(servicesList)) {
            // กรองตัวปัจจุบันออก และเอามาแค่ 4 อันดับแรก
            const others = servicesList
              .filter(s => s.id !== service.id)
              .slice(0, 4);
            setRelatedServices(others);
          }
        } catch (err) {
          console.error("Error fetching related services:", err);
        }
      };
      fetchRelated();
    }
  }, [service]);

  if (isLoading) return <LoadingSpinner text="กำลังโหลดรายละเอียด..." />;
  if (!service) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-slate-300 mb-4"><ShieldCheck size={64} /></div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">ไม่พบข้อมูลบริการ</h2>
      <Link to="/" className="text-blue-600 hover:underline">กลับหน้าหลัก</Link>
    </div>
  );

  const coverImage = getImageUrl(service.coverImage);
  const freelancerImg = getImageUrl(service.freelancer?.profileImageUrl) ||
    `https://placehold.co/100x100/E0E0E0/777?text=${service.freelancer?.firstName?.charAt(0) || 'U'}`;

  const handleChatClick = async () => {
    if (!user) {
      toast.info('กรุณาเข้าสู่ระบบเพื่อติดต่อฟรีแลนซ์');
      navigate('/login');
      return;
    }
    if (user.id === service.freelancerId) {
      toast.error('คุณไม่สามารถแชทกับตัวเองได้');
      return;
    }
    try {
      const { conversationId } = await serviceApi.getConversationByService(service.id);
      navigate(`/chat/${conversationId}`);
    } catch (err) {
      toast.error("ไม่สามารถเริ่มแชทได้: " + (err.response?.data?.error || err.message));
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // ✅ Platform Features (ใช้ข้อมูลกลางแทน เพราะใน DB ไม่มี Field เก็บจุดเด่นราย Service)
  const platformFeatures = [
    { icon: ShieldCheck, text: "การันตีคืนเงิน" },
    { icon: CheckCircle2, text: "ฟรีแลนซ์ยืนยันตัวตน" },
    { icon: FileCheck, text: "ได้รับไฟล์งานจริง" },
    { icon: Sparkles, text: "ไม่มีค่าธรรมเนียมแฝง" },
  ];

  // ✅ Standard FAQs (ข้อมูลกลางของระบบ)
  const platformFaqs = [
    { q: "ฉันจะจ้างงานฟรีแลนซ์คนนี้ได้อย่างไร?", a: "กดปุ่ม 'ทักแชทสอบถาม' เพื่อพูดคุยรายละเอียด เมื่อตกลงกันได้ ฟรีแลนซ์จะส่งใบเสนอราคาให้คุณกดจ้างและชำระเงิน" },
    { q: "เงินของฉันปลอดภัยหรือไม่?", a: "ปลอดภัย 100% ระบบจะเป็นตัวกลางถือเงินไว้ จนกว่าคุณจะได้รับงานและกดยืนยันรับงาน เงินจึงจะถูกโอนให้ฟรีแลนซ์" },
    { q: "ถ้างานไม่ตรงตามที่ตกลง ทำอย่างไร?", a: "คุณสามารถกด 'ขอแก้ไขงาน' หรือติดต่อทีมงาน Support เพื่อระงับการจ่ายเงินได้ทันที" },
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 font-sans text-slate-800">

      {/* --- Breadcrumb & Actions --- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium">
            <ArrowLeft size={20} /> ย้อนกลับ
          </Link>
          <button className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="แชร์หน้านี้">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* --- LEFT COLUMN (Main Content) --- */}
          <div className="lg:col-span-8 space-y-8">

            {/* 1. Header & Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                {service.title}
              </h1>
              
              <div className="flex flex-wrap gap-2 mb-6">
                 {service.mainCategory && (
                   <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                      {service.mainCategory.name}
                   </span>
                 )}
                 <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
                    งานบริการ
                 </span>
              </div>

              {/* Freelancer Profile */}
              <div className="flex items-center gap-4 py-4 border-y border-slate-100">
                <img src={freelancerImg} alt="Freelancer" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                  <Link to={`/freelancers/${service.freelancerId}`} className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1">
                    {service.freelancer?.firstName} {service.freelancer?.lastName}
                    {service.freelancer?.freelancerProfile?.isVerified && <CheckCircle2 size={18} className="text-blue-500" />}
                  </Link>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1 text-yellow-500 font-bold">
                      <Star size={14} className="fill-current" /> 
                      {/* ถ้าไม่มี Rating ให้แสดง Default */}
                      {service.freelancer?.freelancerProfile?.reviews?.length > 0 ? "4.9" : "New Seller"}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>{service.freelancer?.freelancerProfile?.professionalTitle || "ฟรีแลนซ์มืออาชีพ"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Cover Image */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100 relative group aspect-video">
              {coverImage ? (
                <img src={coverImage} alt={service.title} className="w-full h-full object-cover object-center" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                  <span className="text-sm">ไม่มีรูปภาพปก</span>
                </div>
              )}
            </div>

            {/* 3. Platform Highlights (Generic) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {platformFeatures.map((feat, idx) => (
                 <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-2">
                    <feat.icon size={24} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-600">{feat.text}</span>
                 </div>
               ))}
            </div>

            {/* 4. Description */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase className="text-slate-400" size={24} /> รายละเอียดงาน
              </h3>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                {service.description || "ไม่มีรายละเอียดเพิ่มเติม"}
              </div>
            </div>

            {/* 5. FAQ Section (Static Platform Info) */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
               <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <HelpCircle className="text-slate-400" size={24} /> ขั้นตอนการทำงาน
               </h3>
               <div className="space-y-3">
                  {platformFaqs.map((faq, index) => (
                    <div key={index} className="border border-slate-100 rounded-xl overflow-hidden">
                       <button onClick={() => toggleFaq(index)} className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
                          <span className="font-bold text-slate-700 text-sm">{faq.q}</span>
                          {openFaq === index ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                       </button>
                       {openFaq === index && (
                         <div className="p-4 bg-white text-sm text-slate-600 border-t border-slate-100">
                           {faq.a}
                         </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>

            {/* 6. Reviews (Placeholder if no real reviews yet) */}
            {/* หมายเหตุ: ตอนนี้ใน Schema Service ยังไม่ได้ Relation กับ Review โดยตรง (Review อยู่ที่ FreelancerProfile) 
                ดังนั้นอาจจะต้องดึง Review ของ Freelancer มาโชว์ หรือซ่อนไปก่อนถ้ายังไม่ได้ทำ API ส่วนนี้ */}
            
          </div>

          {/* --- RIGHT COLUMN (Sticky Sidebar) --- */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">

              {/* Pricing Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                
                <div className="p-6">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-slate-500 font-medium">ราคาเริ่มต้น</span>
                    <span className="text-4xl font-extrabold text-slate-900">฿{Number(service.price).toLocaleString()}</span>
                  </div>
                  
                  <p className="text-sm text-slate-500 mb-6 line-clamp-2">{service.title}</p>

                  {/* ✅ Package Details: ใช้ข้อมูลกลาง เพราะ DB ไม่มี duration/revisions */}
                  <div className="space-y-3 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <div className="flex items-center justify-between text-sm text-slate-700">
                        <span className="flex items-center gap-2 font-bold"><Clock size={16} className="text-blue-500"/> ระยะเวลาทำงาน</span>
                        <span className="text-slate-500">ตกลงกันในแชท</span>
                     </div>
                     <div className="flex items-center justify-between text-sm text-slate-700">
                        <span className="flex items-center gap-2 font-bold"><FileCheck size={16} className="text-green-500"/> การแก้ไขงาน</span>
                        <span className="text-slate-500">ตามตกลง</span>
                     </div>
                  </div>

                  <button
                    onClick={handleChatClick}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-lg hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={24} />
                    ทักแชทเพื่อจ้างงาน
                  </button>
                  <p className="text-xs text-center text-slate-400 mt-3">
                     พูดคุยขอบเขตงานและราคาก่อนเริ่มงาน
                  </p>
                </div>
                
                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                   <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                      <ShieldCheck size={14} /> คุ้มครองการชำระเงิน
                   </div>
                </div>
              </div>

              {/* Freelancer Mini Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                 <h4 className="font-bold text-slate-900 mb-4">ผู้ให้บริการ</h4>
                 <div className="flex items-center gap-3 mb-4">
                    <img src={freelancerImg} className="w-12 h-12 rounded-full border border-slate-200 object-cover" alt="profile"/>
                    <div className="overflow-hidden">
                       <div className="font-bold text-sm text-slate-800 truncate">{service.freelancer?.firstName} {service.freelancer?.lastName}</div>
                       <div className="text-xs text-slate-500 truncate">{service.freelancer?.email}</div>
                    </div>
                 </div>
                 <Link to={`/freelancers/${service.freelancerId}`} className="block w-full py-2 border border-slate-300 rounded-lg text-center text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                    ดูโปรไฟล์และผลงาน
                 </Link>
              </div>

            </div>
          </div>

        </div>

        {/* --- Section: Other Services (REAL DATA) --- */}
        {relatedServices.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">งานอื่น ๆ ในหมวดเดียวกัน</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {relatedServices.map((item) => (
                  <Link to={`/services/${item.id}`} key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer block h-full flex flex-col">
                      <div className="h-40 bg-slate-200 relative overflow-hidden">
                        {item.coverImage ? (
                          <img src={getImageUrl(item.coverImage)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">No Image</div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <img 
                              src={getImageUrl(item.freelancer?.profileImageUrl) || `https://placehold.co/50x50/E0E0E0/777?text=${item.freelancer?.firstName?.charAt(0)}`} 
                              className="w-6 h-6 rounded-full object-cover bg-slate-300" 
                              alt="f"
                            />
                            <span className="text-xs font-bold text-slate-600 truncate flex-1">
                              {item.freelancer?.firstName} {item.freelancer?.lastName}
                            </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2 group-hover:text-blue-600 flex-1">
                          {item.title}
                        </h4>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Star size={12} className="text-yellow-400 fill-current"/> New
                            </span>
                            <span className="font-bold text-blue-600">฿{Number(item.price).toLocaleString()}</span>
                        </div>
                      </div>
                  </Link>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ServiceDetailPage;