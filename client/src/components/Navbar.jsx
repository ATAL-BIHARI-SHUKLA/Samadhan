import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Map,
  Home,
  FileText,
  User,
  LayoutDashboard,
  LogOut,
  Settings,
  ChevronDown,
  Bell,
  HelpCircle,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useApp } from "../context/AppContext";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/Logo.png";

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const {
    userRole,
    setUserRole,
    notifications,
    markNotificationsReadForRole,
    currentUser,
  } = useApp();
  const { isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const currentNotifications = notifications.filter(
    (notification) => notification.recipientRole === userRole,
  );
  const unreadCount = currentNotifications.filter(
    (notification) => !notification.read,
  ).length;

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
    if (unreadCount > 0) {
      markNotificationsReadForRole(userRole);
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown and notification menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest(".profile-dropdown")) {
        setIsProfileOpen(false);
      }
      if (
        isNotificationsOpen &&
        !event.target.closest(".notification-dropdown") &&
        !event.target.closest(".notification-button")
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen, isNotificationsOpen]);

  const navLinks = [
    { path: "/", icon: Home, label: "Home", color: "text-blue-500" },
    { path: "/map", icon: Map, label: "Map", color: "text-green-500" },
    {
      path: "/report",
      icon: FileText,
      label: "Report",
      color: "text-purple-500",
    },
    ...(userRole === "citizen"
      ? [
          {
            path: "/citizen-dashboard",
            icon: LayoutDashboard,
            label: "My Issues",
            color: "text-blue-600",
          },
        ]
      : []),
    ...(userRole === "worker"
      ? [
          {
            path: "/worker-dashboard",
            icon: LayoutDashboard,
            label: "Dashboard",
            color: "text-orange-500",
          },
        ]
      : []),
    ...(userRole === "admin"
      ? [
          {
            path: "/admin-dashboard",
            icon: LayoutDashboard,
            label: "Admin",
            color: "text-red-500",
          },
        ]
      : []),
  ];

  const roleOptions = [
    { value: "citizen", label: "Citizen", icon: User, color: "text-blue-500" },
    { value: "worker", label: "Worker", icon: Shield, color: "text-green-500" },
    {
      value: "admin",
      label: "Admin",
      icon: LayoutDashboard,
      color: "text-purple-500",
    },
  ];

  const getRoleIcon = () => {
    const role = roleOptions.find((r) => r.value === userRole);
    const Icon = role?.icon || User;
    return <Icon size={18} className={role?.color} />;
  };

  const getRoleLabel = () => {
    return roleOptions.find((r) => r.value === userRole)?.label || "Citizen";
  };

  // Animation variants
  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
            : "bg-white/80 backdrop-blur-sm border-b border-gray-100"
        }`}
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-0 transition-opacity opacity-50 "></div>
                <img
                  src={logo}
                  alt="Samadhaan logo"
                  className="relative object-cover h-15 w-28 rounded-2xl"
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="items-center hidden space-x-1 md:flex">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="relative group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={isActive ? "text-primary-600" : ""}
                      />
                      <span className="font-medium">{link.label}</span>
                    </motion.div>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <div className="relative notification-dropdown">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleNotifications}
                      className="relative hidden p-2 text-gray-600 transition-colors bg-gray-100 notification-button sm:flex rounded-xl hover:bg-gray-200"
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1"></span>
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {isNotificationsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          className="absolute right-0 z-50 mt-2 overflow-hidden bg-white border border-gray-100 shadow-xl w-96 rounded-2xl"
                        >
                          <div className="p-4 bg-white border-b border-gray-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  Notifications
                                </p>
                                <p className="text-xs text-gray-400">
                                  {getRoleLabel()} updates
                                </p>
                              </div>
                              {unreadCount > 0 && (
                                <span className="px-2 py-1 text-xs font-semibold text-white rounded-full bg-primary-600">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="overflow-y-auto bg-white max-h-80">
                            {currentNotifications.length > 0 ? (
                              currentNotifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className={`px-4 py-3 border-b border-gray-100 transition-colors ${notification.read ? "bg-white" : "bg-primary-50"}`}
                                >
                                  <p className="text-sm text-gray-800">
                                    {notification.message}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-400">
                                    {new Date(
                                      notification.timestamp,
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-sm text-gray-500">
                                No new notifications.
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative profile-dropdown">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center px-3 py-2 space-x-2 transition-all duration-200 border border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200"
                    >
                      <div className="flex items-center space-x-2">
                        {getRoleIcon()}
                        <span className="hidden text-sm font-medium text-gray-700 sm:inline">
                          {getRoleLabel()}
                        </span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-gray-500 transition-transform duration-200 ${
                          isProfileOpen ? "rotate-180" : ""
                        }`}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute right-0 z-50 w-64 mt-2 overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl"
                        >
                          <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center space-x-2">
                              {getRoleIcon()}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {currentUser?.name || getRoleLabel()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {currentUser?.email || currentUser?.id}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="py-1">
                            {(userRole === "worker" ||
                              userRole === "admin") && (
                              <Link
                                to={
                                  userRole === "worker"
                                    ? "/worker-dashboard"
                                    : "/admin-dashboard"
                                }
                                className="flex items-center px-4 py-2 space-x-3 text-gray-700 transition-colors hover:bg-gray-50"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <LayoutDashboard size={16} />
                                <span className="text-sm">Dashboard</span>
                              </Link>
                            )}
                            <button
                              onClick={() => logout()}
                              className="flex items-center w-full px-4 py-2 space-x-3 text-red-600 transition-colors hover:bg-red-50"
                            >
                              <LogOut size={16} />
                              <span className="text-sm">Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white transition-all duration-200 shadow-sm bg-primary-600 rounded-xl hover:bg-primary-700"
                >
                  Login / Sign Up
                </Link>
              )}

              {/* Mobile menu button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 transition-colors bg-gray-100 md:hidden rounded-xl hover:bg-gray-200"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                variants={mobileMenuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="py-4 border-t border-gray-100 md:hidden"
              >
                <div className="space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <Icon
                          size={20}
                          className={isActive ? "text-primary-600" : ""}
                        />
                        <span className="font-medium">{link.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="mobile-active"
                            className="ml-auto w-1.5 h-1.5 bg-primary-500 rounded-full"
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100">
                  {isAuthenticated ? (
                    <div className="flex items-center justify-between px-4 py-2">
                      <div className="flex items-center space-x-3">
                        {getRoleIcon()}
                        <span className="text-sm font-medium text-gray-700">
                          {getRoleLabel()} Mode
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={toggleNotifications}
                          className="relative p-2 text-gray-600 bg-gray-100 rounded-lg notification-button"
                        >
                          <Bell size={18} />
                          {unreadCount > 0 && (
                            <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1"></span>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-2">
                      <Link
                        to="/auth"
                        className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700"
                      >
                        Login / Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under navbar */}
      <div className="h-16 lg:h-20"></div>
    </>
  );
};

export default Navbar;
