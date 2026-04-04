import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingSpinner = ({
  size = "md",
  fullScreen = false,
  variant = "primary", // primary, gradient, pulse, dots, wave
  text = "",
  overlay = false,
  delay = 0,
  onClose,
  minHeight = "200px",
}) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    "2xl": "w-20 h-20",
    "3xl": "w-24 h-24",
  };

  const borderSizes = {
    sm: "border-2",
    md: "border-4",
    lg: "border-4",
    xl: "border-4",
    "2xl": "border-4",
    "3xl": "border-4",
  };

  const getSpinnerColors = () => {
    switch (variant) {
      case "gradient":
        return "border-transparent border-t-primary-600 border-r-primary-500 border-b-primary-400";
      case "pulse":
        return "border-primary-600";
      case "dots":
        return "";
      case "wave":
        return "";
      default:
        return "border-gray-200 border-t-primary-600";
    }
  };

  // Variant 1: Classic Spinner
  const ClassicSpinner = () => (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} ${borderSizes[size]} rounded-full animate-spin ${getSpinnerColors()}`}
      />
      {text && <p className="mt-4 text-sm font-medium text-gray-600">{text}</p>}
    </div>
  );

  // Variant 2: Gradient Spinner
  const GradientSpinner = () => (
    <div className="relative">
      <div className={`${sizeClasses[size]} relative`}>
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-transparent border-t-primary-600 border-r-primary-500 border-b-primary-400 animate-spin`}
        />
        <div
          className={`absolute inset-0 rounded-full border-4 border-transparent border-l-primary-300/30 animate-pulse`}
        />
      </div>
      {text && (
        <p className="mt-4 text-sm font-semibold text-transparent bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text">
          {text}
        </p>
      )}
    </div>
  );

  // Variant 3: Pulsing Spinner
  const PulsingSpinner = () => (
    <div className="relative">
      <div className={`${sizeClasses[size]} relative`}>
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-primary-600 animate-ping opacity-75`}
        />
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-primary-600 absolute top-0 left-0 animate-pulse`}
        />
      </div>
      {text && (
        <p className="mt-4 text-sm font-medium text-primary-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  // Variant 4: Dots Spinner
  const DotsSpinner = () => (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-2">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.3,
              delay: dot * 0.1,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 0.2,
            }}
            className={`${size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-5 h-5"} bg-gradient-to-r from-primary-600 to-primary-500 rounded-full`}
          />
        ))}
      </div>
      {text && <p className="text-sm font-medium text-gray-600">{text}</p>}
    </div>
  );

  // Variant 5: Wave Spinner
  const WaveSpinner = () => (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-end h-12 space-x-1">
        {[0, 1, 2, 3, 4].map((bar) => (
          <motion.div
            key={bar}
            initial={{ height: 8 }}
            animate={{ height: [8, 32, 8] }}
            transition={{
              duration: 0.8,
              delay: bar * 0.1,
              repeat: Infinity,
              repeatType: "loop",
            }}
            className={`${size === "sm" ? "w-1" : size === "md" ? "w-1.5" : size === "lg" ? "w-2" : "w-2.5"} bg-gradient-to-t from-primary-600 to-primary-400 rounded-full`}
          />
        ))}
      </div>
      {text && <p className="text-sm font-medium text-gray-600">{text}</p>}
    </div>
  );

  // Variant 6: Circular Progress
  const CircularProgress = () => (
    <div className="relative">
      <svg className={`${sizeClasses[size]} transform -rotate-90`}>
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200"
        />
        <motion.circle
          cx="50%"
          cy="50%"
          r="40%"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-primary-600"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            strokeDasharray: "1 1",
          }}
        />
      </svg>
      {text && <p className="mt-4 text-sm font-medium text-gray-600">{text}</p>}
    </div>
  );

  // Variant 7: Skeleton Loader
  const SkeletonLoader = () => (
    <div className="w-full max-w-md space-y-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="w-5/6 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="w-4/6 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-32 mt-4 bg-gray-200 rounded animate-pulse" />
    </div>
  );

  const renderSpinner = () => {
    switch (variant) {
      case "gradient":
        return <GradientSpinner />;
      case "pulse":
        return <PulsingSpinner />;
      case "dots":
        return <DotsSpinner />;
      case "wave":
        return <WaveSpinner />;
      case "circular":
        return <CircularProgress />;
      case "skeleton":
        return <SkeletonLoader />;
      default:
        return <ClassicSpinner />;
    }
  };

  const spinnerContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay, duration: 0.2 }}
      className="flex flex-col items-center justify-center"
    >
      {renderSpinner()}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md"
        >
          {spinnerContent}
        </motion.div>
      </AnimatePresence>
    );
  }

  if (overlay) {
    return (
      <div className="relative" style={{ minHeight }}>
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return spinnerContent;
};

// Additional Loading Components
export const LoadingButton = ({ loading, children, ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`relative inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all ${
      loading ? "cursor-wait opacity-70" : ""
    } ${props.className || ""}`}
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
      </div>
    )}
    <span className={loading ? "opacity-0" : ""}>{children}</span>
  </button>
);

export const LoadingPage = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <LoadingSpinner size="lg" variant="gradient" text={text} />
  </div>
);

export const SkeletonCard = () => (
  <div className="overflow-hidden bg-white shadow-md rounded-2xl">
    <div className="h-48 bg-gray-200 animate-pulse" />
    <div className="p-5 space-y-4">
      <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded animate-pulse" />
        <div className="w-5/6 h-3 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="w-1/3 h-8 bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="overflow-hidden bg-white shadow-md rounded-2xl">
    <div className="p-4 border-b border-gray-200">
      <div className="w-1/4 h-6 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="w-1/3 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default LoadingSpinner;
