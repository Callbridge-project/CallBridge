import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export const PublicRoute: React.FC = () => {
  const { account, loading } = useAuth();

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <div className="loader-logo">Call<span>Bridge</span></div>
          <p className="loader-text">Loading secure gateway...</p>
        </div>
      </div>
    );
  }

  if (account) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;