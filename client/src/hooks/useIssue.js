import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

export const useIssues = () => {
  const { issues, addIssue, updateIssueStatus, assignWorker, loading } =
    useApp();
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    search: "",
  });

  useEffect(() => {
    let filtered = [...issues];

    if (filters.status !== "all") {
      filtered = filtered.filter((issue) => issue.status === filters.status);
    }

    if (filters.category !== "all") {
      filtered = filtered.filter(
        (issue) => issue.category === filters.category,
      );
    }

    if (filters.search) {
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          issue.description
            .toLowerCase()
            .includes(filters.search.toLowerCase()),
      );
    }

    setFilteredIssues(filtered);
  }, [issues, filters]);

  const getIssueById = (id) => {
    return issues.find((issue) => issue.id === parseInt(id));
  };

  const getIssuesByStatus = (status) => {
    return issues.filter((issue) => issue.status === status);
  };

  const getIssuesByWorker = (workerId) => {
    return issues.filter((issue) => issue.assignedTo === workerId);
  };

  return {
    issues: filteredIssues,
    allIssues: issues,
    loading,
    filters,
    setFilters,
    addIssue,
    updateIssueStatus,
    assignWorker,
    getIssueById,
    getIssuesByStatus,
    getIssuesByWorker,
  };
};
