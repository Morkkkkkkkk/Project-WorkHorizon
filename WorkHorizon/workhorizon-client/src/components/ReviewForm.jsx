// src/components/ReviewForm.jsx
/* === REVIEW FORM COMPONENT === */
// ✅ Component สำหรับให้คะแนน 1-5 ดาว + ความคิดเห็นแก่ Freelancer
// ✅ ใช้ใน Modal หรือหน้าแยก

import React, { useState } from 'react';
import { Star, Send, X, AlertCircle } from 'lucide-react';
import { freelancerApi } from '../api/freelancerApi';

/**
 * ReviewForm - Form สำหรับ Job Seeker ให้รีวิว Freelancer
 * @param {object} props
 * @param {string} props.workId - ID ของงานที่เสร็จสิ้น
 * @param {string} props.freelancerId - ID ของ Freelancer
 * @param {string} props.jobTitle - ชื่องาน
 * @param {Function} props.onSubmit - Callback เมื่อส่งรีวิวสำเร็จ
 * @param {Function} props.onCancel - Callback เมื่อยกเลิก
 */
const ReviewForm = ({ workId, freelancerId, jobTitle, onSubmit, onCancel }) => {
    // ✅ State สำหรับ Rating (1-5)
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);

    // ✅ State สำหรับ Comment
    const [comment, setComment] = useState('');

    // ✅ State สำหรับ Submission
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // ✅ Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (rating === 0) {
            setError('กรุณาให้คะแนน');
            return;
        }

        if (!comment.trim()) {
            setError('กรุณาเขียนความคิดเห็น');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // ✅ ใช้ API client
            const result = await freelancerApi.submitReview(freelancerId, {
                workId,
                rating,
                comment: comment.trim(),
            });

            // เรียก callback
            if (onSubmit) onSubmit(result);

        } catch (err) {
            console.error('Review submission error:', err);
            setError(err.message || 'เกิดข้อผิดพลาด');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6">

            {/* ✅ Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    รีวิวงาน: {jobTitle}
                </h2>
                <p className="text-slate-600">
                    ให้คะแนนและแสดงความคิดเห็นเกี่ยวกับคุณภาพงานของ Freelancer
                </p>
            </div>

            {/* ✅ Error Alert */}
            {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* ✅ Star Rating */}
            <div className="text-center">
                <label className="block text-sm font-bold text-slate-700 mb-3">
                    ให้คะแนน
                </label>
                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-all transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                size={48}
                                className={`
                  ${star <= (hoveredRating || rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-slate-300'
                                    }
                  transition-colors duration-150
                `}
                            />
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p className="mt-3 text-lg font-bold text-slate-700">
                        คะแนน: {rating} / 5 ดาว
                    </p>
                )}
            </div>

            {/* ✅ Comment Textarea */}
            <div>
                <label htmlFor="comment" className="block text-sm font-bold text-slate-700 mb-2">
                    ความคิดเห็น
                </label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="เขียนความคิดเห็นเกี่ยวกับงานนี้..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium resize-none"
                />
                <p className="text-sm text-slate-500 mt-2">
                    {comment.length} / 500 ตัวอักษร
                </p>
            </div>

            {/* ✅ Info Box */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-700">
                    <p className="font-bold text-slate-800 mb-1">💡 คำแนะนำ:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                        <li>ให้รีวิวตามความเป็นจริงเพื่อช่วยผู้อื่น</li>
                        <li>หลีกเลี่ยงการใช้ภาษาหยาบคายหรือดูถูก</li>
                        <li>รีวิวของคุณจะแสดงสาธารณะบนโปรไฟล์ของ Freelancer</li>
                    </ul>
                </div>
            </div>

            {/* ✅ Action Buttons */}
            <div className="flex justify-end pt-4 space-x-3 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    <X size={18} /> ยกเลิก
                </button>
                <button
                    type="submit"
                    disabled={rating === 0 || !comment.trim() || isSubmitting}
                    className="px-5 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            กำลังส่ง...
                        </>
                    ) : (
                        <>
                            <Send size={18} /> ส่งรีวิว
                        </>
                    )}
                </button>
            </div>
        </form >
    );
};

export default ReviewForm;
