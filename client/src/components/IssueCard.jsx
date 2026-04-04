import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  MapPin,
  Calendar,
  ThumbsUp,
  MessageCircle,
  Share2,
  Eye,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "./StatusBadge";
import { formatDistanceToNow, format } from "date-fns";

const IssueCard = ({ issue, compact = false, featured = false }) => {
  const { voteIssue } = useApp();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(issue.votes || 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    setLikesCount(issue.votes || 0);
  }, [issue.votes]);

  const timeAgo = formatDistanceToNow(new Date(issue.timestamp), {
    addSuffix: true,
  });

  const formattedDate = format(
    new Date(issue.timestamp),
    "MMM dd, yyyy • hh:mm a",
  );

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    voteIssue(issue.id, isLiked ? -1 : 1);
    setLikesCount((prev) => Math.max(0, prev + (isLiked ? -1 : 1)));
    setIsLiked(!isLiked);
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const getPriorityScore = (issueItem) => {
    const urgencyWeight =
      issueItem.urgency === "high"
        ? 40
        : issueItem.urgency === "medium"
          ? 20
          : issueItem.urgency === "low"
            ? 10
            : 0;
    const statusWeight =
      issueItem.status === "pending"
        ? 15
        : issueItem.status === "in-progress"
          ? 12
          : issueItem.status === "assigned"
            ? 10
            : 0;
    return (issueItem.votes || 0) * 5 + urgencyWeight + statusWeight;
  };

  const getPriorityBadge = () => {
    if (issue.urgency) {
      return {
        label: `${issue.urgency.charAt(0).toUpperCase() + issue.urgency.slice(1)} Priority`,
        style: getUrgencyColor(issue.urgency),
      };
    }

    if (issue.votes >= 20) {
      return {
        label: "Top Community Priority",
        style: "bg-red-100 text-red-700 border-red-200",
      };
    }

    if (issue.votes >= 10) {
      return {
        label: "Trending Priority",
        style: "bg-orange-100 text-orange-700 border-orange-200",
      };
    }

    return {
      label: "Community Support",
      style: "bg-blue-100 text-blue-700 border-blue-200",
    };
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "infrastructure":
        return <TrendingUp size={12} />;
      case "sanitation":
        return <AlertTriangle size={12} />;
      case "lighting":
        return <Eye size={12} />;
      case "water":
        return <Users size={12} />;
      default:
        return <AlertTriangle size={12} />;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "low":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    hover: {
      y: -8,
      transition: { duration: 0.3, type: "spring", stiffness: 300 },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
        featured ? "ring-2 ring-primary-500 ring-offset-2" : ""
      }`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute z-10 top-4 left-4">
          <div className="flex items-center px-3 py-1 space-x-1 text-xs font-semibold text-white rounded-full shadow-lg bg-gradient-to-r from-primary-600 to-primary-700">
            <TrendingUp size={12} />
            <span>Featured</span>
          </div>
        </div>
      )}

      {/* Image Section */}
      {issue.image && !compact && (
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 rounded-full border-primary-500 border-t-transparent animate-spin"></div>
            </div>
          )}
          <img
            src={issue.image}
            alt={issue.title}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:opacity-100" />

          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <StatusBadge status={issue.status} />
          </div>

          {/* Urgency Badge (if exists) */}
          {issue.urgency && (
            <div className="absolute bottom-4 left-4">
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium border ${getUrgencyColor(issue.urgency)}`}
              >
                <AlertTriangle size={10} />
                <span>{issue.urgency.toUpperCase()} PRIORITY</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-5">
        {/* Title and Category */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 transition-colors line-clamp-2 group-hover:text-primary-600">
              {issue.title}
            </h3>
            {issue.category && (
              <div className="flex items-center mt-1 space-x-1">
                {getCategoryIcon(issue.category)}
                <span className="text-xs text-gray-500 capitalize">
                  {issue.category}
                </span>
              </div>
            )}
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.16em] border ${getPriorityBadge().style}`}
              >
                {getPriorityBadge().label}
              </span>
            </div>
          </div>
          {compact && (
            <div className="ml-2">
              <StatusBadge status={issue.status} />
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-gray-600 line-clamp-2">
          {issue.description}
        </p>

        {/* Location and Time */}
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center space-x-2 group/location">
            <div className="p-1 transition-colors bg-gray-100 rounded-lg group-hover/location:bg-primary-100">
              <MapPin
                size={12}
                className="transition-colors group-hover/location:text-primary-600"
              />
            </div>
            <span className="flex-1 truncate">{issue.location.address}</span>
          </div>
          {issue.distance !== null && issue.distance !== undefined && (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="px-2 py-1 rounded-full bg-gray-100">
                {issue.distance} km away
              </span>
            </div>
          )}
          <div className="flex items-center space-x-2 group/time">
            <div className="p-1 transition-colors bg-gray-100 rounded-lg group-hover/time:bg-primary-100">
              <Clock
                size={12}
                className="transition-colors group-hover/time:text-primary-600"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs">{timeAgo}</span>
              <span className="hidden text-xs text-gray-400 group-hover/time:block">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between pt-4 mt-5 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            {/* Like Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg transition-all ${
                isLiked
                  ? "text-red-500 bg-red-50"
                  : "text-gray-500 hover:text-red-500 hover:bg-red-50"
              }`}
            >
              <ThumbsUp size={14} className={isLiked ? "fill-current" : ""} />
              <span className="text-xs font-medium">{likesCount}</span>
            </motion.button>

            {/* Comments Button */}
            <Link
              to={`/issue/${issue.id}#comments`}
              className="flex items-center space-x-1.5 px-2 py-1 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all"
            >
              <MessageCircle size={14} />
              <span className="text-xs font-medium">
                {issue.commentsCount || 0}
              </span>
            </Link>

            {/* Views Count */}
            <div className="flex items-center space-x-1.5 px-2 py-1 text-gray-400">
              <Eye size={14} />
              <span className="text-xs">{issue.views || 0}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Bookmark Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg transition-all ${
                isBookmarked
                  ? "text-primary-600 bg-primary-50"
                  : "text-gray-400 hover:text-primary-600 hover:bg-primary-50"
              }`}
            >
              {isBookmarked ? (
                <BookmarkCheck size={16} />
              ) : (
                <Bookmark size={16} />
              )}
            </motion.button>

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
            >
              <Share2 size={16} />
            </motion.button>

            {/* View Details Link */}
            <Link
              to={`/issue/${issue.id}`}
              className="group/link flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg"
            >
              <span className="text-xs font-medium">Details</span>
              <ChevronRight
                size={14}
                className="group-hover/link:translate-x-0.5 transition-transform"
              />
            </Link>
          </div>
        </div>

        {/* Floating Action Bar (on hover) */}
        <AnimatePresence>
          {showActions && !compact && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 right-4"
            >
              <div className="flex flex-col space-y-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="p-2 bg-white rounded-full shadow-lg text-primary-600 hover:text-primary-700"
                >
                  <ExternalLink size={16} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar for Resolved Issues */}
      {issue.status === "resolved" && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1 }}
            className="h-full bg-green-400"
          />
        </div>
      )}

      {/* Loading Skeleton (optional) */}
      {!issue && (
        <div className="p-5 space-y-4">
          <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default IssueCard;
