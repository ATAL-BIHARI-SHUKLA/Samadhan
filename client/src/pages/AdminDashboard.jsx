import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Search,
  Filter,
  X,
  UserCheck,
  Calendar,
  TrendingUp,
  Award,
  ChevronRight,
  Star,
  Phone,
  Mail,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../hooks/useAuth";
import MessagesSidebar from "../components/MessagesSidebar";
import ConnectionPanel from "../components/ConnectionPanel";

const AdminDashboard = () => {
  const { issues, workers, stats, assignWorker } = useApp();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("issues"); // issues, connections

  const filteredIssues = issues.filter((issue) => {
    if (filter !== "all" && issue.status !== filter) return false;
    if (search && !issue.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const getSlaDeadline = (issue) => {
    const issueStatus = issue.status || "pending";
    const baseDate = issue.assignedAt
      ? new Date(issue.assignedAt)
      : issue.timestamp
        ? new Date(issue.timestamp)
        : new Date();
    const hours =
      issueStatus === "assigned" || issueStatus === "in-progress" ? 24 : 48;
    return new Date(baseDate.getTime() + hours * 60 * 60 * 1000);
  };

  const isOverdue = (issue) => {
    if ((issue.status || "pending") === "resolved") return false;
    return new Date() > getSlaDeadline(issue);
  };

  const isEscalated = (issue) => {
    if ((issue.status || "pending") === "resolved") return false;
    const baseDate = issue.assignedAt
      ? new Date(issue.assignedAt)
      : issue.timestamp
        ? new Date(issue.timestamp)
        : new Date();
    const threshold = issue.assignedAt
      ? new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)
      : new Date(baseDate.getTime() + 48 * 60 * 60 * 1000);
    return new Date() > threshold;
  };

  const getSlaLabel = (issue) => {
    if ((issue.status || "pending") === "resolved") return "Resolved";
    const deadline = getSlaDeadline(issue);
    const deltaHours = Math.ceil(
      (deadline.getTime() - new Date().getTime()) / (60 * 60 * 1000),
    );
    return deltaHours <= 0
      ? `Overdue by ${Math.abs(deltaHours)}h`
      : `Due in ${deltaHours}h`;
  };

  const overdueCount = issues.filter((issue) => isOverdue(issue)).length;
  const escalatedCount = issues.filter((issue) => isEscalated(issue)).length;

  const statsData = [
    {
      label: "Total Issues",
      value: stats.total,
      icon: BarChart,
      color: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      trend: "+12%",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      trend: "+8%",
    },
    {
      label: "In Progress",
      value: stats.active,
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
      bgGradient: "from-yellow-50 to-yellow-100",
      trend: "+5%",
    },
    {
      label: "Overdue",
      value: overdueCount,
      icon: AlertCircle,
      color: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
      trend: "Immediate",
    },
    {
      label: "Escalated",
      value: escalatedCount,
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      trend: "SLA breach",
    },
    {
      label: "Active Workers",
      value: stats.workers,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      trend: "+3%",
    },
  ];

  const normalizeAreaName = (address) => {
    if (!address) return "Unknown";
    if (address.includes("MG Road")) return "MG Road";
    if (address.includes("Brigade")) return "Brigade Road";
    if (address.includes("Jayanagar")) return "Jayanagar";
    return address;
  };

  const areaSummaries = Object.values(
    issues.reduce((acc, issue) => {
      const area = normalizeAreaName(issue.location?.address);
      const status = issue.status || "pending";
      acc[area] = acc[area] || {
        area,
        total: 0,
        open: 0,
        overdue: 0,
        escalated: 0,
        resolved: 0,
      };
      acc[area].total += 1;
      if (status === "resolved") {
        acc[area].resolved += 1;
      } else {
        acc[area].open += 1;
      }
      if (isOverdue(issue)) acc[area].overdue += 1;
      if (!isOverdue(issue) && isEscalated(issue)) acc[area].escalated += 1;
      return acc;
    }, {}),
  ).sort((a, b) => b.total - a.total);

  const publicTransparencySummary = {
    areas: areaSummaries.length,
    totalIssues: issues.length,
    topHotspot: areaSummaries[0]?.area || "N/A",
    topHotspotCount: areaSummaries[0]?.total || 0,
  };

  const statusColors = {
    resolved: "bg-gradient-to-r from-green-500 to-green-600",
    "in-progress": "bg-gradient-to-r from-blue-500 to-blue-600",
    assigned: "bg-gradient-to-r from-purple-500 to-purple-600",
    pending: "bg-gradient-to-r from-orange-500 to-orange-600",
  };

  const handleAssign = (issueId) => {
    if (selectedWorker) {
      assignWorker(issueId, selectedWorker);
      setSelectedIssue(null);
      setSelectedWorker("");
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor and manage community issues efficiently
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center px-4 py-2 bg-white shadow-sm rounded-xl">
                <Calendar size={18} className="mr-2 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 opacity-10">
                  <stat.icon size={120} />
                </div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}
                    >
                      <stat.icon className="text-white" size={24} />
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp size={14} className="text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                  <h3 className="mb-1 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Public Transparency / Area Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 overflow-hidden bg-white shadow-xl rounded-2xl"
          >
            <div className="px-6 py-5 bg-gradient-to-r from-primary-600 to-primary-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Public Transparency
                  </h2>
                  <p className="text-sm text-primary-100">
                    Area-wise issue visibility and hotspot reporting.
                  </p>
                </div>
                <Award className="text-primary-200" size={20} />
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm text-gray-500">Monitored Areas</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {publicTransparencySummary.areas}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm text-gray-500">Total Public Reports</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {publicTransparencySummary.totalIssues}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm text-gray-500">Top Hotspot</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {publicTransparencySummary.topHotspot}
                  </p>
                  <p className="text-sm text-gray-500">
                    {publicTransparencySummary.topHotspotCount} issues
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-gray-200">
                <div className="p-4 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">
                    Issues by Area
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-white border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Area
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Total
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Open
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Overdue
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Escalated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {areaSummaries.map((area) => (
                        <tr
                          key={area.area}
                          className="border-b border-gray-100 even:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {area.area}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {area.total}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {area.open}
                          </td>
                          <td className="px-6 py-4 text-sm text-red-600">
                            {area.overdue}
                          </td>
                          <td className="px-6 py-4 text-sm text-orange-600">
                            {area.escalated}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab("issues")}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "issues"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Issues
            </button>
            <button
              onClick={() => setActiveTab("connections")}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "connections"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Connections
            </button>
          </div>

          {activeTab === "issues" ? (
            <div className="space-y-8">
              {/* Filters and Search Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="p-1 bg-white shadow-lg rounded-2xl">
                  <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {[
                        "all",
                        "pending",
                        "assigned",
                        "in-progress",
                        "resolved",
                      ].map((status) => (
                        <motion.button
                          key={status}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFilter(status)}
                          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                            filter === status
                              ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {status === "all"
                            ? "All Issues"
                            : status === "in-progress"
                              ? "In Progress"
                              : status === "assigned"
                                ? "Assigned"
                                : status === "pending"
                                  ? "Pending"
                                  : status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                        </motion.button>
                      ))}
                    </div>
                    <div className="relative">
                      <Search
                        className="absolute text-gray-400 transform -translate-y-1/2 left-4 top-1/2"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Search issues by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full py-2.5 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all md:w-80"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Issues List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden bg-white shadow-xl rounded-2xl"
              >
                <div className="px-6 py-5 bg-gradient-to-r from-primary-600 to-primary-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        All Issues
                      </h2>
                      <p className="text-sm text-primary-100">
                        {filteredIssues.length}{" "}
                        {filteredIssues.length === 1 ? "issue" : "issues"} found
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="text-primary-200" size={20} />
                      <span className="text-sm text-primary-100">
                        Priority Management
                      </span>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  <div className="divide-y divide-gray-100">
                    {filteredIssues.map((issue, idx) => (
                      <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ backgroundColor: "#f9fafb" }}
                        className={`p-6 transition-all duration-300 ${
                          isOverdue(issue)
                            ? "bg-red-50 border border-red-200"
                            : isEscalated(issue)
                              ? "bg-yellow-50 border border-yellow-200"
                              : ""
                        }`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {issue.title}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {(() => {
                                  const issueStatus = issue.status || "pending";
                                  return (
                                    <>
                                      <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm ${
                                          statusColors[issueStatus]
                                        }`}
                                      >
                                        {issueStatus === "in-progress"
                                          ? "In Progress"
                                          : issueStatus === "assigned"
                                            ? "Assigned"
                                            : issueStatus === "pending"
                                              ? "Pending"
                                              : issueStatus
                                                  .charAt(0)
                                                  .toUpperCase() +
                                                issueStatus.slice(1)}
                                      </span>
                                      {isOverdue(issue) && (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold text-red-700 bg-red-100">
                                          Overdue
                                        </span>
                                      )}
                                    </>
                                  );
                                })()}
                                {!isOverdue(issue) && isEscalated(issue) && (
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-orange-700 bg-orange-100">
                                    Escalated
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                              {issue.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1.5">
                                <MapPin size={14} className="text-gray-400" />
                                <span>
                                  {issue.location?.address ||
                                    "Location unknown"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1.5">
                                <Clock size={14} className="text-gray-400" />
                                <span>
                                  {new Date(issue.timestamp).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}
                                </span>
                              </div>
                              {issue.assignedTo && (
                                <div className="flex items-center space-x-1.5">
                                  <UserCheck
                                    size={14}
                                    className="text-green-500"
                                  />
                                  <span className="text-green-600">
                                    Assigned to:{" "}
                                    {workers.find(
                                      (worker) =>
                                        worker.id === issue.assignedTo,
                                    )
                                      ? workers.find(
                                          (worker) =>
                                            worker.id === issue.assignedTo,
                                        ).name
                                      : "Worker"}
                                  </span>
                                </div>
                              )}
                              <div
                                className={`flex items-center space-x-1.5 ${
                                  isOverdue(issue)
                                    ? "text-red-600"
                                    : "text-gray-500"
                                }`}
                              >
                                <Clock
                                  size={14}
                                  className={
                                    isOverdue(issue)
                                      ? "text-red-500"
                                      : "text-gray-400"
                                  }
                                />
                                <span>{getSlaLabel(issue)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {issue.status !== "resolved" && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  setSelectedIssue(
                                    selectedIssue === issue.id
                                      ? null
                                      : issue.id,
                                  )
                                }
                                className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-300 ${
                                  selectedIssue === issue.id
                                    ? "bg-gray-600 hover:bg-gray-700"
                                    : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                                } shadow-md`}
                              >
                                {selectedIssue === issue.id
                                  ? "Cancel"
                                  : "Assign Worker"}
                              </motion.button>
                            )}
                          </div>
                        </div>

                        {/* Assignment Panel */}
                        <AnimatePresence>
                          {selectedIssue === issue.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-5 mt-5 border-t-2 border-gray-100">
                                <label className="block mb-3 text-sm font-semibold text-gray-700">
                                  Select a Worker to Assign
                                </label>
                                <div className="grid gap-3 mb-4 md:grid-cols-2 lg:grid-cols-3">
                                  {workers.map((worker) => (
                                    <motion.div
                                      key={worker.id}
                                      whileHover={{ scale: 1.02 }}
                                      onClick={() =>
                                        setSelectedWorker(worker.id)
                                      }
                                      className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                                        selectedWorker === worker.id
                                          ? "bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-500 shadow-md"
                                          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                                      }`}
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-br from-primary-400 to-primary-600">
                                          {worker.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-semibold text-gray-900">
                                            {worker.name}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {worker.role}
                                          </p>
                                          <div className="flex items-center mt-1">
                                            <Star
                                              size={12}
                                              className="text-yellow-500 fill-current"
                                            />
                                            <span className="ml-1 text-xs text-gray-600">
                                              {worker.rating} rating
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                                <div className="flex justify-end space-x-3">
                                  <button
                                    onClick={() => {
                                      setSelectedIssue(null);
                                      setSelectedWorker("");
                                    }}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200"
                                  >
                                    Cancel
                                  </button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAssign(issue.id)}
                                    disabled={!selectedWorker}
                                    className={`px-6 py-2 text-sm font-medium text-white rounded-xl transition-all ${
                                      selectedWorker
                                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md"
                                        : "bg-gray-300 cursor-not-allowed"
                                    }`}
                                  >
                                    Confirm Assignment
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>

                {filteredIssues.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-16 text-center"
                  >
                    <AlertCircle
                      size={48}
                      className="mx-auto mb-4 text-gray-300"
                    />
                    <p className="text-lg text-gray-500">No issues found</p>
                    <p className="text-sm text-gray-400">
                      Try adjusting your filters or search query
                    </p>
                  </motion.div>
                )}

                {/* Connection Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <ConnectionPanel />
                </motion.div>

                {/* Messages at Bottom */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <MessagesSidebar />
                </motion.div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              key="connections"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <ConnectionPanel />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
