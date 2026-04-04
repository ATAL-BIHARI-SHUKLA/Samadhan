import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Loader,
  Check,
  XCircle,
  Timer,
  ThumbsUp,
  Zap,
  Flag,
  Hourglass,
  Briefcase,
} from "lucide-react";

const StatusBadge = ({
  status,
  size = "md",
  showIcon = true,
  animated = true,
  onClick,
  variant = "default", // default, outline, gradient, minimal
  showProgress = false,
  progress = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = {
    reported: {
      label: "Reported",
      labelShort: "New",
      icon: AlertCircle,
      iconAlt: Flag,
      color: "yellow",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-200",
      gradient: "from-yellow-500 to-yellow-600",
      lightBg: "bg-yellow-50",
      darkBg: "bg-yellow-900",
      accent: "yellow-500",
      description: "Issue has been reported and is awaiting review",
      priority: "Medium",
    },
    "in-progress": {
      label: "In Progress",
      labelShort: "Active",
      icon: Clock,
      iconAlt: Timer,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
      gradient: "from-blue-500 to-blue-600",
      lightBg: "bg-blue-50",
      darkBg: "bg-blue-900",
      accent: "blue-500",
      description: "Work is currently underway to resolve this issue",
      priority: "High",
    },
    resolved: {
      label: "Resolved",
      labelShort: "Done",
      icon: CheckCircle,
      iconAlt: Check,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-200",
      gradient: "from-green-500 to-green-600",
      lightBg: "bg-green-50",
      darkBg: "bg-green-900",
      accent: "green-500",
      description: "Issue has been successfully resolved",
      priority: "Low",
    },
    pending: {
      label: "Pending",
      labelShort: "Wait",
      icon: Hourglass,
      iconAlt: Clock,
      color: "orange",
      bgColor: "bg-orange-100",
      textColor: "text-orange-800",
      borderColor: "border-orange-200",
      gradient: "from-orange-500 to-orange-600",
      lightBg: "bg-orange-50",
      darkBg: "bg-orange-900",
      accent: "orange-500",
      description: "Waiting for additional information or resources",
      priority: "Medium",
    },
    assigned: {
      label: "Assigned",
      labelShort: "Assigned",
      icon: Briefcase,
      iconAlt: CheckCircle,
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      borderColor: "border-purple-200",
      gradient: "from-purple-500 to-purple-600",
      lightBg: "bg-purple-50",
      darkBg: "bg-purple-900",
      accent: "purple-500",
      description: "A worker has been assigned and will start soon",
      priority: "High",
    },
    cancelled: {
      label: "Cancelled",
      labelShort: "Closed",
      icon: XCircle,
      iconAlt: AlertTriangle,
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-200",
      gradient: "from-red-500 to-red-600",
      lightBg: "bg-red-50",
      darkBg: "bg-red-900",
      accent: "red-500",
      description: "Issue has been cancelled or closed",
      priority: "None",
    },
    urgent: {
      label: "Urgent",
      labelShort: "ASAP",
      icon: Zap,
      iconAlt: AlertTriangle,
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-200",
      gradient: "from-red-500 to-orange-600",
      lightBg: "bg-red-50",
      darkBg: "bg-red-900",
      accent: "red-500",
      description: "Requires immediate attention",
      priority: "Critical",
    },
  };

  const config = statusConfig[status] || statusConfig.reported;
  const Icon = showIcon
    ? isHovered && config.iconAlt
      ? config.iconAlt
      : config.icon
    : null;

  const sizeClasses = {
    sm: {
      padding: "px-2 py-0.5",
      text: "text-xs",
      icon: "w-3 h-3",
      rounded: "rounded-full",
    },
    md: {
      padding: "px-3 py-1",
      text: "text-sm",
      icon: "w-4 h-4",
      rounded: "rounded-full",
    },
    lg: {
      padding: "px-4 py-1.5",
      text: "text-base",
      icon: "w-5 h-5",
      rounded: "rounded-xl",
    },
  };

  const sizeStyle = sizeClasses[size];

  const getVariantStyles = () => {
    switch (variant) {
      case "outline":
        return `border-2 border-${config.color}-500 text-${config.color}-700 bg-transparent hover:bg-${config.color}-50`;
      case "gradient":
        return `bg-gradient-to-r ${config.gradient} text-white border-0 shadow-md`;
      case "minimal":
        return `${config.lightBg} text-${config.color}-700 border-0`;
      default:
        return `${config.bgColor} ${config.textColor} border ${config.borderColor}`;
    }
  };

  const badgeContent = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`inline-flex items-center justify-center space-x-1.5 font-medium transition-all duration-300 ${sizeStyle.padding} ${sizeStyle.text} ${sizeStyle.rounded} ${getVariantStyles()} ${
        onClick ? "cursor-pointer" : ""
      }`}
      style={{
        boxShadow: isHovered ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
      }}
    >
      {showIcon && Icon && (
        <motion.div
          animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Icon
            className={`${sizeStyle.icon} ${variant === "gradient" ? "text-white" : ""}`}
          />
        </motion.div>
      )}
      <span className="relative">
        {size === "sm" ? config.labelShort : config.label}

        {/* Animated dot for active status */}
        {(status === "in-progress" || status === "urgent") && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full ${
              status === "urgent" ? "bg-red-500" : "bg-blue-500"
            }`}
          />
        )}
      </span>
    </motion.div>
  );

  // Progress bar variant
  if (showProgress && status === "in-progress") {
    return (
      <div className="relative">
        {badgeContent}
        <div className="absolute left-0 right-0 h-1 overflow-hidden bg-gray-200 rounded-full -bottom-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
          />
        </div>
      </div>
    );
  }

  return animated ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", damping: 12 }}
    >
      {badgeContent}
    </motion.div>
  ) : (
    badgeContent
  );
};

// Additional Badge Components
export const StatusBadgeGroup = ({ statuses, onStatusClick }) => {
  const statusOrder = [
    "urgent",
    "pending",
    "assigned",
    "reported",
    "in-progress",
    "resolved",
    "cancelled",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {statusOrder.map((status) => {
        const count = statuses[status] || 0;
        if (count === 0) return null;

        return (
          <div key={status} className="relative">
            <StatusBadge
              status={status}
              size="md"
              onClick={() => onStatusClick?.(status)}
            />
            <span className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gray-900 rounded-full -top-2 -right-2">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const StatusTimeline = ({ currentStatus, statusHistory }) => {
  const statuses = ["pending", "assigned", "in-progress", "resolved"];
  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className="w-full py-4">
      <div className="relative flex justify-between">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2" />
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${(currentIndex / (statuses.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 transform -translate-y-1/2"
        />

        {statuses.map((status, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const config = {
            pending: { icon: Hourglass, label: "Pending" },
            assigned: { icon: Briefcase, label: "Assigned" },
            "in-progress": { icon: Clock, label: "In Progress" },
            resolved: { icon: CheckCircle, label: "Resolved" },
          };
          const Icon = config[status].icon;

          return (
            <div
              key={status}
              className="relative z-10 flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white"
                    : "bg-gray-200 text-gray-400"
                } ${isCurrent ? "ring-4 ring-primary-200" : ""}`}
              >
                {isCompleted && idx < currentIndex ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </motion.div>
              <span
                className={`mt-2 text-xs font-medium ${isCompleted ? "text-primary-600" : "text-gray-400"}`}
              >
                {config[status].label}
              </span>
              {statusHistory?.[status] && (
                <span className="text-[10px] text-gray-400 mt-1">
                  {new Date(statusHistory[status]).toLocaleDateString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const StatusCard = ({ status, details, onAction }) => {
  const config = {
    pending: { icon: Hourglass, color: "orange", action: "Review Issue" },
    assigned: { icon: Briefcase, color: "purple", action: "Begin Work" },
    "in-progress": { icon: Clock, color: "blue", action: "Mark Resolved" },
    resolved: { icon: CheckCircle, color: "green", action: "View Report" },
  };

  const Icon = config[status]?.icon || AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border-l-4 border-${config[status]?.color}-500 bg-white shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 bg-${config[status]?.color}-100 rounded-lg`}>
            <Icon className={`w-5 h-5 text-${config[status]?.color}-600`} />
          </div>
          <div>
            <StatusBadge status={status} size="sm" />
            {details && <p className="mt-1 text-sm text-gray-600">{details}</p>}
          </div>
        </div>
        {onAction && (
          <button
            onClick={onAction}
            className={`px-3 py-1 text-sm font-medium text-${config[status]?.color}-600 hover:bg-${config[status]?.color}-50 rounded-lg transition-colors`}
          >
            {config[status]?.action}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default StatusBadge;
