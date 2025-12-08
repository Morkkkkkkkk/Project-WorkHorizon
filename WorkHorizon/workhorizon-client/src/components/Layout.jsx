import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import FloatingChatWidget from './FloatingChatWidget.jsx';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <FloatingChatWidget />
      <Footer />
    </div>
  );
};

export default Layout;