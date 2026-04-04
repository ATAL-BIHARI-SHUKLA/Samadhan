import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

// Mock data
const mockIssues = [
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

const mockWorkers = [
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

const mockStats = {
  total: 1247,
  resolved: 892,
  active: 189,
  workers: 45,
};

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("citizen");
  const [currentUser, setCurrentUser] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Load mock data
    setIssues(mockIssues);
    setWorkers(mockWorkers);
  }, []);

  const addNotification = ({
    recipientRole,
    message,
    link = "",
    issueId = null,
    type = "general",
  }) => {
    const newNotification = {
      id: Date.now(),
      recipientRole,
      message,
      link,
      issueId,
      type,
      read: false,
      timestamp: new Date().toISOString(),
    };

    setNotifications((prevNotifications) => [
      newNotification,
      ...prevNotifications,
    ]);

    if (recipientRole === userRole) {
      toast(message, {
        icon: "🔔",
        style: {
          borderRadius: "12px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  };

  const markNotificationsReadForRole = (role) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.recipientRole === role
          ? { ...notification, read: true }
          : notification,
      ),
    );
  };

  const addIssue = (issue) => {
    const newIssue = {
      ...issue,
      id: issue.id || Date.now(),
      status: issue.status || "pending",
      timestamp: issue.timestamp || new Date().toISOString(),
      votes: issue.votes || 0,
    };

    setIssues((prevIssues) => [newIssue, ...prevIssues]);

    addNotification({
      recipientRole: "admin",
      message: `New issue submitted and pending review: ${newIssue.title}`,
      link: `/issue/${newIssue.id}`,
      issueId: newIssue.id,
      type: "issue_reported",
    });

    return newIssue;
  };

  const updateIssueStatus = (issueId, status, workerId = null) => {
    const issue = issues.find((item) => item.id === issueId);

    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              status,
              assignedTo: workerId !== null ? workerId : issue.assignedTo,
              updatedAt: new Date().toISOString(),
            }
          : issue,
      ),
    );

    if (issue) {
      if (status === "assigned") {
        addNotification({
          recipientRole: "worker",
          message: `You have been assigned to "${issue.title}".`,
          link: `/issue/${issueId}`,
          issueId,
          type: "work_assigned",
        });
        addNotification({
          recipientRole: "citizen",
          message: `A worker has been assigned for "${issue.title}".`,
          link: `/issue/${issueId}`,
          issueId,
          type: "issue_progress",
        });
      } else if (status === "in-progress") {
        addNotification({
          recipientRole: "citizen",
          message: `Work on "${issue.title}" has started.`,
          link: `/issue/${issueId}`,
          issueId,
          type: "issue_progress",
        });
      } else if (status === "resolved") {
        addNotification({
          recipientRole: "citizen",
          message: `Issue "${issue.title}" has been resolved.`,
          link: `/issue/${issueId}`,
          issueId,
          type: "issue_progress",
        });
      } else if (status === "pending") {
        addNotification({
          recipientRole: "citizen",
          message: `Issue "${issue.title}" is pending review.`,
          link: `/issue/${issueId}`,
          issueId,
          type: "issue_progress",
        });
      }
    }
  };

  const voteIssue = (issueId, delta = 1) => {
    const issue = issues.find((item) => item.id === issueId);
    if (!issue) return;

    setIssues((prevIssues) =>
      prevIssues.map((item) =>
        item.id === issueId
          ? {
              ...item,
              votes: Math.max(0, (item.votes || 0) + delta),
            }
          : item,
      ),
    );

    if (delta > 0) {
      addNotification({
        recipientRole: "citizen",
        message: `Thank you for supporting "${issue.title}".`,
        link: `/issue/${issueId}`,
        issueId,
        type: "issue_upvote",
      });
    }
  };

  const updateWorkerLocation = (workerId, location) => {
    setWorkers((prevWorkers) =>
      prevWorkers.map((worker) =>
        worker.id === workerId
          ? { ...worker, currentLocation: location }
          : worker,
      ),
    );
  };

  const assignWorker = (issueId, workerId) => {
    const issue = issues.find((item) => item.id === issueId);
    const worker = workers.find((item) => item.id === workerId);

    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              assignedTo: workerId,
              status: "assigned",
              assignedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : issue,
      ),
    );

    if (worker && issue) {
      addNotification({
        recipientRole: "worker",
        message: `You were assigned to "${issue.title}".`,
        link: `/issue/${issueId}`,
        issueId,
        type: "work_assigned",
      });

      addNotification({
        recipientRole: "citizen",
        message: `A worker has been assigned for "${issue.title}".`,
        link: `/issue/${issueId}`,
        issueId,
        type: "issue_progress",
      });
    }
  };

  const submitFeedback = (issueId, rating, comment) => {
    const issue = issues.find((item) => item.id === issueId);
    const worker = workers.find((item) => item.id === issue?.assignedTo);
    setIssues((prevIssues) =>
      prevIssues.map((item) =>
        item.id === issueId
          ? {
              ...item,
              feedback: {
                rating,
                comment,
                submittedAt: new Date().toISOString(),
              },
            }
          : item,
      ),
    );

    if (worker) {
      const totalJobs = worker.completedJobs || 0;
      const newRating =
        totalJobs === 0
          ? rating
          : (worker.rating * totalJobs + rating) / (totalJobs + 1);
      setWorkers((prevWorkers) =>
        prevWorkers.map((item) =>
          item.id === worker.id
            ? {
                ...item,
                rating: Math.round(newRating * 10) / 10,
                completedJobs: totalJobs + 1,
              }
            : item,
        ),
      );

      addNotification({
        recipientRole: "worker",
        message: `You received a new rating for "${issue.title}".`,
        link: `/issue/${issueId}`,
        issueId,
        type: "worker_feedback",
      });
    }

    if (issue) {
      addNotification({
        recipientRole: "citizen",
        message: `Thanks for rating the worker for "${issue.title}".`,
        link: `/issue/${issueId}`,
        issueId,
        type: "feedback_submitted",
      });
    }
  };

  const updateStats = () => {
    const resolved = issues.filter((i) => i.status === "resolved").length;
    const active = issues.filter(
      (i) => i.status === "assigned" || i.status === "in-progress",
    ).length;
    setStats({
      ...stats,
      resolved,
      active,
    });
  };

  useEffect(() => {
    updateStats();
  }, [issues]);

  return (
    <AppContext.Provider
      value={{
        issues,
        workers,
        stats,
        loading,
        userRole,
        currentUser,
        chatOpen,
        setChatOpen,
        setUserRole,
        setCurrentUser,
        addIssue,
        updateIssueStatus,
        assignWorker,
        updateWorkerLocation,
        voteIssue,
        submitFeedback,
        notifications,
        addNotification,
        markNotificationsReadForRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
