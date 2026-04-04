import { formatDistanceToNow, format } from "date-fns";

export const formatDate = (date) => {
  if (!date) return "N/A";
  return format(new Date(date), "MMM dd, yyyy");
};

export const formatTimeAgo = (date) => {
  if (!date) return "N/A";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const truncateText = (text, length = 100) => {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

export const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-orange-100 text-orange-800";
    case "assigned":
      return "bg-purple-100 text-purple-800";
    case "reported":
      return "bg-yellow-100 text-yellow-800";
    case "in-progress":
      return "bg-blue-100 text-blue-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case "pending":
      return "Hourglass";
    case "assigned":
      return "Briefcase";
    case "reported":
      return "AlertCircle";
    case "in-progress":
      return "Clock";
    case "resolved":
      return "CheckCircle";
    default:
      return "Info";
  }
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(phone);
};

export const groupIssuesByCategory = (issues) => {
  return issues.reduce((acc, issue) => {
    const category = issue.category || "other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(issue);
    return acc;
  }, {});
};

export const calculateAverageResponseTime = (issues) => {
  const resolvedIssues = issues.filter(
    (i) => i.status === "resolved" && i.resolvedAt,
  );
  if (resolvedIssues.length === 0) return 0;

  const totalTime = resolvedIssues.reduce((sum, issue) => {
    const reported = new Date(issue.timestamp);
    const resolved = new Date(issue.resolvedAt);
    return sum + (resolved - reported);
  }, 0);

  return totalTime / resolvedIssues.length / (1000 * 60 * 60 * 24); // Return in days
};
