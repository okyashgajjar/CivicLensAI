import { HashRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { PlatformPage } from './pages/PlatformPage';
import { MobileAppPage } from './pages/MobileAppPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { ReportPage } from './pages/ReportPage';
import { AgentProcessingPage } from './pages/AgentProcessingPage';
import { ReviewPage } from './pages/ReviewPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyReportsPage } from './pages/MyReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ActivityMapPage } from './pages/ActivityMapPage';
import { RequireAuth } from './components/RequireAuth';
import { AuthProvider } from './context/AuthContext';
import { ReportsProvider } from './context/ReportsContext';
import { NotificationsProvider } from './context/NotificationsContext';

interface AppProps {
  readonly className?: string;
}

export const App: React.FC<AppProps> = () => {
  return (
    <AuthProvider>
      <ReportsProvider>
        <NotificationsProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/platform" element={<PlatformPage />} />
              <Route path="/mobile-app" element={<MobileAppPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/home"
                element={
                  <RequireAuth role="user">
                    <HomePage />
                  </RequireAuth>
                }
              />
              <Route
                path="/report"
                element={
                  <RequireAuth>
                    <ReportPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/report/agents"
                element={
                  <RequireAuth>
                    <AgentProcessingPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/report/review"
                element={
                  <RequireAuth>
                    <ReviewPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/reports"
                element={
                  <RequireAuth>
                    <MyReportsPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <ProfilePage />
                  </RequireAuth>
                }
              />
              <Route
                path="/notifications"
                element={
                  <RequireAuth>
                    <NotificationsPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/activity-map"
                element={
                  <RequireAuth>
                    <ActivityMapPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequireAuth role="authority">
                    <DashboardPage />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<LoginPage />} />
            </Routes>
          </HashRouter>
        </NotificationsProvider>
      </ReportsProvider>
    </AuthProvider>
  );
};
