import React, { useState } from 'react';
import GlobalErrorBanner from './components/GlobalErrorBanner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import KanbanBoard from './components/KanbanBoard';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import Inbox from './components/Inbox';
import NewTaskModal from './components/NewTaskModal';
import SubjectPage from './components/SubjectPage';
import Settings from './components/Settings';
import Login from './components/Login';
import Welcome from './components/Welcome';
import { TasksProvider, useTasks } from './context/TasksContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { isNewUser, settingsLoading } = useTasks();

  if (loading || settingsLoading) return <div className="flex items-center justify-center h-screen bg-[#141118] text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (isNewUser) return <Navigate to="/welcome" replace />;
  return children;
};

const OnboardingRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { isNewUser, settingsLoading } = useTasks();

  if (loading || settingsLoading) return <div className="flex items-center justify-center h-screen bg-[#141118] text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isNewUser) return <Navigate to="/" replace />;
  return children;
};

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="flex h-screen bg-[var(--color-background-dark)] overflow-hidden text-white font-display">
      {/* Sidebar */}
      <Sidebar onNewTask={() => setIsModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)]">
        <GlobalErrorBanner />
        <Topbar />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/board" element={<div className="h-full overflow-hidden p-8"><KanbanBoard onNewTask={() => setIsModalOpen(true)} /></div>} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/subject/:subjectName" element={<SubjectPage onNewTask={() => setIsModalOpen(true)} />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* Modals */}
      {isModalOpen && <NewTaskModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <TasksProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/welcome" element={
              <OnboardingRoute>
                <Welcome />
              </OnboardingRoute>
            } />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />
          </Routes>
        </TasksProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
