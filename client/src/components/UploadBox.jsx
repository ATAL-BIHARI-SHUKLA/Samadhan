import React, { useRef, useState, useCallback } from "react";
import {
  Upload,
  X,
  Image,
  FileImage,
  Camera,
  Trash2,
  RotateCw,
  ZoomIn,
  Download,
  CheckCircle,
  AlertCircle,
  Loader,
  File,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const UploadBox = ({
  onImageUpload,
  maxSize = 5,
  accept = "image/*",
  multiple = false,
  compact = false,
  showPreview = true,
  onError,
  className = "",
}) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      const errorMsg = `File size must be less than ${maxSize}MB`;
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      const errorMsg = "Please upload an image file";
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback(
    async (file) => {
      if (!file) return;

      if (!validateFile(file)) return;

      setError("");
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      try {
        const reader = new FileReader();
        const previewData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });

        setTimeout(() => {
          setFiles((prev) => [...prev, file]);
          setPreviews((prev) => [...prev, previewData]);
          onImageUpload?.(
            multiple ? [...files, file] : file,
            multiple ? [...previews, previewData] : previewData,
          );
          setIsUploading(false);
          clearInterval(interval);
          setUploadProgress(100);

          setTimeout(() => setUploadProgress(0), 1000);
        }, 500);
      } catch (err) {
        setError("Error reading file");
        onError?.("Error reading file");
        setIsUploading(false);
        clearInterval(interval);
      }
    },
    [maxSize, onImageUpload, multiple, files, previews, onError],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);

      if (multiple) {
        droppedFiles.forEach((file) => handleFileSelect(file));
      } else {
        handleFileSelect(droppedFiles[0]);
      }
    },
    [multiple, handleFileSelect],
  );

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const openCamera = async () => {
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsCameraOpen(true);
      } catch (err) {
        const errorMsg =
          "Unable to access the camera. Please allow permission or use file upload.";
        setError(errorMsg);
        onError?.(errorMsg);
        cameraInputRef.current?.click();
      }
    } else {
      cameraInputRef.current?.click();
    }
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "camera-photo.jpg", {
          type: "image/jpeg",
        });
        handleFileSelect(file);
        closeCamera();
      },
      "image/jpeg",
      0.95,
    );
  };

  const handleTakePhoto = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
    openCamera();
  };

  const removeImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    onImageUpload?.(
      multiple ? files.filter((_, i) => i !== index) : null,
      multiple ? previews.filter((_, i) => i !== index) : null,
    );
  };

  const clearAll = () => {
    setFiles([]);
    setPreviews([]);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageUpload?.(null, null);
  };

  const downloadImage = (preview, index) => {
    const link = document.createElement("a");
    link.href = preview;
    link.download = `image-${index + 1}.jpg`;
    link.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file?.type?.includes("image")) return <FileImage size={20} />;
    return <File size={20} />;
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`flex items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isDragging
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 hover:border-primary-500 hover:bg-gray-50"
          }`}
        >
          <Camera size={24} className="mr-2 text-gray-400" />
          <span className="text-sm text-gray-600">Add Photo</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <AnimatePresence mode="wait">
        {previews.length === 0 && !isUploading ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-primary-500 bg-primary-50 scale-105"
                : "border-gray-300 hover:border-primary-500 hover:bg-gray-50"
            }`}
          >
            <motion.div
              animate={{ y: isDragging ? -10 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <Upload className="mx-auto mb-3 text-gray-400" size={48} />
                {isDragging && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                  >
                    <FolderOpen size={64} className="text-primary-500" />
                  </motion.div>
                )}
              </div>
              <p className="mb-1 font-medium text-gray-600">
                {isDragging ? "Drop to upload" : "Click or drag to upload"}
              </p>
              <p className="text-sm text-gray-400">
                PNG, JPG, GIF up to {maxSize}MB
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Tap to upload or take a photo directly.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleTakePhoto}
                  className="inline-flex items-center px-4 py-2 space-x-2 text-sm font-medium text-white transition-colors bg-primary-600 rounded-xl hover:bg-primary-700"
                >
                  <Camera size={16} />
                  <span>Take Photo</span>
                </motion.button>
              </div>
              {multiple && (
                <p className="mt-2 text-xs text-primary-500">
                  Multiple files allowed
                </p>
              )}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center mt-2 text-sm text-red-500"
                >
                  <AlertCircle size={14} className="mr-1" />
                  {error}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Upload Progress */}
            {isUploading && uploadProgress > 0 && uploadProgress < 100 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Uploading...</span>
                  <span className="text-sm font-medium text-primary-600">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                  />
                </div>
              </motion.div>
            )}

            {/* Image Grid */}
            <div className={multiple ? "grid grid-cols-2 gap-4" : "space-y-4"}>
              {previews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative overflow-hidden bg-gray-100 shadow-lg group rounded-2xl"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="object-cover w-full h-64 transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center space-x-3 transition-opacity duration-300 opacity-0 bg-black/60 group-hover:opacity-100">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedImage(preview)}
                      className="p-2 transition-colors bg-white rounded-full hover:bg-gray-100"
                      title="Zoom"
                    >
                      <ZoomIn size={18} className="text-gray-700" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => downloadImage(preview, index)}
                      className="p-2 transition-colors bg-white rounded-full hover:bg-gray-100"
                      title="Download"
                    >
                      <Download size={18} className="text-gray-700" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeImage(index)}
                      className="p-2 transition-colors bg-red-500 rounded-full hover:bg-red-600"
                      title="Remove"
                    >
                      <Trash2 size={18} className="text-white" />
                    </motion.button>
                  </div>

                  {/* File Info */}
                  <div className="absolute flex items-center px-2 py-1 space-x-2 text-xs text-white rounded-lg bottom-2 left-2 bg-black/70 backdrop-blur-sm">
                    {getFileIcon(files[index])}
                    <span>{formatFileSize(files[index]?.size || 0)}</span>
                  </div>

                  {/* Success Badge */}
                  <div className="absolute p-1 text-white bg-green-500 rounded-full top-2 right-2">
                    <CheckCircle size={14} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center flex-1 px-4 py-2 space-x-2 transition-colors bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                <Upload size={18} />
                <span>Add More</span>
              </motion.button>
              {previews.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearAll}
                  className="px-4 py-2 text-red-600 transition-colors bg-red-50 hover:bg-red-100 rounded-xl"
                >
                  Clear All
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const selectedFiles = Array.from(e.target.files);
          if (multiple) {
            selectedFiles.forEach((file) => handleFileSelect(file));
          } else {
            handleFileSelect(selectedFiles[0]);
          }
          e.target.value = "";
        }}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept={accept}
        capture="environment"
        onChange={(e) => {
          const selectedFiles = Array.from(e.target.files);
          handleFileSelect(selectedFiles[0]);
          e.target.value = "";
        }}
        className="hidden"
      />

      {/* Camera Capture Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl overflow-hidden bg-white rounded-3xl shadow-2xl"
            >
              <div className="relative overflow-hidden bg-black rounded-b-none">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="object-cover w-full h-96"
                />
                <button
                  type="button"
                  onClick={closeCamera}
                  className="absolute top-4 right-4 p-2 text-white bg-black/50 rounded-full hover:bg-black/70"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-3 p-4 bg-white">
                <p className="text-sm font-semibold text-gray-900">
                  Camera ready. Tap capture to take a photo.
                </p>
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 px-4 py-3 text-white bg-primary-600 rounded-xl hover:bg-primary-700"
                  >
                    Capture Photo
                  </button>
                  <button
                    type="button"
                    onClick={closeCamera}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Full size"
                className="object-contain w-full h-full rounded-xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute p-2 text-white transition-colors rounded-full top-4 right-4 bg-black/50 hover:bg-black/70"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Stats */}
      {previews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mt-3 text-sm text-gray-500"
        >
          <div className="flex items-center space-x-2">
            <Image size={14} />
            <span>
              {previews.length} file{previews.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div>
            Total size:{" "}
            {formatFileSize(
              files.reduce((acc, file) => acc + (file?.size || 0), 0),
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UploadBox;
