import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export const useConnections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [messages, setMessages] = useState([]);

  // Load from localStorage
  useEffect(() => {
    if (!user) return;

    const storedConnections = JSON.parse(
      localStorage.getItem("civicConnections") || "[]",
    );
    const storedRequests = JSON.parse(
      localStorage.getItem("civicConnectionRequests") || "[]",
    );
    const storedMessages = JSON.parse(
      localStorage.getItem("civicMessages") || "[]",
    );

    setConnections(storedConnections);
    setConnectionRequests(storedRequests);
    setMessages(storedMessages);
  }, [user]);

  // Persist to localStorage
  const persistConnections = (newConnections) => {
    setConnections(newConnections);
    localStorage.setItem("civicConnections", JSON.stringify(newConnections));
  };

  const persistRequests = (newRequests) => {
    setConnectionRequests(newRequests);
    localStorage.setItem(
      "civicConnectionRequests",
      JSON.stringify(newRequests),
    );
  };

  const persistMessages = (newMessages) => {
    setMessages(newMessages);
    localStorage.setItem("civicMessages", JSON.stringify(newMessages));
  };

  // Check if user can connect with another user based on roles
  const canConnect = (otherUserRole) => {
    const role = user?.role;
    if (role === otherUserRole) return false; // Can't connect with same role
    if (role === "admin") return true; // Admin can connect with anyone
    if (role === "citizen" && otherUserRole !== "citizen") return true; // Citizen can connect with worker/admin
    if (role === "worker" && otherUserRole !== "worker") return true; // Worker can connect with citizen/admin
    return false;
  };

  // Send connection request
  const sendConnectionRequest = (targetUser) => {
    if (!user) return { error: "Not authenticated" };
    if (!canConnect(targetUser.role)) {
      return { error: "Cannot connect with users of the same role" };
    }

    const existingRequest = connectionRequests.find(
      (req) =>
        (req.fromId === user.id && req.toId === targetUser.id) ||
        (req.fromId === targetUser.id && req.toId === user.id),
    );

    if (existingRequest) {
      return { error: "Connection request already exists" };
    }

    const isAlreadyConnected = connections.find(
      (conn) =>
        (conn.user1.id === user.id && conn.user2.id === targetUser.id) ||
        (conn.user1.id === targetUser.id && conn.user2.id === user.id),
    );

    if (isAlreadyConnected) {
      return { error: "Already connected with this user" };
    }

    const request = {
      id: Date.now().toString(),
      fromId: user.id,
      fromUser: { id: user.id, name: user.name, role: user.role },
      toId: targetUser.id,
      toUser: {
        id: targetUser.id,
        name: targetUser.name,
        role: targetUser.role,
      },
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const newRequests = [...connectionRequests, request];
    persistRequests(newRequests);
    return { success: true, request };
  };

  // Accept connection request
  const acceptConnectionRequest = (requestId) => {
    const request = connectionRequests.find((r) => r.id === requestId);
    if (!request) return { error: "Request not found" };

    const newConnection = {
      id: Date.now().toString(),
      user1: request.fromUser,
      user2: request.toUser,
      connectedAt: new Date().toISOString(),
      lastMessageAt: null,
    };

    const newConnections = [...connections, newConnection];
    persistConnections(newConnections);

    const updatedRequests = connectionRequests.filter(
      (r) => r.id !== requestId,
    );
    persistRequests(updatedRequests);

    return { success: true, connection: newConnection };
  };

  // Reject connection request
  const rejectConnectionRequest = (requestId) => {
    const updatedRequests = connectionRequests.filter(
      (r) => r.id !== requestId,
    );
    persistRequests(updatedRequests);
    return { success: true };
  };

  // Get pending requests for current user
  const getPendingRequests = () => {
    return connectionRequests.filter(
      (req) => req.toId === user?.id && req.status === "pending",
    );
  };

  // Get pending requests sent by current user
  const getSentRequests = () => {
    return connectionRequests.filter(
      (req) => req.fromId === user?.id && req.status === "pending",
    );
  };

  // Get all connections for current user
  const getMyConnections = () => {
    if (!user) return [];
    return connections.filter(
      (conn) => conn.user1.id === user.id || conn.user2.id === user.id,
    );
  };

  // Get the other user in a connection
  const getOtherUser = (connection) => {
    return connection.user1.id === user?.id
      ? connection.user2
      : connection.user1;
  };

  // Send message
  const sendMessage = (connectionId, content) => {
    if (!user || !connectionId) return { error: "Invalid input" };

    const connection = connections.find((c) => c.id === connectionId);
    if (!connection) return { error: "Connection not found" };

    const message = {
      id: Date.now().toString(),
      connectionId,
      senderId: user.id,
      senderName: user.name,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const newMessages = [...messages, message];
    persistMessages(newMessages);

    // Update last message timestamp
    const updatedConnections = connections.map((c) =>
      c.id === connectionId
        ? { ...c, lastMessageAt: new Date().toISOString() }
        : c,
    );
    persistConnections(updatedConnections);

    return { success: true, message };
  };

  // Get messages for a connection
  const getConnectionMessages = (connectionId) => {
    return messages.filter((m) => m.connectionId === connectionId);
  };

  // Mark messages as read
  const markAsRead = (connectionId) => {
    const updatedMessages = messages.map((m) =>
      m.connectionId === connectionId ? { ...m, read: true } : m,
    );
    persistMessages(updatedMessages);
  };

  // Remove connection
  const removeConnection = (connectionId) => {
    const updatedConnections = connections.filter((c) => c.id !== connectionId);
    persistConnections(updatedConnections);
    return { success: true };
  };

  return {
    connections,
    connectionRequests,
    messages,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    getPendingRequests,
    getSentRequests,
    getMyConnections,
    getOtherUser,
    sendMessage,
    getConnectionMessages,
    markAsRead,
    removeConnection,
    canConnect,
  };
};
