import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle } from 'lucide-react';
import contactApi from '../api/contactApi';

const ContactUsPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error', null

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        try {
            await contactApi.createContactRequest(formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                        ติดต่อเรา
                    </h2>
                    <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                        มีข้อสงสัยหรือต้องการความช่วยเหลือ? ส่งข้อความหาเราได้ตลอด 24 ชั่วโมง
                        ทีมงาน Admin ยินดีให้บริการ
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Contact Info */}
                    <div className="bg-blue-600 rounded-3xl p-10 text-white shadow-xl shadow-blue-200">
                        <h3 className="text-2xl font-bold mb-6">ข้อมูลติดต่อ</h3>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-xl">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold mb-1">เบอร์โทรศัพท์</h4>
                                    <p className="text-blue-100">+66 2 123 4567</p>
                                    <p className="text-blue-100">+66 8 1234 5678</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-xl">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold mb-1">อีเมล</h4>
                                    <p className="text-blue-100">admin@workhorizon.com</p>
                                    <p className="text-blue-100">support@workhorizon.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-xl">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold mb-1">ที่อยู่</h4>
                                    <p className="text-blue-100 leading-relaxed">
                                        123 อาคารเวิร์คฮอไรซอน ชั้น 15 ถนนพระราม 9 <br />
                                        แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Decor */}
                        <div className="mt-20 pt-10 border-t border-white/20 text-center text-blue-100 text-sm">
                            WorkHorizon Platform © 2024
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">ส่งข้อความถึง Admin</h3>

                        {status === 'success' && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3">
                                <CheckCircle size={24} className="flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">ส่งข้อความสำเร็จ!</p>
                                    <p className="text-sm">เราได้รับข้อความของคุณแล้ว และจะติดต่อกลับโดยเร็วที่สุด</p>
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
                                <AlertCircle size={24} className="flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">เกิดข้อผิดพลาด</p>
                                    <p className="text-sm">ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="ระบุชื่อของคุณ"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">อีเมลติดต่อกลับ</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="name@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">หัวข้อเรื่อง</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="เช่น แจ้งปัญหาการใช้งาน, สอบถามข้อมูล"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">ข้อความ</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                    placeholder="รายละเอียดที่คุณต้องการแจ้ง..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'กำลังส่ง...' : (
                                    <>
                                        <span>ส่งข้อความ</span>
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUsPage;
