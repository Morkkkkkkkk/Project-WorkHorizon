import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-6 group">
                            <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-1.5 rounded-lg shadow-lg shadow-orange-600/20 group-hover:scale-105 transition-transform duration-300">
                                <Briefcase className="w-6 h-6" strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-slate-900">
                                WorkHorizon
                            </span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            แพลตฟอร์มรวบรวมงานและฟรีแลนซ์คุณภาพอันดับ 1 ของไทย
                            เชื่อมต่อโอกาสทางอาชีพที่ใช่สำหรับคุณ
                        </p>
                        <div className="flex gap-4">
                            <SocialLink href="#" icon={<Facebook size={18} />} label="Facebook" />
                            <SocialLink href="#" icon={<Twitter size={18} />} label="Twitter" />
                            <SocialLink href="#" icon={<Instagram size={18} />} label="Instagram" />
                            <SocialLink href="#" icon={<Linkedin size={18} />} label="LinkedIn" />
                        </div>
                    </div>

                    {/* For Job Seekers */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-6">สำหรับคนหางาน</h3>
                        <ul className="space-y-3">
                            <FooterLink to="/jobs/search" label="ค้นหางานทั้งหมด" />
                            <FooterLink to="/jobs/search?type=urgent" label="งานด่วน" />
                            <FooterLink to="/jobs/search?type=wfh" label="งาน Work from Home" />
                            <FooterLink to="/companies" label="บริษัทชั้นนำ" />
                            <FooterLink to="/register" label="ลงทะเบียนคนหางาน" />
                        </ul>
                    </div>

                    {/* For Employers */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-6">สำหรับผู้ประกอบการ</h3>
                        <ul className="space-y-3">
                            <FooterLink to="/post-job" label="ลงประกาศงานฟรี" />
                            <FooterLink to="/freelancers" label="ค้นหาฟรีแลนซ์" />
                            <FooterLink to="/pricing" label="แพ็คเกจราคา" />
                            <FooterLink to="/register?type=employer" label="ลงทะเบียนบริษัท" />
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-6">ติดต่อเรา</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-slate-500 text-sm">
                                <MapPin size={18} className="text-orange-600 shrink-0 mt-0.5" />
                                <span>123 อาคารสาทรซิตี้ทาวเวอร์ ชั้น 15 <br />ถนนสาทรใต้ แขวงทุ่งมหาเมฆ <br />เขตสาทร กรุงเทพฯ 10120</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-500 text-sm">
                                <Phone size={18} className="text-orange-600 shrink-0" />
                                <span>02-123-4567</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-500 text-sm">
                                <Mail size={18} className="text-orange-600 shrink-0" />
                                <span>contact@workhorizon.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">
                        © {new Date().getFullYear()} WorkHorizon. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <Link to="/privacy" className="hover:text-orange-600 transition-colors">นโยบายความเป็นส่วนตัว</Link>
                        <Link to="/terms" className="hover:text-orange-600 transition-colors">ข้อกำหนดและเงื่อนไข</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialLink = ({ href, icon, label }) => (
    <a
        href={href}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-orange-600 hover:text-white transition-all duration-300"
        aria-label={label}
    >
        {icon}
    </a>
);

const FooterLink = ({ to, label }) => (
    <li>
        <Link
            to={to}
            className="text-slate-500 text-sm hover:text-orange-600 hover:translate-x-1 transition-all duration-200 inline-block"
        >
            {label}
        </Link>
    </li>
);

export default Footer;
