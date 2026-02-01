import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../api/apiClient';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
    Check, Plus, Trash2, Palette, RotateCcw, X, 
    Monitor, Layout, MousePointer2, Image as ImageIcon 
} from 'lucide-react';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const AdminThemePage = () => {
    const [themes, setThemes] = useState([]);
    const { refreshTheme } = useContext(ThemeContext);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        primaryColor: '#2563eb', // Default Blue
        secondaryColor: '#1d4ed8',
        backgroundColor: '#f8fafc',
        decorationImage: '',
    });

    const isDefaultActive = themes.length === 0 || themes.every(t => !t.isActive);

    useEffect(() => {
        loadThemes();
    }, []);

    const loadThemes = async () => {
        try {
            const res = await apiClient.get('/themes');
            setThemes(res.data);
        } catch (error) {
            console.error("Error loading themes:", error);
        }
    };

    const handleActivate = async (id) => {
        try {
            await apiClient.put(`/themes/${id}/activate`);
            await loadThemes();
            refreshTheme();
            toast.success("เปลี่ยนธีมเรียบร้อย ✨");
        } catch (error) {
            toast.error("เกิดข้อผิดพลาด: " + error.message);
        }
    };

    const handleReset = async () => {
        try {
            await apiClient.put('/themes/reset');
            await loadThemes();
            refreshTheme();
            toast.success("กลับสู่ค่าเริ่มต้นเรียบร้อย");
        } catch (error) {
            toast.error("รีเซ็ตไม่สำเร็จ");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("ต้องการลบธีมนี้หรือไม่?")) return;
        try {
             await apiClient.delete(`/themes/${id}`); 
             toast.success("ลบธีมเรียบร้อย");
             loadThemes();
             refreshTheme();
        } catch (error) {
            toast.error("ลบไม่สำเร็จ");
        }
    };

    const handleCreateTheme = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/themes', formData);
            toast.success("สร้างธีมใหม่สำเร็จ 🎉");
            setIsCreateModalOpen(false);
            setFormData({
                name: '',
                primaryColor: '#2563eb',
                secondaryColor: '#1d4ed8',
                backgroundColor: '#f8fafc',
                decorationImage: '',
            });
            loadThemes();
        } catch (error) {
            toast.error("สร้างไม่สำเร็จ: " + error.message);
        }
    };

    // --- Component: UI Preview Card (หัวใจสำคัญของดีไซน์ใหม่) ---
    const ThemePreviewCard = ({ primary, secondary, bg, image, name, isActive, onClick, onDelete, isSystemDefault }) => {
        return (
            <div 
                onClick={onClick}
                className={`
                    group relative flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
                    ${isActive 
                        ? 'ring-2 ring-blue-600 shadow-xl scale-[1.02]' 
                        : 'border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
                    }
                `}
            >
                {/* 1. ส่วนจำลองหน้าจอ (Mockup Area) */}
                <div className="h-40 w-full relative border-b border-slate-100 overflow-hidden" style={{ backgroundColor: bg }}>
                    {/* Background Decoration Image */}
                    {image && (
                        <img 
                            src={image} 
                            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay transition-transform duration-700 group-hover:scale-110" 
                            alt="" 
                        />
                    )}

                    {/* Mockup UI Elements (สร้าง UI จำลองด้วย CSS) */}
                    <div className="absolute inset-4 flex flex-col gap-3 opacity-90">
                        {/* Mock Header */}
                        <div className="h-8 w-full rounded-lg shadow-sm flex items-center px-3 justify-between" style={{ backgroundColor: 'white' }}>
                            <div className="w-8 h-8 rounded-full -ml-4 scale-75" style={{ backgroundColor: secondary }}></div>
                            <div className="flex gap-2">
                                <div className="w-16 h-2 rounded-full bg-slate-100"></div>
                                <div className="w-8 h-2 rounded-full bg-slate-100"></div>
                            </div>
                        </div>
                        
                        {/* Mock Body */}
                        <div className="flex gap-3 flex-1">
                            {/* Sidebar */}
                            <div className="w-1/4 h-full rounded-lg opacity-50" style={{ backgroundColor: 'white' }}></div>
                            {/* Main Content */}
                            <div className="flex-1 h-full rounded-lg shadow-sm p-3 flex flex-col justify-between" style={{ backgroundColor: 'white' }}>
                                <div className="space-y-2">
                                    <div className="w-1/2 h-3 rounded-full bg-slate-100"></div>
                                    <div className="w-3/4 h-2 rounded-full bg-slate-50"></div>
                                </div>
                                {/* Mock Button (สี Primary) */}
                                <div className="self-end px-3 py-1.5 rounded text-[8px] text-white font-bold shadow-sm" style={{ backgroundColor: primary }}>
                                    Button
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Checkmark Badge */}
                    {isActive && (
                        <div className="absolute top-3 right-3 bg-blue-600 text-white p-1.5 rounded-full shadow-md animate-in zoom-in">
                            <Check size={14} strokeWidth={3} />
                        </div>
                    )}
                </div>

                {/* 2. ส่วนข้อมูล (Info Area) */}
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className={`font-bold text-lg ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
                                {name}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {isSystemDefault ? 'System Default' : 'Custom Theme'}
                            </p>
                        </div>
                    </div>

                    {/* Palette Dots */}
                    <div className="flex gap-2 mt-auto pt-4 border-t border-slate-50">
                        <div className="flex -space-x-1">
                            <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: primary }} title="Primary"></div>
                            <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: secondary }} title="Secondary"></div>
                            <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: bg }} title="Background"></div>
                        </div>
                        
                        {/* Delete Button (ซ่อนถ้าเป็น Default) */}
                        {!isSystemDefault && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="ml-auto p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="ลบธีม"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <Palette className="text-blue-600" size={32} /> Themes Gallery
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">เลือกรูปแบบสีและบรรยากาศของเว็บไซต์ (Seasonal & Branding)</p>
                </div>
                
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                    <Plus size={20} /> สร้างธีมใหม่
                </button>
            </div>
            
            {/* Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                
                {/* 1. Default System Theme */}
                <ThemePreviewCard 
                    name="Original Blue"
                    primary="#2563eb"
                    secondary="#1d4ed8"
                    bg="#f8fafc"
                    isActive={isDefaultActive}
                    isSystemDefault={true}
                    onClick={handleReset}
                />

                {/* 2. Custom Themes */}
                {themes.map(theme => (
                    <ThemePreviewCard 
                        key={theme.id}
                        {...theme}
                        name={theme.name}
                        primary={theme.primaryColor}
                        secondary={theme.secondaryColor}
                        bg={theme.backgroundColor}
                        image={theme.decorationImage}
                        isActive={theme.isActive}
                        onClick={() => handleActivate(theme.id)}
                        onDelete={() => handleDelete(theme.id)}
                    />
                ))}

                {/* 3. Add New Placeholder (Optional: ถ้าอยากให้มีปุ่มเพิ่มใน Grid ด้วย) */}
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="group flex flex-col items-center justify-center h-full min-h-[280px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
                >
                    <div className="w-16 h-16 rounded-full bg-slate-50 group-hover:bg-blue-100 flex items-center justify-center text-slate-300 group-hover:text-blue-600 transition-colors mb-4">
                        <Plus size={32} />
                    </div>
                    <span className="font-bold text-slate-400 group-hover:text-blue-600 transition-colors">สร้างธีมใหม่</span>
                </button>

            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="🎨 สร้างธีมใหม่ (New Theme)">
                <form onSubmit={handleCreateTheme} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">ชื่อธีม (Theme Name)</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium" placeholder="เช่น Valentine 2026, Dark Mode" />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Primary Color</label>
                            <div className="flex gap-2">
                                <input type="color" value={formData.primaryColor} onChange={e => setFormData({...formData, primaryColor: e.target.value})} className="h-11 w-14 p-0 border-0 rounded-lg cursor-pointer shadow-sm" />
                                <input type="text" value={formData.primaryColor} onChange={e => setFormData({...formData, primaryColor: e.target.value})} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm uppercase font-mono" />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">สีหลักของปุ่ม, Header, Icon</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Secondary Color</label>
                            <div className="flex gap-2">
                                <input type="color" value={formData.secondaryColor} onChange={e => setFormData({...formData, secondaryColor: e.target.value})} className="h-11 w-14 p-0 border-0 rounded-lg cursor-pointer shadow-sm" />
                                <input type="text" value={formData.secondaryColor} onChange={e => setFormData({...formData, secondaryColor: e.target.value})} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm uppercase font-mono" />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">สีตอน Hover หรือปุ่มรอง</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Background Color</label>
                        <div className="flex gap-2">
                            <input type="color" value={formData.backgroundColor} onChange={e => setFormData({...formData, backgroundColor: e.target.value})} className="h-11 w-14 p-0 border-0 rounded-lg cursor-pointer shadow-sm" />
                            <input type="text" value={formData.backgroundColor} onChange={e => setFormData({...formData, backgroundColor: e.target.value})} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm uppercase font-mono" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">แนะนำ: สีขาว (#FFFFFF) หรือสีโทนอ่อนมาก (#F8FAFC)</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                            <ImageIcon size={16} /> Decoration Image URL
                        </label>
                        <input 
                            type="text" 
                            value={formData.decorationImage} 
                            onChange={e => setFormData({...formData, decorationImage: e.target.value})} 
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                            placeholder="https://example.com/snow.png" 
                        />
                        <p className="text-xs text-slate-400 mt-2">
                            💡 ใส่ลิงก์รูปภาพ (PNG พื้นใส) เพื่อให้ลอยเป็น Background Effect
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold transition-colors">ยกเลิก</button>
                        <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all">บันทึกธีม</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminThemePage;