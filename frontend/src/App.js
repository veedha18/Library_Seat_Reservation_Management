import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import LibraryListPage from './pages/LibraryListPage';
import LibraryDetailPage from './pages/LibraryDetailPage';
import BookSearchPage from './pages/BookSearchPage';
import ReservationPage from './pages/ReservationPage';
import MyReservationsPage from './pages/MyReservationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLibraries from './pages/admin/AdminLibraries';
import AdminBooks from './pages/admin/AdminBooks';
import AdminSeats from './pages/admin/AdminSeats';
import AdminReservations from './pages/admin/AdminReservations';
import AdminReports from './pages/admin/AdminReports';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} replace />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/libraries" element={<ProtectedRoute><LibraryListPage /></ProtectedRoute>} />
        <Route path="/libraries/:id" element={<ProtectedRoute><LibraryDetailPage /></ProtectedRoute>} />
        <Route path="/books" element={<ProtectedRoute><BookSearchPage /></ProtectedRoute>} />
        <Route path="/reserve/:libraryId/:seatId" element={<ProtectedRoute><ReservationPage /></ProtectedRoute>} />
        <Route path="/my-reservations" element={<ProtectedRoute><MyReservationsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/libraries" element={<ProtectedRoute adminOnly><AdminLibraries /></ProtectedRoute>} />
        <Route path="/admin/books" element={<ProtectedRoute adminOnly><AdminBooks /></ProtectedRoute>} />
        <Route path="/admin/seats" element={<ProtectedRoute adminOnly><AdminSeats /></ProtectedRoute>} />
        <Route path="/admin/reservations" element={<ProtectedRoute adminOnly><AdminReservations /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute adminOnly><AdminReports /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          toastStyle={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            background: '#142444',
            color: '#E8E0D0',
            border: '1px solid #243668',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
          progressStyle={{ background: '#E8C547' }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
