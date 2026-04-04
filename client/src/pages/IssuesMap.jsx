import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  Search,
  X,
  SlidersHorizontal,
  Map,
  List,
  Layers,
  Navigation,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Compass,
  Maximize2,
  Minimize2,
  Info,
  ChevronDown,
} from "lucide-react";
import MapView from "../components/MapView";
import IssueCard from "../components/IssueCard";
import { useApp } from "../context/AppContext";

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

const getPriorityScore = (issue) => {
  const urgencyWeight =
    issue.urgency === "high"
      ? 40
      : issue.urgency === "medium"
        ? 20
        : issue.urgency === "low"
          ? 10
          : 0;
  const statusWeight =
    issue.status === "pending"
      ? 15
      : issue.status === "in-progress"
        ? 12
        : issue.status === "assigned"
          ? 10
          : 0;
  return (issue.votes || 0) * 5 + urgencyWeight + statusWeight;
};

const IssuesMap = () => {
  const navigate = useNavigate();
  const { issues } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    severity: "all",
    search: "",
  });
  const [userLocation, setUserLocation] = useState(null);
  const [distanceSort, setDistanceSort] = useState("none");
  const [distanceRadius, setDistanceRadius] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [viewMode, setViewMode] = useState("map");
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [mapZoom, setMapZoom] = useState(12);

  const categories = [
    {
      value: "infrastructure",
      label: "Infrastructure",
      icon: "🏗️",
      color: "from-orange-500 to-orange-600",
    },
    {
      value: "sanitation",
      label: "Sanitation",
      icon: "🗑️",
      color: "from-green-500 to-green-600",
    },
    {
      value: "lighting",
      label: "Street Lighting",
      icon: "💡",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      value: "water",
      label: "Water Supply",
      icon: "💧",
      color: "from-blue-500 to-blue-600",
    },
    {
      value: "traffic",
      label: "Traffic Issues",
      icon: "🚦",
      color: "from-red-500 to-red-600",
    },
  ];

  const issuesWithDistance = useMemo(() => {
    return issues.map((issue) => {
      if (!userLocation || !issue.location?.lat || !issue.location?.lng) {
        return { ...issue, distance: null };
      }

      return {
        ...issue,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          issue.location.lat,
          issue.location.lng,
        ),
      };
    });
  }, [issues, userLocation]);

  const filteredIssues = useMemo(() => {
    let result = issuesWithDistance.filter((issue) => {
      if (filters.status !== "all" && issue.status !== filters.status)
        return false;
      if (filters.category !== "all" && issue.category !== filters.category)
        return false;
      if (filters.severity !== "all" && issue.severity !== filters.severity)
        return false;
      if (
        filters.search &&
        !issue.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !issue.description?.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });

    if (distanceRadius !== "all" && userLocation) {
      const maxDistance = parseInt(distanceRadius, 10);
      result = result.filter(
        (issue) => issue.distance !== null && issue.distance <= maxDistance,
      );
    }

    if (distanceSort !== "none") {
      result = result.slice();
      if (distanceSort === "nearest" && userLocation) {
        result.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      } else if (distanceSort === "farthest" && userLocation) {
        result.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return b.distance - a.distance;
        });
      } else if (distanceSort === "votes") {
        result.sort((a, b) => (b.votes || 0) - (a.votes || 0));
      } else if (distanceSort === "priority") {
        result.sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
      }
    }

    return result;
  }, [issuesWithDistance, filters, distanceSort, distanceRadius, userLocation]);

  const stats = useMemo(() => {
    const total = filteredIssues.length;
    const resolved = filteredIssues.filter(
      (i) => i.status === "resolved",
    ).length;
    const inProgress = filteredIssues.filter(
      (i) => i.status === "in-progress",
    ).length;
    const pending = filteredIssues.filter((i) => i.status === "pending").length;
    const assigned = filteredIssues.filter(
      (i) => i.status === "assigned",
    ).length;
    const highSeverity = filteredIssues.filter(
      (i) => i.severity === "high",
    ).length;

    return {
      total,
      pending,
      assigned,
      resolved,
      inProgress,
      highSeverity,
      resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(0) : 0,
    };
  }, [filteredIssues]);

  const handleMarkerClick = useCallback((issue) => {
    setSelectedIssue(issue);
    setMapCenter({ lat: issue.location.lat, lng: issue.location.lng });
    setMapZoom(15);
  }, []);

  const handleViewDetails = useCallback(
    (issue) => {
      navigate(`/issue/${issue.id}`);
    },
    [navigate],
  );

  const handleClearFilters = () => {
    setFilters({
      status: "all",
      category: "all",
      severity: "all",
      search: "",
    });
    setShowFilters(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-orange-500";
      case "low":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const toggleFullscreen = () => {
    setIsMapFullscreen(!isMapFullscreen);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          setUserLocation({ lat: userLat, lng: userLng });
          setMapCenter({ lat: userLat, lng: userLng });
          setMapZoom(14);
        },
        () => {
          // Handle error silently
        },
      );
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isMapFullscreen ? "fixed inset-0 z-50" : ""}`}
    >
      {/* Header Section */}
      <div
        className={`sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm ${isMapFullscreen ? "hidden" : ""}`}
      >
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text"
              >
                Community Issues Map
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-1 text-sm text-gray-600"
              >
                Visualizing community concerns for better urban management
              </motion.p>
            </div>

            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("map")}
                className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all ${
                  viewMode === "map"
                    ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Map size={18} className="mr-2" />
                Map View
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("list")}
                className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <List size={18} className="mr-2" />
                List View
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 space-x-2 transition-all bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-4"
          >
            <Search
              className="absolute text-gray-400 transform -translate-y-1/2 left-4 top-1/2"
              size={18}
            />
            <input
              type="text"
              placeholder="Search issues by title, description, or location..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full py-3 pl-12 pr-4 transition-all border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </motion.div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 mt-4 bg-white border border-gray-200 shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Filter Issues
                    </h3>
                    <button
                      onClick={handleClearFilters}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) =>
                          setFilters({ ...filters, status: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">⏳ Pending</option>
                        <option value="assigned">👷 Assigned</option>
                        <option value="in-progress">⚙️ In Progress</option>
                        <option value="resolved">✅ Resolved</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) =>
                          setFilters({ ...filters, category: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Severity
                      </label>
                      <select
                        value={filters.severity}
                        onChange={(e) =>
                          setFilters({ ...filters, severity: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="all">All Severity</option>
                        <option value="high">🔴 High</option>
                        <option value="medium">🟠 Medium</option>
                        <option value="low">🟡 Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Sort by
                      </label>
                      <select
                        value={distanceSort}
                        onChange={(e) => setDistanceSort(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="none">None</option>
                        <option value="nearest">Nearest first</option>
                        <option value="farthest">Farthest first</option>
                        <option value="votes">Most votes</option>
                        <option value="priority">Priority boost</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Distance Radius
                      </label>
                      <select
                        value={distanceRadius}
                        onChange={(e) => setDistanceRadius(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="all">All distances</option>
                        <option value="5">Within 5 km</option>
                        <option value="10">Within 10 km</option>
                        <option value="25">Within 25 km</option>
                      </select>
                    </div>
                  </div>
                  {!userLocation &&
                    (distanceRadius !== "all" ||
                      ["nearest", "farthest"].includes(distanceSort)) && (
                      <div className="mt-4 text-sm text-orange-600 bg-orange-50 border border-orange-100 rounded-xl p-3">
                        Distance sorting and radius filtering will activate
                        after locating your position.
                      </div>
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats Bar */}
      {showStats && viewMode === "map" && !isMapFullscreen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky z-10 px-4 py-3 mx-auto mb-4 -mt-2 border border-gray-200 shadow-lg bg-white/90 backdrop-blur-sm top-32 max-w-7xl sm:px-6 lg:px-8 rounded-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={20} className="text-primary-600" />
                <span className="font-semibold text-gray-900">
                  {stats.total}
                </span>
                <span className="text-sm text-gray-600">Total Issues</span>
              </div>
              <div className="w-px h-8 bg-gray-300" />
              <div className="flex items-center space-x-2">
                <CheckCircle size={20} className="text-green-500" />
                <span className="font-semibold text-gray-900">
                  {stats.resolved}
                </span>
                <span className="text-sm text-gray-600">Resolved</span>
              </div>
              <div className="w-px h-8 bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-blue-500" />
                <span className="font-semibold text-gray-900">
                  {stats.inProgress}
                </span>
                <span className="text-sm text-gray-600">In Progress</span>
              </div>
              <div className="w-px h-8 bg-gray-300" />
              <div className="flex items-center space-x-2">
                <TrendingUp size={20} className="text-purple-500" />
                <span className="font-semibold text-gray-900">
                  {stats.resolutionRate}%
                </span>
                <span className="text-sm text-gray-600">Resolution Rate</span>
              </div>
            </div>
            <button
              onClick={() => setShowStats(!showStats)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div
        className={`px-4 py-6 mx-auto ${isMapFullscreen ? "px-0 py-0" : "max-w-7xl sm:px-6 lg:px-8"}`}
      >
        {viewMode === "map" ? (
          <div
            className={`relative overflow-hidden bg-white shadow-2xl rounded-2xl ${isMapFullscreen ? "rounded-none h-screen" : ""}`}
          >
            <div className="absolute z-10 flex space-x-2 top-4 right-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLocateMe}
                className="p-2 transition-colors bg-white rounded-lg shadow-lg hover:bg-gray-50"
                title="Locate me"
              >
                <Navigation size={20} className="text-primary-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen}
                className="p-2 transition-colors bg-white rounded-lg shadow-lg hover:bg-gray-50"
                title={isMapFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isMapFullscreen ? (
                  <Minimize2 size={20} />
                ) : (
                  <Maximize2 size={20} />
                )}
              </motion.button>
            </div>
            <MapView
              issues={filteredIssues}
              center={mapCenter}
              zoom={mapZoom}
              selectedIssue={selectedIssue}
              userLocation={userLocation}
              onMarkerClick={handleMarkerClick}
              onViewDetails={handleViewDetails}
              onCenterChange={setMapCenter}
              onZoomChange={setMapZoom}
            />
            {filteredIssues.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
                <div className="text-center">
                  <AlertTriangle
                    size={48}
                    className="mx-auto mb-4 text-gray-400"
                  />
                  <p className="text-lg text-gray-600">
                    No issues found matching your filters
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 text-primary-600 hover:text-primary-700"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* List View Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  All Issues
                </h2>
                <p className="text-sm text-gray-600">
                  Showing {filteredIssues.length} of {issues.length} issues
                </p>
              </div>
              {filters.search && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Search: "{filters.search}"
                  </span>
                  <button
                    onClick={() => setFilters({ ...filters, search: "" })}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Issues Grid */}
            <AnimatePresence>
              <motion.div
                layout
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredIssues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <IssueCard issue={issue} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredIssues.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center"
              >
                <AlertTriangle
                  size={64}
                  className="mx-auto mb-4 text-gray-300"
                />
                <p className="text-xl text-gray-500">No issues found</p>
                <p className="mt-2 text-gray-400">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 mt-6 text-white rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Floating Stats Toggle Button */}
      {viewMode === "map" && !showStats && !isMapFullscreen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setShowStats(true)}
          className="fixed z-20 p-3 text-white transition-all rounded-full shadow-lg bottom-6 right-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-xl"
        >
          <Info size={24} />
        </motion.button>
      )}
    </div>
  );
};

export default IssuesMap;
