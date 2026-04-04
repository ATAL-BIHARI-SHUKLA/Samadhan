import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  MessageCircle,
  ThumbsUp,
  Share2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Briefcase,
  Star,
  Phone,
  Mail,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  Shield,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import StatusBadge from "../components/StatusBadge";
import { useApp } from "../context/AppContext";

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    issues,
    workers,
    assignWorker,
    updateIssueStatus,
    updateWorkerLocation,
    setChatOpen,
    submitFeedback,
    voteIssue,
    userRole,
  } = useApp();
  const [issue, setIssue] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const workerMapRef = useRef(null);
  const workerMapMarkersRef = useRef({
    issue: null,
    worker: null,
    route: null,
  });
  const workerMovementIntervalRef = useRef(null);

  const moveTowards = (from, to, stepKm) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const toDeg = (value) => (value * 180) / Math.PI;
    const lat1 = from.lat;
    const lon1 = from.lng;
    const lat2 = to.lat;
    const lon2 = to.lng;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const fullDistanceKm = 6371 * c;
    if (fullDistanceKm <= stepKm || fullDistanceKm === 0) {
      return { lat: lat2, lng: lon2 };
    }
    const fraction = stepKm / fullDistanceKm;
    return {
      lat: lat1 + (lat2 - lat1) * fraction,
      lng: lon1 + (lon2 - lon1) * fraction,
    };
  };

  useEffect(() => {
    if (workerMovementIntervalRef.current) {
      clearInterval(workerMovementIntervalRef.current);
      workerMovementIntervalRef.current = null;
    }

    if (
      !issue ||
      issue.status !== "assigned" ||
      !assignedWorker?.currentLocation?.lat ||
      !issue.location?.lat
    ) {
      return;
    }

    const stepKm = (30 / 3600) * 2; // ~0.0167 km every 2 seconds
    workerMovementIntervalRef.current = setInterval(() => {
      const currentLocation = assignedWorker.currentLocation;
      const nextLocation = moveTowards(currentLocation, issue.location, stepKm);
      const hasArrived =
        currentLocation.lat === nextLocation.lat &&
        currentLocation.lng === nextLocation.lng;

      if (hasArrived) {
        clearInterval(workerMovementIntervalRef.current);
        workerMovementIntervalRef.current = null;
        return;
      }

      updateWorkerLocation(assignedWorker.id, nextLocation);
    }, 2000);

    return () => {
      if (workerMovementIntervalRef.current) {
        clearInterval(workerMovementIntervalRef.current);
        workerMovementIntervalRef.current = null;
      }
    };
  }, [issue, assignedWorker, updateWorkerLocation]);

  useEffect(() => {
    const foundIssue = issues.find((i) => i.id === parseInt(id));
    setIssue(foundIssue);
    if (foundIssue) {
      setLikesCount(foundIssue.votes || 0);
      setFeedbackRating(foundIssue.feedback?.rating || 0);
      setFeedbackComment(foundIssue.feedback?.comment || "");
      setFeedbackSubmitted(Boolean(foundIssue.feedback));
    }
  }, [id, issues]);

  if (!issue) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mb-6">
            <AlertTriangle size={64} className="mx-auto text-yellow-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Issue not found
          </h2>
          <p className="mb-6 text-gray-600">
            The issue you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/map")}
            className="inline-flex items-center px-6 py-3 text-white transition-all shadow-lg rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 hover:shadow-xl"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Map
          </button>
        </motion.div>
      </div>
    );
  }

  const assignedWorker = workers.find((w) => w.id === issue.assignedTo);
  const timeAgo = new Date(issue.timestamp).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeDetailed = new Date(issue.timestamp).toLocaleString("en-US", {
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
  });

  const handleAssignWorker = () => {
    if (selectedWorker) {
      assignWorker(issue.id, parseInt(selectedWorker));
      toast.success("Worker assigned successfully!", {
        icon: "✅",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      setSelectedWorker("");
    }
  };

  const handleUpdateStatus = (status) => {
    updateIssueStatus(issue.id, status);
    setStatusUpdate(status);
    const statusMessages = {
      pending: "Issue is pending review and will be assigned soon",
      assigned: "A worker has been assigned to this issue",
      "in-progress": "Work has started on this issue",
      resolved: "Issue has been resolved successfully! 🎉",
    };
    toast.success(statusMessages[status] || `Status updated to ${status}`, {
      icon: status === "resolved" ? "🎉" : "✅",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  };

  const handleLike = () => {
    if (!liked) {
      voteIssue(issue.id, 1);
      setLikesCount(likesCount + 1);
      setLiked(true);
      toast.success("Thank you for your support!", {
        icon: "👍",
        duration: 2000,
      });
    } else {
      voteIssue(issue.id, -1);
      setLikesCount(Math.max(0, likesCount - 1));
      setLiked(false);
      toast("Support withdrawn", {
        icon: "🤍",
        duration: 1500,
      });
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this issue: ${issue.title}`;

    switch (platform) {
      case "copy":
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank",
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank",
        );
        break;
      default:
        break;
    }
    setShowShareOptions(false);
  };

  const getDistanceKm = (from, to) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const lat1 = from.lat;
    const lon1 = from.lng;
    const lat2 = to.lat;
    const lon2 = to.lng;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c;
  };

  const getWorkerDistance = () => {
    if (!assignedWorker?.currentLocation || !issue.location) return null;
    return getDistanceKm(assignedWorker.currentLocation, issue.location);
  };

  const getWorkerEta = () => {
    const distanceKm = getWorkerDistance();
    if (!distanceKm || issue.status !== "assigned") {
      return issue.status === "in-progress" ? 0 : null;
    }

    const averageSpeedKmh = 30;
    const eta = Math.round((distanceKm / averageSpeedKmh) * 60);
    return Math.max(2, eta);
  };

  const getWorkerTrackingStatus = () => {
    if (issue.status === "assigned") {
      return "Worker is en route and will reach the location shortly.";
    }
    if (issue.status === "in-progress") {
      return "Worker has arrived and is currently resolving the issue.";
    }
    return "Worker tracking information will appear once a technician is assigned.";
  };

  const getWorkerProgressWidth = () => {
    if (!assignedWorker?.currentLocation || !issue.location) return 0;
    if (issue.status === "in-progress") return 100;

    const distanceKm = getWorkerDistance();
    const maxDistanceKm = 5;
    const progress = 100 - Math.min(100, (distanceKm / maxDistanceKm) * 100);
    return Math.max(15, progress);
  };

  const distanceKm = getWorkerDistance();
  const etaMinutes = getWorkerEta();

  const createProximityIcon = (label, color) =>
    L.divIcon({
      html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:${color};color:#fff;font-weight:700;font-size:14px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.18);">${label}</div>`,
      className: "proximity-marker-icon",
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    });

  useEffect(() => {
    if (!issue || !issue.location?.lat || !issue.location?.lng) return;

    if (workerMapRef.current) {
      workerMapRef.current.remove();
      workerMapRef.current = null;
    }

    const map = L.map("worker-proximity-map", {
      zoomControl: false,
      attributionControl: false,
    }).setView([issue.location.lat, issue.location.lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const clearMarkers = () => {
      Object.values(workerMapMarkersRef.current).forEach((item) => {
        if (item?.remove) item.remove();
      });
      workerMapMarkersRef.current = { issue: null, worker: null, route: null };
    };

    clearMarkers();

    const issueMarker = L.marker([issue.location.lat, issue.location.lng], {
      icon: createProximityIcon("I", "#10b981"),
    })
      .addTo(map)
      .bindPopup(
        `<strong>Issue location</strong><br/>${issue.location.address || ""}`,
      );
    workerMapMarkersRef.current.issue = issueMarker;

    const bounds = [issueMarker.getLatLng()];

    if (
      assignedWorker?.currentLocation?.lat &&
      assignedWorker.currentLocation.lng
    ) {
      const workerMarker = L.marker(
        [
          assignedWorker.currentLocation.lat,
          assignedWorker.currentLocation.lng,
        ],
        {
          icon: createProximityIcon("W", "#2563eb"),
        },
      )
        .addTo(map)
        .bindPopup(
          `<strong>Worker location</strong><br/>${assignedWorker.name}`,
        );
      workerMapMarkersRef.current.worker = workerMarker;
      bounds.push(workerMarker.getLatLng());

      const route = L.polyline(
        [
          [
            assignedWorker.currentLocation.lat,
            assignedWorker.currentLocation.lng,
          ],
          [issue.location.lat, issue.location.lng],
        ],
        {
          color: "#2563eb",
          dashArray: "6,8",
          weight: 3,
          opacity: 0.7,
        },
      ).addTo(map);
      workerMapMarkersRef.current.route = route;
    }

    map.fitBounds(bounds, { padding: [40, 40] });
    workerMapRef.current = map;

    return () => {
      if (workerMapRef.current) {
        workerMapRef.current.remove();
        workerMapRef.current = null;
      }
    };
  }, [issue, assignedWorker]);

  const getStatusProgress = () => {
    const statuses = ["pending", "assigned", "in-progress", "resolved"];
    const currentIndex = statuses.indexOf(issue.status);
    return (currentIndex / (statuses.length - 1)) * 100;
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30">
      <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center mb-6 text-gray-600 transition-all hover:text-primary-600 group"
        >
          <ArrowLeft
            size={20}
            className="mr-2 transition-transform group-hover:-translate-x-1"
          />
          <span className="font-medium">Back</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden bg-white shadow-2xl rounded-2xl"
        >
          {/* Image Section with Overlay */}
          {issue.image && (
            <div className="relative overflow-hidden h-72 md:h-96 group">
              <img
                src={issue.image}
                alt={issue.title}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-4 right-4">
                <StatusBadge status={issue.status} />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center space-x-2 text-white">
                  <Clock size={16} />
                  <span className="text-sm">Reported {timeDetailed}</span>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Title and Status */}
            <div className="mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  {issue.title}
                </h1>
                {!issue.image && <StatusBadge status={issue.status} />}
              </div>

              {/* Location and Date Cards */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center px-4 py-2 space-x-2 bg-gray-50 rounded-xl">
                  <MapPin size={16} className="text-primary-600" />
                  <span className="text-sm text-gray-700">
                    {issue.location.address}
                  </span>
                </div>
                <div className="flex items-center px-4 py-2 space-x-2 bg-gray-50 rounded-xl">
                  <Calendar size={16} className="text-primary-600" />
                  <span className="text-sm text-gray-700">
                    Reported {timeAgo}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar for Status */}
            <div className="mb-8">
              <div className="flex justify-between mb-2 text-xs text-gray-600">
                <span>Pending</span>
                <span>Assigned</span>
                <span>In Progress</span>
                <span>Resolved</span>
              </div>
              <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getStatusProgress()}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    issue.status === "resolved"
                      ? "bg-gradient-to-r from-green-500 to-green-600"
                      : issue.status === "in-progress"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                        : issue.status === "assigned"
                          ? "bg-gradient-to-r from-purple-500 to-purple-600"
                          : "bg-gradient-to-r from-orange-500 to-orange-600"
                  }`}
                />
              </div>
            </div>

            {issue.status === "assigned" && (
              <div className="mb-8 px-6 py-4 bg-purple-50 rounded-2xl border border-purple-200">
                <div className="flex items-center gap-3 text-purple-700">
                  <Briefcase size={18} className="flex-shrink-0" />
                  <div>
                    <p className="font-medium">
                      Worker assigned and ready to start.
                    </p>
                    <p className="text-sm text-purple-600">
                      This issue has been assigned to a worker. Update status to
                      In Progress when work begins.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="p-6 mb-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Description
              </h3>
              <p className="leading-relaxed text-gray-700">
                {issue.description}
              </p>
            </div>

            {/* Assigned Worker Card */}
            {assignedWorker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 mb-8 overflow-hidden border bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl border-primary-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center text-lg font-semibold text-gray-900">
                    <Briefcase size={20} className="mr-2 text-primary-600" />
                    Assigned Worker
                  </h3>
                  <Award size={20} className="text-primary-600" />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={assignedWorker.avatar}
                      alt={assignedWorker.name}
                      className="w-16 h-16 border-2 border-white rounded-full shadow-lg"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900">
                      {assignedWorker.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {assignedWorker.role}
                    </p>
                    <div className="mt-4 p-4 rounded-2xl bg-white border border-primary-100 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-primary-700">
                            Live worker tracking
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            {getWorkerTrackingStatus()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            issue.status === "assigned"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {issue.status === "assigned"
                            ? "On the way"
                            : "In progress"}
                        </span>
                      </div>

                      <div className="mb-3 text-sm text-gray-700 space-y-2">
                        <div>
                          <span className="font-semibold">Distance:</span>{" "}
                          {distanceKm !== null
                            ? `${distanceKm.toFixed(1)} km`
                            : "Calculating..."}
                        </div>
                        <div>
                          <span className="font-semibold">ETA:</span>{" "}
                          {issue.status === "in-progress"
                            ? "Arrived"
                            : etaMinutes !== null
                              ? `${etaMinutes} min`
                              : "Estimating..."}
                        </div>
                      </div>

                      <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
                        <div
                          style={{ width: `${getWorkerProgressWidth()}%` }}
                          className={`h-full rounded-full ${
                            issue.status === "assigned"
                              ? "bg-gradient-to-r from-blue-500 to-blue-600"
                              : "bg-gradient-to-r from-green-500 to-green-600"
                          }`}
                        />
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Clock size={14} className="mr-2" />
                        <span>
                          {issue.status === "assigned"
                            ? "Estimated arrival time for the assigned worker"
                            : "Ongoing work progress updated live"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Worker proximity map
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              {distanceKm !== null
                                ? distanceKm <= 1.2
                                  ? "Worker is very close to your location."
                                  : `Worker is ${distanceKm.toFixed(1)} km away from the issue.`
                                : "Worker location will appear here once assigned."}
                            </p>
                          </div>
                          <div className="rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700">
                            {issue.status === "assigned"
                              ? "En route"
                              : "On site"}
                          </div>
                        </div>
                      </div>
                      <div id="worker-proximity-map" className="h-64" />
                    </div>

                    <div className="flex items-center mt-1 space-x-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={14}
                          className={
                            index < Math.round(assignedWorker.rating)
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }
                        />
                      ))}
                      <span className="text-sm text-gray-600">
                        {assignedWorker.rating} rating
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-600 transition-colors bg-white rounded-lg hover:text-primary-600">
                      <Phone size={16} />
                    </button>
                    <button className="p-2 text-gray-600 transition-colors bg-white rounded-lg hover:text-primary-600">
                      <Mail size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Citizen Feedback */}
            {issue.status === "resolved" && assignedWorker && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 mb-8 border border-gray-200 rounded-2xl bg-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Rate the Worker
                    </h3>
                    <p className="text-sm text-gray-600">
                      Share your feedback to help improve future service.
                    </p>
                  </div>
                  {feedbackSubmitted && (
                    <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                      Feedback submitted
                    </span>
                  )}
                </div>

                {feedbackSubmitted ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={18}
                          className={
                            index < Math.round(feedbackRating)
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }
                        />
                      ))}
                      <span className="text-sm font-semibold text-gray-800">
                        {feedbackRating} out of 5
                      </span>
                    </div>
                    {feedbackComment && (
                      <div className="p-4 rounded-2xl bg-gray-50">
                        <p className="text-sm text-gray-700">
                          {feedbackComment}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFeedbackRating(index + 1)}
                          className="transition-transform hover:-translate-y-0.5"
                        >
                          <Star
                            size={24}
                            className={
                              index < feedbackRating
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      rows="4"
                      placeholder="Tell us how the worker did and what could be improved..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (feedbackRating === 0) {
                          toast.error(
                            "Please select a rating before submitting.",
                          );
                          return;
                        }
                        submitFeedback(
                          issue.id,
                          feedbackRating,
                          feedbackComment,
                        );
                        setFeedbackSubmitted(true);
                        toast.success("Thank you for your rating!");
                      }}
                      className="inline-flex items-center justify-center px-5 py-3 text-white transition-all rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                    >
                      Submit Feedback
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Admin Actions - Enhanced */}
            {userRole === "admin" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 mb-8 border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white rounded-2xl"
              >
                <div className="flex items-center mb-4">
                  <Shield size={20} className="mr-2 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Admin Actions
                  </h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Update Status
                    </label>
                    <select
                      value={issue.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="assigned">👷 Assigned</option>
                      <option value="in-progress">⚙️ In Progress</option>
                      <option value="resolved">✅ Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Assign Worker
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={selectedWorker}
                        onChange={(e) => setSelectedWorker(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select a worker...</option>
                        {workers.map((worker) => (
                          <option key={worker.id} value={worker.id}>
                            {worker.name} - {worker.role} (⭐ {worker.rating})
                          </option>
                        ))}
                      </select>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAssignWorker}
                        disabled={!selectedWorker}
                        className="px-6 py-2.5 text-white transition-all rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      >
                        Assign
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between pt-6 border-t-2 border-gray-100">
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    liked
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ThumbsUp size={20} className={liked ? "fill-current" : ""} />
                  <span className="font-medium">
                    {likesCount} Support{likesCount !== 1 ? "s" : ""}
                  </span>
                </motion.button>

                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="flex items-center px-4 py-2 space-x-2 text-gray-600 transition-all rounded-xl hover:bg-gray-100"
                  >
                    <Share2 size={20} />
                    <span>Share</span>
                    <ChevronDown size={16} />
                  </motion.button>

                  <AnimatePresence>
                    {showShareOptions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10 min-w-[160px]"
                      >
                        <button
                          onClick={() => handleShare("copy")}
                          className="flex items-center w-full px-4 py-2 space-x-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          {isCopied ? <Check size={16} /> : <Copy size={16} />}
                          <span>{isCopied ? "Copied!" : "Copy Link"}</span>
                        </button>
                        <button
                          onClick={() => handleShare("twitter")}
                          className="flex items-center w-full px-4 py-2 space-x-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <span>𝕏</span>
                          <span>Share on X</span>
                        </button>
                        <button
                          onClick={() => handleShare("facebook")}
                          className="flex items-center w-full px-4 py-2 space-x-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <span>📘</span>
                          <span>Share on Facebook</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setChatOpen(true)}
                className="flex items-center px-6 py-2.5 space-x-2 text-white transition-all rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl"
              >
                <MessageCircle size={18} />
                <span className="font-medium">Ask AI Assistant</span>
                <ExternalLink size={14} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IssueDetails;
