import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Navigation,
  Filter,
  Layers,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Info,
  X,
  Compass,
  Loader,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Plus,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";

// Fix for default markers in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons based on status
const getMarkerIcon = (status, isSelected = false, priorityScore = 0) => {
  const colors = {
    pending: "#f59e0b",
    assigned: "#8b5cf6",
    "in-progress": "#3b82f6",
    resolved: "#10b981",
  };

  const color = colors[status] || "#ef4444";
  const size = isSelected ? 40 : 34;
  const scoreLabel = priorityScore ? `${priorityScore}` : "";

  return L.divIcon({
    html: `<div style="position:relative; width:${size}px; height:${size}px;">
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 12px rgba(0,0,0,0.28);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <svg width="${size / 2}" height="${size / 2}" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        </svg>
      </div>
      ${scoreLabel ? `<div style="position:absolute; bottom:-6px; right:-6px; min-width:20px; height:20px; padding:0 4px; display:flex; align-items:center; justify-content:center; border-radius:999px; background:white; color:${color}; font-size:10px; font-weight:700; border:1px solid ${color}; box-shadow: 0 1px 4px rgba(0,0,0,0.12);">${scoreLabel}</div>` : ""}
    </div>`,
    className: "custom-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size / 2],
  });
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
  return Math.max(
    0,
    Math.round((issue.votes || 0) * 5 + urgencyWeight + statusWeight),
  );
};

const MapView = ({
  issues,
  center,
  zoom,
  selectedIssue: selectedIssueProp,
  userLocation,
  onMarkerClick,
  onViewDetails,
  height = "500px",
}) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [internalSelectedIssue, setInternalSelectedIssue] = useState(null);
  const [showLegend, setShowLegend] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [mapType, setMapType] = useState("street");
  const [isLocating, setIsLocating] = useState(false);
  const [bounds, setBounds] = useState(null);
  const [clusterMode, setClusterMode] = useState(false);
  const activeSelectedIssue = selectedIssueProp || internalSelectedIssue;

  useEffect(() => {
    if (selectedIssueProp) {
      setInternalSelectedIssue(selectedIssueProp);
    }
  }, [selectedIssueProp]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("map-container").setView(
        [center.lat, center.lng],
        zoom,
      );

      // Base tile layers
      const streetLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        },
      );

      const satelliteLayer = L.tileLayer(
        "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        {
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          attribution: "© Google",
          maxZoom: 20,
        },
      );

      const darkLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "© CartoDB",
          subdomains: "abcd",
          maxZoom: 19,
        },
      );

      // Add default layer
      streetLayer.addTo(map);

      // Store layers for switching
      map.layers = {
        street: streetLayer,
        satellite: satelliteLayer,
        dark: darkLayer,
      };
      map.currentLayer = "street";

      // Add scale control
      L.control
        .scale({ metric: true, imperial: false, position: "bottomleft" })
        .addTo(map);

      // Add geocoder control
      L.Control.geocoder({
        defaultMarkGeocode: false,
        position: "topleft",
        placeholder: "Search location...",
        errorMessage: "Location not found",
      })
        .on("markgeocode", (e) => {
          const center = e.geocode.center;
          map.setView(center, 15);
          L.marker(center, {
            icon: L.divIcon({
              html: '<div style="background: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
              className: "search-marker",
            }),
          })
            .addTo(map)
            .bindPopup(e.geocode.name)
            .openPopup();
        })
        .addTo(map);

      mapRef.current = map;
      setIsMapLoaded(true);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when issues change
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    issues?.forEach((issue) => {
      if (issue.location?.lat && issue.location?.lng) {
        const priorityScore = getPriorityScore(issue);
        const marker = L.marker([issue.location.lat, issue.location.lng], {
          icon: getMarkerIcon(
            issue.status,
            activeSelectedIssue?.id === issue.id,
            priorityScore,
          ),
        }).addTo(mapRef.current);

        // Popup content
        const distanceLabel =
          issue.distance != null
            ? `${issue.distance} km away`
            : "Location details unavailable";
        const popupContent = `
          <div style="min-width:280px; padding:16px; font-family:system-ui, sans-serif; color:#111;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px;">
              <h3 style="margin:0; font-size:16px; font-weight:700; line-height:1.2;">${issue.title}</h3>
              <span style="padding:4px 8px; font-size:11px; font-weight:700; border-radius:999px; background:#f3f4f6; color:#111; border:1px solid #d1d5db;">P ${priorityScore}</span>
            </div>
            <p style="margin:0 0 10px; font-size:13px; color:#4b5563; line-height:1.4; max-height:48px; overflow:hidden; text-overflow:ellipsis;">${issue.description}</p>
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; font-size:11px; color:#6b7280;">
              <span>${new Date(issue.timestamp).toLocaleDateString()}</span>
              <span>•</span>
              <span style="text-transform:capitalize;">${issue.status}</span>
              <span>•</span>
              <span>${distanceLabel}</span>
            </div>
            <button
              onclick="window.viewIssueDetails(${issue.id})"
              style="width:100%; padding:10px 14px; font-size:13px; color:#fff; background:#2563eb; border:none; border-radius:12px; cursor:pointer;"
            >
              View Details →
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, { closeButton: false });
        marker.on("mouseover", () => {
          marker.openPopup();
          setInternalSelectedIssue(issue);
        });
        marker.on("mouseout", () => {
          if (activeSelectedIssue?.id !== issue.id) {
            marker.closePopup();
          }
        });
        marker.on("click", () => {
          setInternalSelectedIssue(issue);
          onMarkerClick?.(issue);
        });

        markersRef.current.push(marker);
      }
    });

    // Optional: Add marker clustering
    if (clusterMode && markersRef.current.length > 0) {
      // You can add Leaflet.markercluster plugin here
    }
  }, [issues, isMapLoaded, activeSelectedIssue, clusterMode, onMarkerClick]);

  // Handle map type change
  const changeMapType = (type) => {
    if (!mapRef.current) return;

    Object.values(mapRef.current.layers).forEach((layer) => {
      mapRef.current.removeLayer(layer);
    });

    mapRef.current.layers[type].addTo(mapRef.current);
    mapRef.current.currentLayer = type;
    setMapType(type);
  };

  // Handle locate user
  const locateUser = () => {
    if (!mapRef.current) return;

    setIsLocating(true);
    mapRef.current.locate({ setView: true, maxZoom: 16 });

    mapRef.current.on("locationfound", (e) => {
      const circle = L.circle(e.latlng, {
        radius: 100,
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.2,
      }).addTo(mapRef.current);

      L.marker(e.latlng, {
        icon: L.divIcon({
          html: '<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #3b82f6;"></div>',
          className: "user-location-marker",
        }),
      })
        .addTo(mapRef.current)
        .bindPopup("You are here")
        .openPopup();

      setIsLocating(false);
    });

    mapRef.current.on("locationerror", () => {
      setIsLocating(false);
      alert("Unable to access your location. Please check permissions.");
    });
  };

  // Handle zoom controls
  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();
  const fitBounds = () => {
    if (markersRef.current.length > 0) {
      const bounds = L.latLngBounds(
        markersRef.current.map((m) => m.getLatLng()),
      );
      mapRef.current.fitBounds(bounds);
    }
  };

  // Export map to image
  const exportMap = () => {
    // Implementation for map export
    console.log("Export map");
  };

  // Expose viewIssueDetails to window for popup interaction
  useEffect(() => {
    window.viewIssueDetails = (id) => {
      const issue = issues?.find((i) => i.id === id);
      if (issue) {
        setInternalSelectedIssue(issue);
        if (onViewDetails) {
          onViewDetails(issue);
        } else {
          onMarkerClick?.(issue);
        }
      }
    };

    return () => {
      delete window.viewIssueDetails;
    };
  }, [issues, onMarkerClick, onViewDetails]);

  const getStatusStats = () => {
    const stats = {
      pending: issues?.filter((i) => i.status === "pending").length || 0,
      assigned: issues?.filter((i) => i.status === "assigned").length || 0,
      "in-progress":
        issues?.filter((i) => i.status === "in-progress").length || 0,
      resolved: issues?.filter((i) => i.status === "resolved").length || 0,
    };
    return stats;
  };

  const statusStats = getStatusStats();

  return (
    <div
      className="relative w-full overflow-hidden shadow-xl rounded-2xl"
      style={{ height }}
    >
      {/* Map Container */}
      <div id="map-container" className="w-full h-full" />

      {/* Loading Overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="text-center">
            <Loader
              size={48}
              className="mx-auto mb-3 text-primary-500 animate-spin"
            />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Controls Panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-4 left-4 space-y-2 z-[1000]"
          >
            {/* Zoom Controls */}
            <div className="overflow-hidden bg-white shadow-lg rounded-xl">
              <button
                onClick={zoomIn}
                className="w-full p-2 transition-colors border-b border-gray-200 hover:bg-gray-100"
                title="Zoom In"
              >
                <Plus size={20} className="text-gray-700" />
              </button>
              <button
                onClick={zoomOut}
                className="w-full p-2 transition-colors hover:bg-gray-100"
                title="Zoom Out"
              >
                <Minus size={20} className="text-gray-700" />
              </button>
            </div>

            {/* Location Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={locateUser}
              disabled={isLocating}
              className="p-3 transition-all bg-white shadow-lg rounded-xl hover:shadow-xl disabled:opacity-50"
              title="My Location"
            >
              {isLocating ? (
                <Loader size={20} className="animate-spin text-primary-600" />
              ) : (
                <Navigation size={20} className="text-primary-600" />
              )}
            </motion.button>

            {/* Fit Bounds Button */}
            {markersRef.current.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fitBounds}
                className="p-3 transition-all bg-white shadow-lg rounded-xl hover:shadow-xl"
                title="Show All Markers"
              >
                <Maximize2 size={20} className="text-gray-700" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Type Controls */}
      <div className="absolute top-4 right-4 flex space-x-2 z-[1000]">
        {["street", "satellite", "dark"].map((type) => (
          <button
            key={type}
            onClick={() => changeMapType(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-lg ${
              mapType === type
                ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {type === "street"
              ? "Map"
              : type === "satellite"
                ? "Satellite"
                : "Dark"}
          </button>
        ))}
      </div>

      {/* Stats & Legend Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 right-4 flex justify-between z-[1000]"
      >
        {/* Legend */}
        {showLegend && (
          <div className="p-3 text-xs shadow-lg bg-white/95 backdrop-blur-sm rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">
                  Pending ({statusStats.pending})
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">
                  Assigned ({statusStats.assigned})
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">
                  In Progress ({statusStats["in-progress"]})
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">
                  Resolved ({statusStats.resolved})
                </span>
              </div>
              <button
                onClick={() => setShowLegend(false)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Stats Card */}
        <div className="p-3 shadow-lg bg-white/95 backdrop-blur-sm rounded-xl">
          <div className="flex items-center space-x-3">
            <MapPin size={16} className="text-primary-600" />
            <span className="text-sm font-medium text-gray-700">
              {issues?.length || 0} Total Issues
            </span>
            <button
              onClick={() => setShowControls(!showControls)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Layers size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Selected Issue Popup (Mobile-friendly) */}
      <AnimatePresence>
        {activeSelectedIssue && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-20 left-4 right-4 bg-white rounded-xl shadow-2xl p-4 z-[1000] md:hidden"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="flex-1 font-semibold text-gray-900">
                {activeSelectedIssue.title}
              </h3>
              <button
                onClick={() => setInternalSelectedIssue(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mb-3 text-sm text-gray-600 line-clamp-2">
              {activeSelectedIssue.description}
            </p>
            <button
              onClick={() => onViewDetails?.(activeSelectedIssue)}
              className="w-full px-3 py-2 text-sm text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              View Details
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeSelectedIssue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="hidden md:flex absolute bottom-24 right-4 w-80 flex-col gap-4 bg-white rounded-3xl shadow-2xl p-5 z-[1000]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {activeSelectedIssue.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {activeSelectedIssue.description}
                </p>
              </div>
              <button
                onClick={() => setInternalSelectedIssue(null)}
                className="text-gray-400 hover:text-gray-600"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status</span>
                <span className="capitalize">{activeSelectedIssue.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Location</span>
                <span className="text-right">
                  {activeSelectedIssue.location?.address}
                </span>
              </div>
              {activeSelectedIssue.distance != null && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Distance</span>
                  <span>{activeSelectedIssue.distance} km</span>
                </div>
              )}
            </div>
            <button
              onClick={() => onViewDetails?.(activeSelectedIssue)}
              className="w-full px-4 py-2 text-sm font-medium text-white rounded-xl bg-primary-600 hover:bg-primary-700"
            >
              Open issue detail
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Legend Button (when hidden) */}
      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute bottom-4 left-4 p-2 bg-white rounded-lg shadow-lg z-[1000]"
        >
          <Info size={16} className="text-gray-700" />
        </button>
      )}

      {/* Attribution Note */}
      <div className="absolute bottom-0 right-0 text-[10px] text-gray-400 bg-white/80 px-2 py-1 rounded-tl-lg z-[1000]">
        Map data © OpenStreetMap contributors
      </div>
    </div>
  );
};

export default MapView;
