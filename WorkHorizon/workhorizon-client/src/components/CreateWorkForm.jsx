import React, { useState } from 'react';
import { Briefcase, CheckCircle, X } from 'lucide-react';

const CreateWorkForm = ({ jobSeekerId, onSubmit, onCancel }) => {
    const [jobTitle, setJobTitle] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('1');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!jobTitle.trim()) {
            setError('กรุณาระบุชื่องาน');
            return;
        }
        if (!price || parseFloat(price) <= 0) {
            setError('กรุณาระบุราคาที่ถูกต้อง');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await onSubmit({
                jobSeekerId,
                jobTitle,
                description,
                price,
                duration
            });
        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาด');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-1">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                        ชื่องาน <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="เช่น ออกแบบโลโก้, เขียนบทความ"
                        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            ราคา (บาท) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            ระยะเวลา (วัน) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="1"
                            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                        รายละเอียด (ไม่บังคับ)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="รายละเอียดเพิ่มเติม..."
                        rows={3}
                        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium resize-none"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium transition-all"
                        disabled={isSubmitting}
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CheckCircle size={18} />
                        )}
                        เสนอราคา
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateWorkForm;
