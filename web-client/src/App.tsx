import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import PlatformPolicy from './pages/PlatformPolicy/PlatformPolicy';
import Dashboard from './pages/Dashboard/Dashboard';
import Support from './pages/Support/Support';
import Features from './pages/Features/Features';
import Preview from './pages/Preview/Preview';
import Android from './pages/Android/Android';

// Nested Dashboard pages
import DashboardOverview from './pages/Dashboard/components/DashboardOverview';
import Calls from './pages/Dashboard/components/Calls';
import SMS from './pages/Dashboard/components/SMS';
import Devices from './pages/Dashboard/components/Devices';
import Settings from './pages/Dashboard/components/Settings';
import ActivityLogs from './pages/Dashboard/components/ActivityLogs';
import SupportTicketPage from './pages/Dashboard/components/SupportTicketPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes (Anonymous users only) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Open / Policy Routes */}
          <Route path="/policy" element={<PlatformPolicy />} />
          <Route path="/support" element={<Support />} />
          <Route path="/features" element={<Features />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/android" element={<Android />} />
          <Route path="/contact" element={<Support />} />

          {/* Protected Routes (Authenticated users only) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<DashboardOverview />} />
              <Route path="calls" element={<Calls />} />
              <Route path="sms" element={<SMS />} />
              <Route path="devices" element={<Devices />} />
              <Route path="settings" element={<Settings />} />
              <Route path="activity" element={<ActivityLogs />} />
              <Route path="support" element={<SupportTicketPage />} />
              <Route path="policy" element={<PlatformPolicy />} />
            </Route>
          </Route>

          {/* Fallback routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
