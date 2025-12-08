import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <h1 className="text-9xl font-extrabold text-blue-600">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mt-4">ไม่พบหน้าที่คุณค้นหา</h2>
      <p className="text-lg text-gray-600 mt-2">
        ขออภัย, เราไม่สามารถหาหน้าที่คุณต้องการได้
      </p>
      <Link
        to="/"
        className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
      >
        กลับไปหน้าแรก
      </Link>
    </div>
  );
};

export default NotFoundPage;

