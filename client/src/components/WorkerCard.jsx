import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  ThumbsUp,
  CheckCircle,
  Clock,
  MessageCircle,
  ExternalLink,
  TrendingUp,
  Shield,
  BadgeCheck,
  Heart,
  Eye,
  MoreVertical,
  ChevronRight,
  Navigation,
  Zap,
} from "lucide-react";

const WorkerCard = ({
  worker,
  onAssign,
  onContact,
  onViewProfile,
  compact = false,
  featured = false,
  variant = "default", // default, gradient, outline, minimal
  showActions = true,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getAvailabilityColor = (available) => {
    if (available === true)
      return "bg-green-100 text-green-800 border-green-200";
    if (available === false) return "bg-red-100 text-red-800 border-red-200";
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const getAvailabilityText = (available) => {
    if (available === true) return "Available";
    if (available === false) return "Busy";
    return "On Leave";
  };

  const getSkillLevel = (completedJobs) => {
    if (completedJobs >= 100)
      return { level: "Expert", color: "text-purple-600", icon: Award };
    if (completedJobs >= 50)
      return { level: "Advanced", color: "text-blue-600", icon: TrendingUp };
    if (completedJobs >= 20)
      return {
        level: "Intermediate",
        color: "text-green-600",
        icon: CheckCircle,
      };
    return { level: "Beginner", color: "text-gray-600", icon: Clock };
  };

  const skillInfo = getSkillLevel(worker.completedJobs);
  const SkillIcon = skillInfo.icon;

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    hover: {
      y: -8,
      transition: { type: "spring", stiffness: 300 },
    },
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "gradient":
        return "bg-gradient-to-br from-primary-50 to-primary-100 border-0 shadow-lg";
      case "outline":
        return "bg-white border-2 border-gray-200 hover:border-primary-300";
      case "minimal":
        return "bg-transparent shadow-none border border-gray-100 hover:shadow-md";
      default:
        return "bg-white shadow-md hover:shadow-xl";
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${getVariantStyles()} ${className}`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute z-10 top-3 right-3">
          <div className="flex items-center px-2 py-1 space-x-1 text-xs font-semibold text-white rounded-full shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500">
            <Zap size={12} />
            <span>Featured</span>
          </div>
        </div>
      )}

      {/* Verified Badge */}
      {worker.verified && (
        <div className="absolute z-10 top-3 left-3">
          <div className="flex items-center px-2 py-1 space-x-1 text-xs font-semibold text-white bg-blue-500 rounded-full shadow-lg">
            <BadgeCheck size={12} />
            <span>Verified</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`p-5 ${compact ? "p-3" : ""}`}>
        <div className="flex items-start space-x-4">
          {/* Avatar with Online Status */}
          <div className="relative">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={worker.avatar}
              alt={worker.name}
              className={`${compact ? "w-10 h-10" : "w-14 h-14"} rounded-full object-cover ring-2 ring-white shadow-md`}
            />
            {worker.available && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"
              />
            )}
          </div>

          {/* Worker Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className={`font-bold text-gray-900 ${compact ? "text-sm" : "text-lg"} flex items-center space-x-2`}
                >
                  {worker.name}
                  {worker.topRated && (
                    <span className="inline-flex items-center px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                      Top Rated
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">{worker.role}</p>
              </div>
              {!compact && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-gray-400 transition-colors hover:text-primary-600"
                >
                  <MoreVertical size={16} />
                </button>
              )}
            </div>

            {/* Ratings & Stats */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center space-x-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-sm font-semibold text-gray-700">
                  {worker.rating}
                </span>
                <span className="text-xs text-gray-400">
                  ({worker.reviews || 0} reviews)
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Briefcase size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {worker.completedJobs} jobs
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <SkillIcon size={14} className={skillInfo.color} />
                <span className={`text-xs font-medium ${skillInfo.color}`}>
                  {skillInfo.level}
                </span>
              </div>
            </div>

            {/* Availability Badge */}
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(worker.available)}`}
              >
                {getAvailabilityText(worker.available)}
              </span>
            </div>
          </div>
        </div>

        {/* Location (if available) */}
        {worker.location && !compact && (
          <div className="flex items-center mt-3 space-x-1 text-sm text-gray-500">
            <MapPin size={14} />
            <span>{worker.location}</span>
            <span className="text-xs text-gray-400">
              • {worker.distance || 2}km away
            </span>
          </div>
        )}

        {/* Skills Tags */}
        {worker.skills && !compact && (
          <div className="flex flex-wrap gap-1 mt-3">
            {worker.skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
            {worker.skills.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{worker.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Expanded Details */}
        <AnimatePresence>
          {showDetails && !compact && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 space-y-3 border-t border-gray-100">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-2">
                  {worker.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone size={14} className="text-gray-400" />
                      <span>{worker.phone}</span>
                    </div>
                  )}
                  {worker.email && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail size={14} className="text-gray-400" />
                      <span className="truncate">{worker.email}</span>
                    </div>
                  )}
                  {worker.joinedDate && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      <span>Joined {worker.joinedDate}</span>
                    </div>
                  )}
                  {worker.responseTime && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock size={14} className="text-gray-400" />
                      <span>Response: {worker.responseTime}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      ${worker.earnings}
                    </p>
                    <p className="text-xs text-gray-500">Total Earnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {worker.completedJobs}
                    </p>
                    <p className="text-xs text-gray-500">Jobs Done</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {worker.successRate || 98}%
                    </p>
                    <p className="text-xs text-gray-500">Success Rate</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {showActions && !compact && (
          <div className="pt-3 mt-4 border-t border-gray-100">
            <div className="flex items-center justify-between gap-2">
              {/* Like Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className={`p-2 rounded-lg transition-all ${
                  isLiked
                    ? "text-red-500 bg-red-50"
                    : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                }`}
              >
                <Heart size={18} className={isLiked ? "fill-current" : ""} />
              </motion.button>

              {/* Contact Button */}
              {onContact && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onContact(worker)}
                  className="flex items-center justify-center flex-1 px-3 py-2 space-x-1 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <MessageCircle size={16} />
                  <span className="text-sm">Message</span>
                </motion.button>
              )}

              {/* Assign Button */}
              {onAssign && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAssign(worker)}
                  className="flex items-center justify-center flex-1 px-3 py-2 space-x-1 text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                >
                  <Briefcase size={16} />
                  <span className="text-sm font-medium">Assign</span>
                </motion.button>
              )}

              {/* View Profile Button */}
              {onViewProfile && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewProfile(worker)}
                  className="p-2 text-gray-400 transition-colors rounded-lg hover:text-primary-600 hover:bg-primary-50"
                >
                  <ExternalLink size={18} />
                </motion.button>
              )}
            </div>
          </div>
        )}

        {/* Compact Mode Actions */}
        {compact && onAssign && (
          <div className="flex mt-3 space-x-2">
            <button
              onClick={() => onAssign(worker)}
              className="flex-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
            >
              Assign
            </button>
            {onContact && (
              <button
                onClick={() => onContact(worker)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                <MessageCircle size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hover Overlay Effect */}
      {isHovered && !compact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none bg-gradient-to-t from-primary-600/5 to-transparent"
        />
      )}
    </motion.div>
  );
};

// Additional Components
export const WorkerCardGrid = ({
  workers,
  onAssign,
  onContact,
  onViewProfile,
  columns = 3,
}) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}
    >
      {workers.map((worker) => (
        <WorkerCard
          key={worker.id}
          worker={worker}
          onAssign={onAssign}
          onContact={onContact}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
};

export const WorkerCardList = ({ workers, onAssign, onContact }) => {
  return (
    <div className="space-y-4">
      {workers.map((worker) => (
        <WorkerCard
          key={worker.id}
          worker={worker}
          onAssign={onAssign}
          onContact={onContact}
          compact
        />
      ))}
    </div>
  );
};

export const WorkerStatsCard = ({ worker }) => {
  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl">
      <div className="flex items-center mb-4 space-x-4">
        <img
          src={worker.avatar}
          alt={worker.name}
          className="w-16 h-16 rounded-full"
        />
        <div>
          <h3 className="text-lg font-bold">{worker.name}</h3>
          <p className="text-sm text-gray-600">{worker.role}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 text-center bg-gray-50 rounded-xl">
          <Briefcase size={20} className="mx-auto mb-1 text-primary-600" />
          <p className="text-2xl font-bold">{worker.completedJobs}</p>
          <p className="text-xs text-gray-500">Completed Jobs</p>
        </div>
        <div className="p-3 text-center bg-gray-50 rounded-xl">
          <Star size={20} className="mx-auto mb-1 text-yellow-500" />
          <p className="text-2xl font-bold">{worker.rating}</p>
          <p className="text-xs text-gray-500">Rating</p>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
