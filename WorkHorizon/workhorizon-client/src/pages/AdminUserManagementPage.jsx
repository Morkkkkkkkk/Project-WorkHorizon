import React, { useState, useMemo } from 'react';
// import AdminLayout from '../layouts/AdminLayout'; // ❌ ไม่ต้อง import Layout ซ้ำ
import { useAdminUsers } from '../hooks/useAdminUsers';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal'; 
import { 
  Search, 
  Trash2, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Eye, 
  User,
  ShieldBan // ✅ เพิ่มไอคอนสำหรับปุ่มแบน
} from 'lucide-react';
import Swal from 'sweetalert2';
import { BACKEND_URL } from '../api/apiClient';

const AdminUserManagementPage = () => {
  const { users, isLoading, error, deleteUser, updateUserStatus } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State สำหรับ Modal ดูข้อมูล
  const [viewUser, setViewUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Helper สำหรับรูปภาพ
  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http')) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'ALL' || user.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  // Pagination Logic
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Handlers ---

  // 1. ลบผู้ใช้ (Delete)
  const handleDelete = async (userId) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบผู้ใช้?',
      text: "การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      const success = await deleteUser(userId);
      if (success) {
        Swal.fire('ลบสำเร็จ!', 'ผู้ใช้ถูกลบออกจากระบบแล้ว', 'success');
      }
    }
  };

  // 2. ระงับการใช้งาน (Suspend) - เปลี่ยนสถานะเป็น SUSPENDED / ACTIVE
  const handleSuspendToggle = async (user) => {
    const isSuspended = user.status === 'SUSPENDED';
    const newStatus = isSuspended ? 'ACTIVE' : 'SUSPENDED';
    const actionText = isSuspended ? 'ยกเลิกการระงับ' : 'ระงับการใช้งานชั่วคราว';
    
    const result = await Swal.fire({
      title: `ยืนยันการ${actionText}?`,
      text: isSuspended ? "ผู้ใช้จะกลับมาใช้งานได้ปกติ" : "ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้ชั่วคราว",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isSuspended ? '#10b981' : '#f59e0b',
      confirmButtonText: `ใช่, ${actionText}`,
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      const success = await updateUserStatus(user.id, newStatus);
      if (success) {
        Swal.fire('สำเร็จ!', `สถานะถูกเปลี่ยนเป็น ${newStatus} แล้ว`, 'success');
      }
    }
  };

  // 3. แบนผู้ใช้ (Ban) - เปลี่ยนสถานะเป็น BANNED / ACTIVE
  const handleBanToggle = async (user) => {
    const isBanned = user.status === 'BANNED';
    const newStatus = isBanned ? 'ACTIVE' : 'BANNED'; // ถ้าแบนอยู่ให้ปลดแบน (Active), ถ้ายังไม่แบนให้แบน (Banned)
    const actionText = isBanned ? 'ปลดแบนผู้ใช้' : 'แบนผู้ใช้ถาวร';
    
    const result = await Swal.fire({
      title: `ยืนยันการ${actionText}?`,
      text: isBanned ? "ผู้ใช้จะกลับมาใช้งานได้ปกติ" : "ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้อีกจนกว่าจะปลดแบน",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isBanned ? '#10b981' : '#ef4444',
      confirmButtonText: `ใช่, ${actionText}`,
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      const success = await updateUserStatus(user.id, newStatus);
      if (success) {
        Swal.fire('สำเร็จ!', `สถานะถูกเปลี่ยนเป็น ${newStatus} แล้ว`, 'success');
      }
    }
  };

  const handleViewClick = (user) => {
    setViewUser(user);
    setIsViewModalOpen(true);
  };

  if (isLoading) return <LoadingSpinner text="กำลังโหลดข้อมูลผู้ใช้..." />;
  if (error) return <div className="p-8 text-center text-red-500">เกิดข้อผิดพลาด: {error}</div>;

  return (
    <div className="space-y-6"> 
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">จัดการผู้ใช้งาน</h1>
            <p className="text-slate-500">ดูรายชื่อ ตรวจสอบ และจัดการสิทธิ์ผู้ใช้งานทั้งหมด</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 pl-2">ทั้งหมด:</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-sm font-bold">{users.length}</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือ อีเมล..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Role */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {['ALL', 'JOB_SEEKER', 'EMPLOYER', 'FREELANCER'].map((role) => (
              <button
                key={role}
                onClick={() => { setFilterRole(role); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterRole === role 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {role === 'ALL' ? 'ทั้งหมด' : role}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ผู้ใช้งาน</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">บทบาท</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">สถานะ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">วันที่สมัคร</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.profileImageUrl ? (
                            <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={getImageUrl(user.profileImageUrl)} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                              {user.firstName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'EMPLOYER' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'FREELANCER' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Badge สถานะ */}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        user.status === 'BANNED' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800' // SUSPENDED
                      }`}>
                        {user.status === 'ACTIVE' ? 'ใช้งานปกติ' : 
                         user.status === 'BANNED' ? 'ถูกแบน' : 'ถูกระงับ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {/* 1. ปุ่มดูข้อมูล (Eye) */}
                        <button 
                          onClick={() => handleViewClick(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <Eye size={18} />
                        </button>

                        {/* 2. ปุ่มระงับ (Suspend) - สีส้ม (แสดงเฉพาะเมื่อยังไม่โดนแบน) */}
                        {user.status !== 'BANNED' && (
                          <button 
                            onClick={() => handleSuspendToggle(user)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.status === 'SUSPENDED'
                                ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' // ถ้าโดนระงับอยู่ ให้เป็นปุ่ม Active เพื่อปลด
                                : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'
                            }`}
                            title={user.status === 'SUSPENDED' ? 'ยกเลิกการระงับ' : 'ระงับชั่วคราว'}
                          >
                            {user.status === 'SUSPENDED' ? <UserCheck size={18} /> : <UserX size={18} />}
                          </button>
                        )}
                        
                        {/* 3. ปุ่มแบน (Ban) - สีแดง (แสดงตลอด หรือเปลี่ยนเป็นปลดแบน) */}
                        <button 
                          onClick={() => handleBanToggle(user)}
                          className={`p-2 rounded-lg transition-colors  ${
                            user.status === 'BANNED'
                              ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                              : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={user.status === 'BANNED' ? 'ปลดแบน' : 'แบนถาวร'}
                        >
                          {user.status === 'BANNED' ? <UserCheck size={18} /> : <ShieldBan size={18} />}
                        </button>

                        {/* 4. ปุ่มลบ (Delete) */}
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบผู้ใช้"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Modal ดูข้อมูล */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="รายละเอียดผู้ใช้งาน"
        >
          {viewUser && (
            <div className="p-2">
              <div className="flex flex-col md:flex-row gap-8">
                
                {/* --- ฝั่งซ้าย: รูปโปรไฟล์ --- */}
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <div className="relative w-40 h-40 md:w-48 md:h-48 mb-4">
                    {viewUser.profileImageUrl ? (
                      <img 
                        src={getImageUrl(viewUser.profileImageUrl)} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg text-slate-400">
                        <User size={64} />
                      </div>
                    )}
                    <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${
                      viewUser.status === 'ACTIVE' ? 'bg-green-500' : 
                      viewUser.status === 'BANNED' ? 'bg-red-600' : 'bg-yellow-500'
                    }`}></div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 text-center">
                    {viewUser.firstName} {viewUser.lastName}
                  </h3>
                  <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      viewUser.role === 'EMPLOYER' ? 'bg-purple-100 text-purple-800' :
                      viewUser.role === 'FREELANCER' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                  }`}>
                    {viewUser.role}
                  </span>
                  {/* แสดงสถานะตัวใหญ่ๆ ใต้ชื่อ */}
                  <div className={`mt-2 text-sm font-bold ${
                    viewUser.status === 'BANNED' ? 'text-red-600' : 
                    viewUser.status === 'SUSPENDED' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {viewUser.status === 'BANNED' ? '(ถูกแบน)' : viewUser.status === 'SUSPENDED' ? '(ถูกระงับ)' : '(ปกติ)'}
                  </div>
                </div>

                {/* --- ฝั่งขวา: รายละเอียด --- */}
                <div className="w-full md:w-2/3 space-y-4">
                  <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                    ข้อมูลส่วนตัว
                  </h4>
                  {/* ... (เหมือนเดิม) ... */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">อีเมล</p>
                        <p className="text-sm font-medium text-slate-900">{viewUser.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="p-2 bg-white rounded-lg text-green-600 shadow-sm">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">เบอร์โทรศัพท์</p>
                        <p className="text-sm font-medium text-slate-900">
                          {viewUser.phone || <span className="text-slate-400 italic">ไม่ระบุ</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="p-2 bg-white rounded-lg text-orange-600 shadow-sm">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">วันที่สมัครสมาชิก</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(viewUser.createdAt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="p-2 bg-white rounded-lg text-purple-600 shadow-sm">
                        <Shield size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">User ID</p>
                        <p className="text-xs font-mono text-slate-600 break-all">{viewUser.id}</p>
                      </div>
                    </div>
                  </div>

                  {viewUser.role === 'EMPLOYER' && viewUser.company && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                        ข้อมูลบริษัท
                      </h4>
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <p className="text-sm font-bold text-purple-900">{viewUser.company.companyName}</p>
                        <p className="text-xs text-purple-700 mt-1 line-clamp-2">{viewUser.company.description || 'ไม่มีคำอธิบาย'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>

    </div>
  );
};

export default AdminUserManagementPage;