import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  DollarSign,
  Star,
  Briefcase,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  Navigation,
  Filter,
  Search,
  X,
  Zap,
  Shield,
  Trophy,
  BarChart3,
  Users,
  ThumbsUp,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Timer,
  Wifi,
  Battery,
  User,
  Phone,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";
import { useAuth } from "../hooks/useAuth";
import { mockJobs } from "../services/api";
import UploadBox from "../components/UploadBox";
import MessagesSidebar from "../components/MessagesSidebar";
import ConnectionPanel from "../components/ConnectionPanel";

const WorkerDashboard = () => {
  const { workers, issues, updateIssueStatus, updateWorkerLocation } = useApp();
  const [activeJobs, setActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [rejectedJobs, setRejectedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [proofModalJob, setProofModalJob] = useState(null);
  const [proofPhotos, setProofPhotos] = useState({ before: null, after: null });
  const [proofNotes, setProofNotes] = useState("");
  const [proofError, setProofError] = useState("");
  const [activeTab, setActiveTab] = useState("jobs"); // jobs, connections
  const currentWorker = workers[0]; // Demo: first worker

  // Load saved jobs from localStorage
  useEffect(() => {
    const savedActive = localStorage.getItem("activeJobs");
    const savedCompleted = localStorage.getItem("completedJobs");
    const savedRejected = localStorage.getItem("rejectedJobs");
    if (savedActive) setActiveJobs(JSON.parse(savedActive));
    if (savedCompleted) setCompletedJobs(JSON.parse(savedCompleted));
    if (savedRejected) setRejectedJobs(JSON.parse(savedRejected));
  }, []);

  // Save jobs to localStorage
  useEffect(() => {
    localStorage.setItem("activeJobs", JSON.stringify(activeJobs));
    localStorage.setItem("completedJobs", JSON.stringify(completedJobs));
    localStorage.setItem("rejectedJobs", JSON.stringify(rejectedJobs));
  }, [activeJobs, completedJobs, rejectedJobs]);

  const availableJobs = mockJobs
    .filter(
      (job) =>
        !activeJobs.some((active) => active.id === job.id) &&
        !completedJobs.some((completed) => completed.id === job.id) &&
        !rejectedJobs.some((rejected) => rejected.id === job.id),
    )
    .filter((job) => {
      if (
        searchTerm &&
        !job.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      if (filterUrgency !== "all" && job.urgency !== filterUrgency)
        return false;
      return true;
    });

  const totalEarnings = completedJobs.reduce((sum, job) => sum + job.reward, 0);
  const completionRate =
    activeJobs.length + completedJobs.length > 0
      ? (
          (completedJobs.length / (activeJobs.length + completedJobs.length)) *
          100
        ).toFixed(0)
      : 0;

  const stats = [
    {
      label: "Total Earnings",
      value: `$${totalEarnings}`,
      icon: DollarSign,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      trend: "+12%",
      subtitle: "This month",
    },
    {
      label: "Completed Jobs",
      value: completedJobs.length,
      icon: CheckCircle,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      trend: "+8%",
      subtitle: "Total completed",
    },
    {
      label: "Rating",
      value: `${currentWorker?.rating || 0}`,
      icon: Star,
      gradient: "from-yellow-500 to-yellow-600",
      bgGradient: "from-yellow-50 to-yellow-100",
      trend: "⭐ 4.8",
      subtitle: "Average rating",
    },
    {
      label: "Active Jobs",
      value: activeJobs.length,
      icon: Briefcase,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      trend: activeJobs.length > 0 ? "In progress" : "Available",
      subtitle: "Current tasks",
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      gradient: "from-indigo-500 to-indigo-600",
      bgGradient: "from-indigo-50 to-indigo-100",
      trend: completionRate > 80 ? "Excellent!" : "Keep going!",
      subtitle: "Success rate",
    },
    {
      label: "Experience",
      value: `${currentWorker?.experience || 0}+`,
      icon: Award,
      gradient: "from-pink-500 to-pink-600",
      bgGradient: "from-pink-50 to-pink-100",
      trend: "Years",
      subtitle: "Field experience",
    },
  ];

  const acceptJob = (job) => {
    const newActiveJob = {
      ...job,
      acceptedAt: new Date().toISOString(),
      status: "assigned",
      stage: "en-route",
    };
    setActiveJobs([...activeJobs, newActiveJob]);
    if (job.issueId) {
      updateIssueStatus(job.issueId, "assigned");
    }
    toast.success(`🎉 Job accepted: ${job.title}`, {
      duration: 3000,
      icon: "✅",
    });
  };

  const checkInArrival = (job) => {
    const updatedJobs = activeJobs.map((activeJob) =>
      activeJob.id === job.id
        ? {
            ...activeJob,
            status: "in-progress",
            stage: "on-site",
            arrivalAt: new Date().toISOString(),
          }
        : activeJob,
    );
    setActiveJobs(updatedJobs);
    if (job.issueId) {
      updateIssueStatus(job.issueId, "in-progress");
      const issue = issues.find((item) => item.id === job.issueId);
      if (issue?.location) {
        updateWorkerLocation(currentWorker?.id, issue.location);
      }
    }
    toast.success(`✅ Checked in at site for ${job.title}`, {
      duration: 3000,
      icon: "🚧",
    });
  };

  const declineJob = (job) => {
    setRejectedJobs([...rejectedJobs, job]);
    toast(`Job declined: ${job.title}`, {
      duration: 3000,
      icon: "✋",
    });
  };

  const openProofModal = (job) => {
    setProofModalJob(job);
    setProofPhotos({
      before: job.beforePhoto || null,
      after: job.afterPhoto || null,
    });
    setProofNotes(job.proofNotes || "");
    setProofError("");
  };

  const closeProofModal = () => {
    setProofModalJob(null);
    setProofPhotos({ before: null, after: null });
    setProofNotes("");
    setProofError("");
  };

  const completeJob = () => {
    if (!proofModalJob) return;
    if (!proofPhotos.before || !proofPhotos.after) {
      setProofError(
        "Please upload both before and after proof images before completing.",
      );
      return;
    }

    const job = proofModalJob;
    setActiveJobs(activeJobs.filter((j) => j.id !== job.id));
    const completedJob = {
      ...job,
      completedAt: new Date().toISOString(),
      beforePhoto: proofPhotos.before,
      afterPhoto: proofPhotos.after,
      proofNotes,
      proofSubmitted: true,
      status: "resolved",
    };
    setCompletedJobs([completedJob, ...completedJobs]);
    if (job.issueId) {
      updateIssueStatus(job.issueId, "resolved");
    }
    toast.success(`🎊 Job completed with proof! +$${job.reward} earned`, {
      duration: 4000,
      icon: "💰",
    });
    closeProofModal();
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-orange-500 text-white";
      case "low":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case "high":
        return <AlertCircle size={12} />;
      case "medium":
        return <Clock size={12} />;
      case "low":
        return <Timer size={12} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <>
          {/* Header with Worker Profile */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <h1 className="mb-2 text-4xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
                  Worker Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage your tasks, track earnings, and grow your career
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center px-4 py-2 space-x-3 bg-white shadow-sm rounded-xl">
                  <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-r from-primary-500 to-primary-600">
                    {currentWorker?.name?.charAt(0) || "W"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {currentWorker?.name || "John Worker"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentWorker?.role || "Field Worker"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                  <stat.icon size={80} />
                </div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}
                    >
                      <stat.icon className="text-white" size={18} />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-green-600">
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                  <h3 className="mb-1 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                  <p className="mt-1 text-xs text-gray-400">{stat.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "jobs"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Jobs
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

          {activeTab === "jobs" ? (
            <div className="space-y-8">
              {/* Filters and Search Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="p-4 bg-white shadow-lg rounded-2xl">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative flex-1">
                      <Search
                        className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Search jobs by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <Filter size={18} />
                      <span>Filters</span>
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${showFilters ? "rotate-90" : ""}`}
                      />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="pt-4 border-t border-gray-200">
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Urgency Level
                          </label>
                          <div className="flex gap-2">
                            {["all", "high", "medium", "low"].map((urgency) => (
                              <button
                                key={urgency}
                                onClick={() => setFilterUrgency(urgency)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  filterUrgency === urgency
                                    ? "bg-primary-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {urgency === "all"
                                  ? "All"
                                  : urgency.charAt(0).toUpperCase() +
                                    urgency.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Available Jobs Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 overflow-hidden bg-white shadow-xl rounded-2xl"
              >
                <div className="px-6 py-5 bg-gradient-to-r from-primary-600 to-primary-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Nearby Available Jobs
                      </h2>
                      <p className="text-sm text-primary-100">
                        {availableJobs.length} jobs available within your area
                      </p>
                    </div>
                    <Zap className="text-primary-200" size={24} />
                  </div>
                </div>

                <AnimatePresence>
                  {availableJobs.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {availableJobs.map((job, idx) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ backgroundColor: "#f9fafb" }}
                          className="p-6 transition-all duration-300"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {job.title}
                                </h3>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getUrgencyColor(job.urgency)}`}
                                >
                                  {getUrgencyIcon(job.urgency)}
                                  <span className="ml-1">
                                    {job.urgency} urgency
                                  </span>
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1.5">
                                  <MapPin size={14} className="text-gray-400" />
                                  <span>
                                    {job.location} • {job.distance}km away
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                  <DollarSign
                                    size={14}
                                    className="text-green-500"
                                  />
                                  <span className="font-semibold text-green-600">
                                    ${job.reward}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                  <Clock size={14} className="text-gray-400" />
                                  <span>
                                    Est. {job.estimatedTime || "2-3"} hours
                                  </span>
                                </div>
                              </div>
                              {job.description && (
                                <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                                  {job.description}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => acceptJob(job)}
                                className="px-6 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md"
                              >
                                Accept Job
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => declineJob(job)}
                                className="px-6 py-2.5 text-sm font-medium text-gray-700 rounded-xl bg-gray-100 hover:bg-gray-200 shadow-sm"
                              >
                                Decline
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-16 text-center"
                    >
                      <CheckCircle
                        size={48}
                        className="mx-auto mb-4 text-gray-300"
                      />
                      <p className="text-lg text-gray-500">
                        No available jobs found
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {searchTerm || filterUrgency !== "all"
                          ? "Try adjusting your filters"
                          : "Check back later for new opportunities"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Active Jobs Section */}
              <AnimatePresence>
                {activeJobs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-8 overflow-hidden bg-white shadow-xl rounded-2xl"
                  >
                    <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            Active Jobs
                          </h2>
                          <p className="text-sm text-blue-100">
                            {activeJobs.length} job
                            {activeJobs.length !== 1 ? "s" : ""} in progress
                          </p>
                        </div>
                        <Briefcase className="text-blue-200" size={24} />
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {activeJobs.map((job) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-6 transition-colors hover:bg-gray-50"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {job.title}
                                </h3>
                                <span className="px-2 py-1 text-xs font-semibold text-white rounded-full bg-blue-600">
                                  {job.stage === "en-route"
                                    ? "On the way"
                                    : job.stage === "on-site"
                                      ? "On site"
                                      : "In progress"}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1.5">
                                  <MapPin size={14} className="text-gray-400" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                  <DollarSign
                                    size={14}
                                    className="text-green-500"
                                  />
                                  <span className="font-semibold text-green-600">
                                    ${job.reward}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                  <Clock size={14} className="text-gray-400" />
                                  <span>
                                    Accepted:{" "}
                                    {new Date(
                                      job.acceptedAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <p className="mt-3 text-sm text-orange-600">
                                Proof required: upload before/after photos to
                                validate completion.
                              </p>
                            </div>
                            {job.status === "assigned" ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => checkInArrival(job)}
                                className="px-6 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
                              >
                                Check in on site
                              </motion.button>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openProofModal(job)}
                                className="px-6 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md"
                              >
                                Upload Proof
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Proof Upload Modal */}
              <AnimatePresence>
                {proofModalJob && (
                  <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      className="w-full max-w-4xl p-6 overflow-hidden bg-white rounded-3xl shadow-2xl"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-2xl font-semibold text-gray-900">
                            Submit completion proof
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Upload before and after photos to validate the
                            completed task.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={closeProofModal}
                          className="p-2 text-gray-500 transition rounded-full hover:bg-gray-100"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">
                                Before Photo
                              </h4>
                              <p className="text-xs text-gray-500">
                                Capture the issue before repair begins.
                              </p>
                            </div>
                            {proofPhotos.before && (
                              <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                Ready
                              </span>
                            )}
                          </div>
                          <UploadBox
                            onImageUpload={(file, preview) =>
                              setProofPhotos((prev) => ({
                                ...prev,
                                before: preview,
                              }))
                            }
                            maxSize={10}
                            accept="image/*"
                            className="min-h-[260px]"
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">
                                After Photo
                              </h4>
                              <p className="text-xs text-gray-500">
                                Upload the completed work evidence.
                              </p>
                            </div>
                            {proofPhotos.after && (
                              <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                Ready
                              </span>
                            )}
                          </div>
                          <UploadBox
                            onImageUpload={(file, preview) =>
                              setProofPhotos((prev) => ({
                                ...prev,
                                after: preview,
                              }))
                            }
                            maxSize={10}
                            accept="image/*"
                            className="min-h-[260px]"
                          />
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Completion Notes (optional)
                        </label>
                        <textarea
                          value={proofNotes}
                          onChange={(e) => setProofNotes(e.target.value)}
                          className="w-full min-h-[120px] px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Add details about what was fixed or any special notes"
                        />
                      </div>

                      {proofError && (
                        <div className="p-3 mt-4 text-sm text-red-700 bg-red-50 rounded-2xl">
                          {proofError}
                        </div>
                      )}

                      <div className="flex flex-col items-stretch gap-3 mt-6 sm:flex-row sm:items-center sm:justify-end">
                        <button
                          type="button"
                          onClick={closeProofModal}
                          className="px-5 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={completeJob}
                          disabled={!proofPhotos.before || !proofPhotos.after}
                          className="px-5 py-3 text-sm font-medium text-white rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          Submit Proof & Complete
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Completed Jobs Section */}
              <AnimatePresence>
                {completedJobs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden bg-white shadow-xl rounded-2xl"
                  >
                    <div className="px-6 py-5 bg-gradient-to-r from-green-600 to-green-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            Recently Completed
                          </h2>
                          <p className="text-sm text-green-100">
                            Total earned: ${totalEarnings}
                          </p>
                        </div>
                        <Trophy className="text-green-200" size={24} />
                      </div>
                    </div>
                    <div className="overflow-y-auto divide-y divide-gray-100 max-h-96">
                      {completedJobs.map((job) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 transition-colors hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {job.title}
                              </p>
                              <div className="flex items-center mt-1 space-x-4">
                                <p className="text-xs text-gray-500">
                                  Completed{" "}
                                  {new Date(
                                    job.completedAt,
                                  ).toLocaleDateString()}
                                </p>
                                <div className="flex items-center space-x-1">
                                  <MapPin size={12} className="text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {job.location}
                                  </span>
                                </div>
                              </div>
                              {job.proofSubmitted && (
                                <span className="inline-flex items-center px-2 py-1 mt-3 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                  Proof submitted
                                </span>
                              )}
                            </div>
                          </div>
                          {job.beforePhoto && job.afterPhoto && (
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              <div className="overflow-hidden rounded-2xl border border-gray-200">
                                <img
                                  src={job.beforePhoto}
                                  alt="Before proof"
                                  className="object-cover w-full h-32"
                                />
                                <div className="p-2 text-xs text-gray-600 bg-gray-50">
                                  Before photo
                                </div>
                              </div>
                              <div className="overflow-hidden rounded-2xl border border-gray-200">
                                <img
                                  src={job.afterPhoto}
                                  alt="After proof"
                                  className="object-cover w-full h-32"
                                />
                                <div className="p-2 text-xs text-gray-600 bg-gray-50">
                                  After photo
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-gray-500">
                              {job.proofNotes || "No notes provided."}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-green-600">
                                +${job.reward}
                              </span>
                              <CheckCircle
                                size={18}
                                className="text-green-500"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty State */}
              {activeJobs.length === 0 &&
                completedJobs.length === 0 &&
                availableJobs.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-16 text-center bg-white shadow-xl rounded-2xl"
                  >
                    <Briefcase
                      size={64}
                      className="mx-auto mb-4 text-gray-300"
                    />
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      No Jobs Yet
                    </h3>
                    <p className="text-gray-500">
                      Start by accepting available jobs in your area
                    </p>
                  </motion.div>
                )}

              {/* Messages at Bottom */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <MessagesSidebar />
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
        </>
      </div>
    </div>
  );
};

export default WorkerDashboard;
