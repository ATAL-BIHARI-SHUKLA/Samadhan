import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  ThumbsUp,
  Eye,
  Trash2,
  Plus,
  TrendingUp,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useApp } from "../context/AppContext";
import MessagesSidebar from "../components/MessagesSidebar";
import ConnectionPanel from "../components/ConnectionPanel";

const CitizenDashboard = () => {
  const { user } = useAuth();
  const { issues } = useApp();
  const [myIssues, setMyIssues] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("issues"); // issues, connections

  // Load issues reported by current user
  useEffect(() => {
    if (user) {
      const userIssues = JSON.parse(localStorage.getItem("userIssues") || "{}");
      const citizenIssues = userIssues[user.id] || [];
      setMyIssues(citizenIssues);
    }
  }, [user]);

  const filteredIssues = myIssues.filter((issue) => {
    if (filterStatus !== "all" && issue.status !== filterStatus) return false;
    return true;
  });

  const stats = [
    {
      label: "Total Issues",
      value: myIssues.length,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Resolved",
      value: myIssues.filter((i) => i.status === "resolved").length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "In Progress",
      value: myIssues.filter(
        (i) => i.status === "assigned" || i.status === "in-progress",
      ).length,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Pending",
      value: myIssues.filter((i) => i.status === "pending").length,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending",
      },
      assigned: { bg: "bg-blue-100", text: "text-blue-800", label: "Assigned" },
      "in-progress": {
        bg: "bg-orange-100",
        text: "text-orange-800",
        label: "In Progress",
      },
      resolved: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Resolved",
      },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  const handleDeleteIssue = (issueId) => {
    if (window.confirm("Are you sure you want to delete this issue report?")) {
      const newIssues = myIssues.filter((i) => i.id !== issueId);
      setMyIssues(newIssues);
      const userIssues = JSON.parse(localStorage.getItem("userIssues") || "{}");
      userIssues[user.id] = newIssues;
      localStorage.setItem("userIssues", JSON.stringify(userIssues));
      toast.success("Issue deleted");
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
                My Dashboard
              </h1>
              <p className="text-gray-600">
                Track your reported issues and stay connected with workers &
                admins
              </p>
            </div>
            <Link
              to="/report"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Report New Issue
            </Link>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`${stat.bgColor} rounded-xl p-4 shadow hover:shadow-lg transition-all`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={stat.color} size={24} />
                      <span className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {stat.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("issues")}
                className={`px-4 py-3 font-semibold transition-colors ${
                  activeTab === "issues"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                My Issues ({myIssues.length})
              </button>
              <button
                onClick={() => setActiveTab("connections")}
                className={`px-4 py-3 font-semibold transition-colors ${
                  activeTab === "connections"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Connections
              </button>
            </div>

            {/* Issues Content */}
            <AnimatePresence mode="wait">
              {activeTab === "issues" && (
                <motion.div
                  key="issues"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-4"
                >
                  {/* Filter */}
                  <div className="flex gap-2">
                    {[
                      "all",
                      "pending",
                      "assigned",
                      "in-progress",
                      "resolved",
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                          filterStatus === status
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-white text-gray-700 border border-gray-200 hover:border-blue-600"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {/* Issues List */}
                  {filteredIssues.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl">
                      <FileText
                        className="mx-auto text-gray-300 mb-3"
                        size={48}
                      />
                      <p className="text-gray-600 font-medium mb-2">
                        No issues found
                      </p>
                      <Link
                        to="/report"
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Report your first issue →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredIssues.map((issue) => (
                        <motion.div
                          key={issue.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-5 border-l-4 border-l-blue-500"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {issue.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {issue.description}
                              </p>
                            </div>
                            {getStatusBadge(issue.status)}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                              <MapPin size={16} />
                              {issue.location?.address || "Location"}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              {new Date(issue.timestamp).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp size={16} />
                              {issue.votes || 0} votes
                            </div>
                          </div>

                          {issue.image && (
                            <img
                              src={issue.image}
                              alt={issue.title}
                              className="w-full h-32 object-cover rounded-lg mb-4"
                            />
                          )}

                          <div className="flex gap-2">
                            <Link
                              to={`/issue/${issue.id}`}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
                            >
                              <Eye size={16} />
                              View Details
                            </Link>
                            <button
                              onClick={() => handleDeleteIssue(issue.id)}
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "connections" && (
                <motion.div
                  key="connections"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <ConnectionPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Messages at Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <MessagesSidebar />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
