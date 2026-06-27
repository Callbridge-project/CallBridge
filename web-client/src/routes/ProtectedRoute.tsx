import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export const ProtectedRoute: React.FC = () => {
  const { account, loading } = useAuth();

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <div className="loader-logo">Call<span>Bridge</span></div>
          <p className="loader-text">Verifying secure session...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;