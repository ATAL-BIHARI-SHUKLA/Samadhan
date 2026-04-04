import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { useApp } from "./context/AppContext";
import { useAuth } from "./hooks/useAuth";
import { MessageCircle } from "lucide-react";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatBox from "./components/ChatBox";
import Home from "./pages/Home";
import ReportIssue from "./pages/ReportIssue";
import IssuesMap from "./pages/IssuesMap";
import IssueDetails from "./pages/IssueDetails";
import WorkerDashboard from "./pages/WorkerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CitizenDashboard from "./pages/CitizenDashboard";
import Auth from "./pages/Auth";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, authReady } = useAuth();
  const { userRole } = useApp();

  if (!authReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

const GlobalChatAssistant = () => {
  const { chatOpen, setChatOpen } = useApp();

  return (
    <>
      <button
        type="button"
        onClick={() => setChatOpen(true)}
        className={`fixed bottom-4 right-4 z-50 items-center gap-2 px-4 py-3 text-sm font-semibold text-white transition-all rounded-full shadow-2xl bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 ${
          chatOpen ? "hidden" : "flex"
        }`}
      >
        <MessageCircle size={18} />
        Help
      </button>
      <ChatBox isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/map" element={<IssuesMap />} />
              <Route path="/issue/:id" element={<IssueDetails />} />
              <Route
                path="/citizen-dashboard"
                element={
                  <ProtectedRoute>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker-dashboard"
                element={
                  <ProtectedRoute requiredRole="worker">
                    <WorkerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
              borderRadius: "12px",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
        <GlobalChatAssistant />
      </div>
    </AppProvider>
  );
}

// function App() {
//   return <h1>Civic Pulse Working 🚀</h1>;
// }

export default App;
