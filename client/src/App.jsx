import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorSchedule from './pages/doctor/DoctorSchedule';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminPatients from './pages/admin/AdminPatients';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminSMSLogs from './pages/admin/AdminSMSLogs';

// Layout with Sidebar for portal dashboards
const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

// Standard Layout for public pages
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            fontSize: '13px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/:id" element={<DoctorDetailPage />} />
        </Route>

        {/* Patient Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
          </Route>
        </Route>

        {/* Doctor Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule />} />
          </Route>
        </Route>

        {/* Admin Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/patients" element={<AdminPatients />} />
            <Route path="/admin/departments" element={<AdminDepartments />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/sms-logs" element={<AdminSMSLogs />} />
          </Route>
        </Route>

        {/* 404 Catch-All */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
