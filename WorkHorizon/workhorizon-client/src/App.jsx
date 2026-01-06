import { Routes, Route } from "react-router-dom";

// Import Pages
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import JobDetailPage from "./pages/JobDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ApplicantsPage from "./pages/ApplicantsPage.jsx";
import MyApplicationsPage from "./pages/MyApplicationsPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import CompanyProfilePage from "./pages/CompanyProfilePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import MySavedJobsPage from "./pages/MySavedJobsPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import PublicCompanyPage from "./pages/PublicCompanyPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import AllCategoriesPage from "./pages/AllCategoriesPage.jsx";
import MyHiresPage from "./pages/MyHiresPage.jsx";

// (Admin Pages)
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminAdsPage from "./pages/AdminAdsPage.jsx";
import AdminVerifyPage from "./pages/AdminVerifyPage.jsx";
import AdminUserManagementPage from "./pages/AdminUserManagementPage.jsx";
import AdminJobManagementPage from './pages/AdminJobManagementPage.jsx';
import AdminMasterDataPage from './pages/AdminMasterDataPage.jsx';
import AdminMainCategoriesPage from './pages/AdminMainCategoriesPage.jsx';
import AdminFeaturedPage from './pages/AdminFeaturedPage.jsx';
import AdminWithdrawalsPage from './pages/AdminWithdrawalsPage';

import FreelancerProfilePage from "./pages/FreelancerProfilePage.jsx";
import PublicFreelancerPage from "./pages/PublicFreelancerPage.jsx";
import FreelancerServicesPage from "./pages/FreelancerServicesPage.jsx";
import ServiceSearchPage from "./pages/ServiceSearchPage.jsx";
import ServiceDetailPage from "./pages/ServiceDetailPage.jsx";
import FreelancerWorkPage from "./pages/FreelancerWorkPage.jsx";

// Import Components
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

import WalletPage from './pages/WalletPage';   

function App() {
  return (
    <Routes>
      {/* ========================================
           กลุ่ม 1: Public Routes (มี Header/Layout)
          ======================================== */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route path="/company/:companyId" element={<PublicCompanyPage />} />
        <Route path="/jobs/search" element={<SearchPage />} />
        <Route path="/services/search" element={<ServiceSearchPage />} />
        <Route path="/freelancers/:id" element={<PublicFreelancerPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/categories" element={<AllCategoriesPage />} />
      </Route>

      {/* ========================================
        กลุ่ม 2: Public Routes ( ไม่มี Layout)
        ========================================
      */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* ========================================
        กลุ่ม 3: Protected Routes (JobSeeker/Employer) (มี Header/Layout)
        ========================================
      */}
      <Route path="/" element={<Layout />}>
        {/* --- (Job Seeker & Admin) --- */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        {/* --- (Job Seeker / Freelancer Only) --- */}
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        {/* --- (Job Seeker) --- */}
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute >
              <MyApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-saved-jobs"
          element={
            <ProtectedRoute >
              <MySavedJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-hires"
          element={
            <ProtectedRoute>
              <MyHiresPage />
            </ProtectedRoute>
          }
        />

        {/* --- (Employer) --- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="EMPLOYER">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/jobs/:jobId/applicants"
          element={
            <ProtectedRoute role="EMPLOYER">
              <ApplicantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/profile"
          element={
            <ProtectedRoute role="EMPLOYER">
              <CompanyProfilePage />
            </ProtectedRoute>
          }
        />

        {/* --- (Freelancer Routes) --- */}
        <Route
          path="/freelancer/profile"
          element={
            <ProtectedRoute role="FREELANCER" >
              <FreelancerProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/freelancer/services"
          element={
            <ProtectedRoute role="FREELANCER">
              <FreelancerServicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/freelancer/works"
          element={
            <ProtectedRoute role="FREELANCER">
              <FreelancerWorkPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ========================================
        กลุ่ม 4: Protected Routes (Chat - ไม่มี Layout)
      ========================================
      */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:convoId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      {/* ========================================
        (อัปเดต) กลุ่ม 5: Admin Routes (มี AdminLayout)
      ========================================
      */}
      <Route
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* (เราจะ redirect /admin ไป /admin/dashboard) */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/ads" element={<AdminAdsPage />} />
        <Route path="/admin/verify" element={<AdminVerifyPage />} />
        <Route path="/admin/users" element={<AdminUserManagementPage />} />
        <Route path="/admin/jobs" element={<AdminJobManagementPage />} />
        <Route path="/admin/master-data" element={<AdminMasterDataPage />} />
        <Route path="/admin/main-categories" element={<AdminMainCategoriesPage />} />
        <Route path="/admin/featured" element={<AdminFeaturedPage />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
      </Route>
      {/* (จบส่วน Admin) */}


      {/* (หน้า 404 - ต้องอยู่ล่างสุด) */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;