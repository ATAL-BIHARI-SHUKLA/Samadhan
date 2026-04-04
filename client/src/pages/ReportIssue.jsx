import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  MapPin,
  Camera,
  Send,
  Loader,
  X,
  AlertTriangle,
  CheckCircle,
  ImageIcon,
  Trash2,
  Navigation,
  Info,
  ArrowRight,
  Building,
  Droplet,
  Lightbulb,
  Car,
  Trash,
  Home,
  Mic,
  MicOff,
} from "lucide-react";
import UploadBox from "../components/UploadBox";
import { useApp } from "../context/AppContext";
import { useAuth } from "../hooks/useAuth";

const ReportIssue = () => {
  const navigate = useNavigate();
  const { addIssue } = useApp();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: { lat: null, lng: null, address: "" },
    image: null,
    imagePreview: null,
    category: "infrastructure",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [touched, setTouched] = useState({
    title: false,
    description: false,
  });
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  const categories = [
    {
      value: "infrastructure",
      label: "Infrastructure",
      icon: Building,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      value: "sanitation",
      label: "Sanitation",
      icon: Trash,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      value: "lighting",
      label: "Street Lighting",
      icon: Lightbulb,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      value: "water",
      label: "Water Supply",
      icon: Droplet,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      value: "traffic",
      label: "Traffic Issues",
      icon: Car,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      value: "other",
      label: "Other",
      icon: Home,
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === "description") {
      setCharacterCount(value.length);
    }
  };

  const updateLocationField = (field, value) => {
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        [field]: value,
      },
    });
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript.trim()) {
        setFormData((prev) => {
          const updatedDescription =
            `${prev.description.trim()} ${finalTranscript.trim()}`.trim();
          setCharacterCount(updatedDescription.length);
          return {
            ...prev,
            description: updatedDescription,
          };
        });
      }
    };

    recognition.onerror = () => {
      toast.error("Voice input error. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      recognition.stop?.();
    };
  }, []);

  const toggleVoiceListening = () => {
    if (!speechSupported) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      recognitionRef.current?.start();
      setIsListening(true);
      toast.success("Voice input active. Speak now.");
    } catch (error) {
      toast.error("Unable to start voice input.");
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleImageUpload = (file, preview) => {
    setFormData({
      ...formData,
      image: file,
      imagePreview: preview,
    });
    toast.success("Image uploaded successfully!");
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      image: null,
      imagePreview: null,
    });
  };

  const detectLocation = () => {
    setIsDetectingLocation(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Current Location Detected",
          },
        });
        toast.success("Location detected successfully!");
        setIsDetectingLocation(false);
      },
      (error) => {
        let errorMessage = "Unable to detect location.";
        if (error.code === 1) {
          errorMessage = "Please allow location access to use this feature.";
        }
        toast.error(errorMessage);
        setIsDetectingLocation(false);
      },
    );
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter an issue title");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return false;
    }
    if (formData.description.length < 10) {
      toast.error("Description must be at least 10 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newIssue = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        location: {
          address: formData.location.address || "Location not specified",
          lat: formData.location.lat,
          lng: formData.location.lng,
        },
        image: formData.imagePreview,
        category: formData.category,
        timestamp: new Date().toISOString(),
        status: "pending",
        votes: 0,
      };

      addIssue(newIssue);

      // Save to citizen's issues in localStorage
      if (user) {
        const userIssues = JSON.parse(
          localStorage.getItem("userIssues") || "{}",
        );
        if (!userIssues[user.id]) {
          userIssues[user.id] = [];
        }
        userIssues[user.id].push(newIssue);
        localStorage.setItem("userIssues", JSON.stringify(userIssues));
      }

      toast.success("Issue reported successfully!");
      setIsSubmitting(false);
      navigate("/map");
    }, 1500);
  };

  const selectedCategory = categories.find(
    (c) => c.value === formData.category,
  );

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden bg-white shadow-xl rounded-2xl"
        >
          {/* Header */}
          <div className="relative px-6 py-8 bg-gradient-to-r from-primary-600 to-primary-700">
            <h1 className="mb-2 text-2xl font-bold text-white">
              Report an Issue
            </h1>
            <p className="text-primary-100">
              Help us make our community better by reporting issues
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Upload Image (Optional)
              </label>
              {!formData.imagePreview ? (
                <UploadBox onImageUpload={handleImageUpload} maxSize={10} />
              ) : (
                <div className="relative">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="object-cover w-full h-48 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute p-1 text-white bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                onBlur={() => handleBlur("title")}
                placeholder="Brief description of the issue"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  touched.title && !formData.title.trim()
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {touched.title && !formData.title.trim() && (
                <p className="mt-1 text-sm text-red-500">
                  Please enter an issue title
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={() => handleBlur("description")}
                rows="4"
                maxLength="500"
                placeholder="Provide detailed information about the issue... (minimum 10 characters)"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  touched.description &&
                  (!formData.description.trim() ||
                    formData.description.length < 10)
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              <div className="flex flex-col gap-3 mt-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <button
                    type="button"
                    onClick={toggleVoiceListening}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isListening
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-primary-600 text-white hover:bg-primary-700"
                    }`}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    <span className="ml-2">
                      {isListening ? "Stop voice input" : "Use voice input"}
                    </span>
                  </button>
                  {!speechSupported && (
                    <p className="mt-2 text-sm text-gray-500">
                      Voice input is available on supported browsers only.
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {characterCount}/500 characters
                </p>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Tip: Use voice input to quickly describe the issue, then tweak
                the text manually.
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {touched.description && !formData.description.trim() && (
                  <p className="text-sm text-red-500">
                    Please enter a description
                  </p>
                )}
                {touched.description &&
                  formData.description.trim() &&
                  formData.description.length < 10 && (
                    <p className="text-sm text-red-500">
                      Description must be at least 10 characters
                    </p>
                  )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = formData.category === category.value;
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, category: category.value })
                      }
                      className={`p-3 rounded-lg transition-all ${
                        isSelected
                          ? `bg-gradient-to-r ${category.color} text-white shadow-md`
                          : `${category.bgColor} ${category.iconColor} border border-gray-200 hover:shadow-md`
                      }`}
                    >
                      <Icon size={24} className="mx-auto mb-1" />
                      <span className="text-xs font-medium">
                        {category.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Location (Optional)
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  name="address"
                  value={formData.location.address}
                  onChange={(e) =>
                    updateLocationField("address", e.target.value)
                  }
                  placeholder="Enter address or use auto-detect"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={isDetectingLocation}
                  className="flex items-center justify-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  {isDetectingLocation ? (
                    <Loader size={20} className="animate-spin" />
                  ) : (
                    <Navigation size={20} />
                  )}
                </button>
              </div>
              {formData.location.lat && formData.location.lng && (
                <div className="grid gap-3 mt-3 sm:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-xs font-medium text-gray-500">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.location.lat}
                      onChange={(e) =>
                        updateLocationField("lat", parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-xs font-medium text-gray-500">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.location.lng}
                      onChange={(e) =>
                        updateLocationField("lng", parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Auto-detect location for faster reporting. You can still edit
                the address or coordinates manually.
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-start space-x-2">
                <Info size={18} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    What happens next?
                  </p>
                  <p className="mt-1 text-xs text-blue-700">
                    Your issue will be reviewed and assigned to the appropriate
                    department. You'll receive updates on the status of your
                    report.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center w-full px-6 py-3 space-x-2 text-white transition-all rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Report Issue</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportIssue;
