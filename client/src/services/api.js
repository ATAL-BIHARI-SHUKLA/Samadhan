export const mockStats = {
  total: 1247,
  resolved: 892,
  active: 189,
  workers: 45,
};

export const mockIssues = [
  {
    id: 1,
    title: "Pothole on MG Road",
    description: "Large pothole causing traffic congestion and vehicle damage",
    location: { lat: 12.975, lng: 77.6052, address: "12 MG Road, Bengaluru" },
    status: "pending",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500",
    timestamp: "2024-01-15T10:30:00Z",
    votes: 24,
    category: "infrastructure",
  },
  {
    id: 2,
    title: "Broken street light on Brigade Road",
    description: "Street light not working, making the road unsafe at night",
    location: {
      lat: 12.9756,
      lng: 77.602,
      address: "45 Brigade Road, Bengaluru",
    },
    status: "assigned",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500",
    timestamp: "2024-01-14T15:45:00Z",
    votes: 12,
    category: "lighting",
    assignedTo: 1,
    assignedAt: "2024-01-15T09:00:00Z",
  },
  {
    id: 3,
    title: "Overflowing garbage bin at Jayanagar",
    description:
      "Public garbage bin overflowing for days and creating unhygienic conditions",
    location: {
      lat: 12.9319,
      lng: 77.6102,
      address: "7th Cross, Jayanagar, Bengaluru",
    },
    status: "resolved",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500",
    timestamp: "2024-01-10T08:20:00Z",
    votes: 8,
    category: "sanitation",
    resolvedAt: "2024-01-14T16:30:00Z",
  },
];

export const mockWorkers = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Field Technician",
    rating: 4.8,
    completedJobs: 156,
    available: true,
    earnings: 3250,
    avatar:
      "https://ui-avatars.com/api/?name=Rajesh+Kumar&background=3b82f6&color=fff",
    currentLocation: { lat: 12.9743, lng: 77.6065 },
  },
  {
    id: 2,
    name: "Ananya Mehta",
    role: "Infrastructure Specialist",
    rating: 4.9,
    completedJobs: 203,
    available: false,
    earnings: 4120,
    avatar:
      "https://ui-avatars.com/api/?name=Ananya+Mehta&background=3b82f6&color=fff",
    currentLocation: { lat: 12.9305, lng: 77.609 },
  },
];

export const mockJobs = [
  {
    id: 101,
    issueId: 1,
    title: "Fix pothole on MG Road",
    location: "MG Road, Bengaluru",
    distance: 1.2,
    reward: 75,
    urgency: "high",
  },
  {
    id: 102,
    issueId: 2,
    title: "Repair street light on Brigade Road",
    location: "Brigade Road, Bengaluru",
    distance: 2.5,
    reward: 50,
    urgency: "medium",
  },
  {
    id: 103,
    issueId: 3,
    title: "Clear drainage blockage in Jayanagar",
    location: "Jayanagar, Bengaluru",
    distance: 3.1,
    reward: 60,
    urgency: "medium",
  },
];

export const fetchIssues = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockIssues), 500);
  });
};

export const fetchWorkers = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockWorkers), 500);
  });
};

export const fetchJobs = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockJobs), 500);
  });
};

export const submitIssue = (issueData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        id: Date.now(),
        ...issueData,
      });
    }, 1000);
  });
};

export const updateIssue = (id, updates) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        id,
        ...updates,
      });
    }, 500);
  });
};
