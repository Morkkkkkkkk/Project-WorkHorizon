import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { serviceApi } from '../api/serviceApi';
import { paymentApi } from '../api/paymentApi'; // ✅ Import Payment API
import { useAuth } from '../contexts/AuthContext'; // ✅ Import Auth
import { BACKEND_URL } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ReviewForm from '../components/ReviewForm';
import {
  User,
  Clock,
  ArrowLeft,
  MessageCircle,
  Share2,
  ShieldCheck,
  Star,
  MapPin,
  CheckCircle2,
  Phone,
  CreditCard,
  Wallet,
  Building2,
  Briefcase
} from 'lucide-react';
import { toast } from 'react-toastify';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth(); // ✅ Get Current User
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Payment States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('WALLET');
  const [isPaying, setIsPaying] = useState(false);
  const [creditCardNum, setCreditCardNum] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await serviceApi.getById(id);
        setService(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (isLoading) return <LoadingSpinner text="กำลังโหลดรายละเอียด..." />;
  if (!service) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-slate-300 mb-4">
        <ShieldCheck size={64} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">ไม่พบข้อมูลบริการ</h2>
      <p className="text-slate-500 mb-6">บริการที่คุณตามหาอาจถูกลบหรือไม่มีอยู่จริง</p>
      <Link to="/" className="btn-primary">
        กลับหน้าหลัก
      </Link>
    </div>
  );

  // Helper to resolve image URLs
  const getImageUrl = (url) =>
    url ? (url.startsWith("http") ? url : `${BACKEND_URL}${url}`) : null;

  const coverImage = getImageUrl(service.coverImage);
  const freelancerImg =
    getImageUrl(service.freelancer?.profileImageUrl) ||
    `https://placehold.co/100x100/E0E0E0/777?text=${service.freelancer?.firstName?.charAt(0) || 'U'}`;

  const handleChatClick = async () => {
    try {
      const { conversationId } = await serviceApi.getConversationByService(service.id);
      navigate(`/chat/${conversationId}`);
    } catch (err) {
      toast.error("ไม่สามารถเริ่มแชทได้: " + (err.response?.data?.error || err.message));
    }
  };

  const handleReviewSubmit = (result) => {
    toast.success('ส่งรีวิวเรียบร้อยแล้ว!');
    setIsReviewModalOpen(false);
  };

  // ✅ Handle Payment Logic
  const handleHireClick = () => {
    if (!user) {
      toast.info('กรุณาเข้าสู่ระบบก่อนจ้างงาน');
      navigate('/login');
      return;
    }
    // ถ้าตัวเองเป็นคนสร้างบริการ ห้ามจ้างตัวเอง
    if (user.id === service.freelancerId) {
      toast.error('คุณไม่สามารถจ้างงานตัวเองได้');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const processPayment = async () => {
    if (paymentMethod === 'CREDIT_CARD' && !creditCardNum) {
      toast.error('กรุณาระบุเลขบัตรเครดิต');
      return;
    }

    setIsPaying(true);
    try {
      const payload = {
        payerId: user.id,
        receiverId: service.freelancerId, // ✅ Direct Transfer to Freelancer
        amount: service.price,
        method: paymentMethod,
        cardNumber: paymentMethod === 'CREDIT_CARD' ? creditCardNum : undefined
        // workId: null (ไม่ได้สร้าง Work record ในที่นี้ ตาม Scope โจทย์)
      };

      const res = await paymentApi.charge(payload);

      if (res.data.success) {
        toast.success(`ชำระเงิน ${service.price.toLocaleString()} บาท เรียบร้อย!`);
        setIsPaymentModalOpen(false);
        // อาจจะ navigate ไปหน้า Chat หรือ Success Page
      } else {
        toast.error(res.data.message || 'ชำระเงินไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการชำระเงิน');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>

      {/* --- Breadcrumb & Header --- */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 transition-all duration-300">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            ย้อนกลับ
          </Link>
          <div className="flex gap-2">
            <button className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="แชร์">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* --- LEFT COLUMN (Content) --- */}
          <div className="lg:col-span-8 space-y-8">

            {/* 1. Hero Section */}
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {service.title}
              </h1>

              {/* Freelancer Mini-Badge */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                <img
                  src={freelancerImg}
                  alt="Freelancer"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
                    {service.freelancer?.firstName} {service.freelancer?.lastName}
                    <CheckCircle2 size={16} className="text-blue-500" />
                  </span>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={14} className="fill-current" />
                      <span className="font-bold text-slate-700">New Seller</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Cover Image */}
            <div className="rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 bg-slate-100 relative group">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={service.title}
                  className="w-full h-auto max-h-[500px] object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="h-96 flex items-center justify-center text-slate-400 bg-slate-50">
                  No Cover Image
                </div>
              )}
            </div>

            {/* 3. Description */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                รายละเอียดงาน
              </h3>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                {service.description}
              </div>
            </div>

            {/* 4. About The Seller */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">
                เกี่ยวกับฟรีแลนซ์
              </h3>
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                <Link to={`/freelancers/${service.freelancerId}`} className="group relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <img
                    src={freelancerImg}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg relative z-10 group-hover:scale-105 transition-transform duration-300"
                    alt="Freelancer"
                  />
                </Link>
                <div className="flex-1 space-y-4">
                  <div>
                    <Link
                      to={`/freelancers/${service.freelancerId}`}
                      className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {service.freelancer?.firstName} {service.freelancer?.lastName}
                    </Link>
                    <p className="text-slate-500 font-medium mt-1">
                      {service.freelancer?.freelancerProfile?.professionalTitle || "Freelancer Professional"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                      <MapPin size={16} className="text-red-500" />
                      <span className="font-medium">Thailand</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      to={`/freelancers/${service.freelancerId}`}
                      className="inline-flex items-center justify-center px-6 py-2.5 border border-slate-300 shadow-sm text-sm font-medium rounded-full text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
                    >
                      ดูโปรไฟล์
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN (Sticky Sidebar) --- */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">

              {/* Pricing Card */}
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden ring-1 ring-slate-900/5">
                <div className="p-8 border-b border-slate-50 bg-gradient-to-b from-slate-50/50 to-white">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">ราคาเริ่มต้น</span>
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      ฿{service.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-8 space-y-4">

                  {/* ✅ Hire/Pay Button */}
                  <button
                    onClick={handleHireClick}
                    className="w-full relative flex items-center justify-center py-4 px-6 text-base font-bold rounded-2xl text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30 transition-all duration-200"
                  >
                    <Briefcase size={20} className="mr-2" />
                    จ้างงานทันที
                  </button>

                  <button
                    onClick={handleChatClick}
                    className="w-full flex items-center justify-center py-4 px-6 border border-slate-200 text-base font-bold rounded-2xl text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 transition-all duration-200"
                  >
                    <MessageCircle size={20} className="mr-2" />
                    ทักแชทสอบถาม
                  </button>

                  {/* Review Button */}
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="w-full flex items-center justify-center py-3 px-6 text-sm font-bold rounded-2xl text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-all duration-200"
                  >
                    <Star size={16} className="mr-2 fill-current" />
                    เขียนรีวิว
                  </button>

                  {/* Reviews Section */}
                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-4 text-sm flex items-center gap-2">
                      <Star size={16} className="text-yellow-500 fill-current" />
                      รีวิวจากลูกค้า
                    </h4>
                    {service.reviews && service.reviews.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {service.reviews.map((review, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-slate-700">★ {review.rating}/5</span>
                            </div>
                            <p className="text-xs text-slate-600">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-xs text-slate-400">ยังไม่มีรีวิว</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 p-8">
                <h4 className="font-bold text-slate-900 mb-6 text-lg">ข้อมูลติดต่อ</h4>
                <div className="space-y-5">
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium mb-0.5">อีเมล</p>
                      <p className="text-sm font-medium text-slate-700 truncate" title={service.freelancer?.email}>
                        {service.freelancer?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ✅ Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="รีวิวงานฟรีแลนซ์"
      >
        <ReviewForm
          workId={service.id}
          freelancerId={service.freelancerId}
          jobTitle={service.title}
          onSubmit={handleReviewSubmit}
        />
      </Modal>

      {/* ✅ Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="ยืนยันการชำระเงิน"
      >
        <div className="p-4 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-700 mb-1">{service.title}</h4>
            <p className="text-2xl font-extrabold text-blue-600">฿{service.price.toLocaleString()}</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-3 block uppercase">เลือกช่องทางการชำระเงิน</label>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('WALLET')}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${paymentMethod === 'WALLET' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'WALLET' ? 'bg-purple-100' : 'bg-slate-100'}`}>
                  <Wallet size={20} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-sm">Wallet Balance</p>
                  <p className="text-xs opacity-70">หักเงินจากกระเป๋าเงินของคุณ</p>
                </div>
                {paymentMethod === 'WALLET' && <CheckCircle2 size={20} className="text-purple-600" />}
              </button>

              <button
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${paymentMethod === 'BANK_TRANSFER' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'BANK_TRANSFER' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  <Building2 size={20} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-sm">Bank Transfer</p>
                  <p className="text-xs opacity-70">โอนเงินผ่านบัญชีธนาคาร</p>
                </div>
                {paymentMethod === 'BANK_TRANSFER' && <CheckCircle2 size={20} className="text-blue-600" />}
              </button>

              <button
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${paymentMethod === 'CREDIT_CARD' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'CREDIT_CARD' ? 'bg-green-100' : 'bg-slate-100'}`}>
                  <CreditCard size={20} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-sm">Credit Card</p>
                  <p className="text-xs opacity-70">ชำระผ่านบัตรเครดิต</p>
                </div>
                {paymentMethod === 'CREDIT_CARD' && <CheckCircle2 size={20} className="text-green-600" />}
              </button>
            </div>
          </div>

          {/* Credit Card Input */}
          {paymentMethod === 'CREDIT_CARD' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-bold text-slate-500 mb-1 block">หมายเลขบัตร (Test: 4242...)</label>
              <input
                type="text"
                value={creditCardNum}
                onChange={(e) => setCreditCardNum(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl outline-none"
                placeholder="0000 0000 0000 0000"
              />
            </div>
          )}

          <button
            onClick={processPayment}
            disabled={isPaying}
            className="w-full py-4 text-white font-bold rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg"
          >
            {isPaying ? "กำลังดำเนินการ..." : `ยืนยันชำระเงิน ฿${service.price.toLocaleString()}`}
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default ServiceDetailPage;
