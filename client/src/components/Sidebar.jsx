import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  X,
  Home,
  Map,
  FileText,
  LayoutDashboard,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { userRole } = useApp();

  const menuItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/map", icon: Map, label: "Issues Map" },
    { path: "/report", icon: FileText, label: "Report Issue" },
    ...(userRole === "worker"
      ? [
          {
            path: "/worker-dashboard",
            icon: LayoutDashboard,
            label: "Worker Dashboard",
          },
        ]
      : []),
    ...(userRole === "admin"
      ? [
          {
            path: "/admin-dashboard",
            icon: LayoutDashboard,
            label: "Admin Dashboard",
          },
        ]
      : []),
    { path: "/settings", icon: Settings, label: "Settings" },
    { path: "/help", icon: HelpCircle, label: "Help & Support" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <span className="font-bold text-xl">Samadhaan</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 py-6">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center space-x-3 px-6 py-3 mx-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-primary-50 text-primary-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <button className="flex items-center space-x-3 text-gray-600 hover:text-red-600 transition-colors w-full px-3 py-2 rounded-lg hover:bg-gray-100">
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
