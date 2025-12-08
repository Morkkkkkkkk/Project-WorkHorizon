import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { X, Bell, Check, Trash2, BellRing } from 'lucide-react';

const NotificationBell = () => {
  const { notifications, unreadCount, markOneAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    markOneAsRead(notification.id);
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAll = (e) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const handleDelete = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2.5 rounded-full transition-all duration-200
          ${isOpen ? 'bg-orange-100 text-orange-600' : 'text-slate-500 hover:bg-slate-100 hover:text-orange-600'}
        `}
      >
        <div className={unreadCount > 0 ? 'animate-wiggle' : ''}>
          {unreadCount > 0 ? <BellRing size={20} /> : <Bell size={20} />}
        </div>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] font-bold items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
          {/* Header */}
          <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-orange-600" />
              <h3 className="font-bold text-slate-800">การแจ้งเตือน</h3>
              {unreadCount > 0 && (
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} ใหม่
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <Check size={14} /> อ่านทั้งหมด
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Bell size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-600 font-medium mb-1">ไม่มีการแจ้งเตือน</p>
                <p className="text-sm text-slate-400">คุณจะได้รับการแจ้งเตือนเมื่อมีความเคลื่อนไหว</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`
                      group relative p-4 hover:bg-slate-50 transition-all cursor-pointer flex gap-3
                      ${!n.isRead ? 'bg-orange-50/30' : 'bg-white'}
                    `}
                  >
                    {/* Status Dot */}
                    <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${!n.isRead ? 'bg-orange-500 shadow-sm shadow-orange-200' : 'bg-slate-200'}`} />

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm mb-1 leading-relaxed ${!n.isRead ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                        {n.content}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {new Date(n.createdAt).toLocaleString('th-TH', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {/* Delete Button (Visible on Hover) */}
                    <button
                      onClick={(e) => handleDelete(e, n.id)}
                      className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="ลบ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
