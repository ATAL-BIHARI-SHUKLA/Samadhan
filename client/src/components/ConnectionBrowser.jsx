import React, { useState } from "react";
import { UserPlus, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useConnections } from "../hooks/useConnections";
import { useAuth } from "../hooks/useAuth";

const ConnectionBrowser = ({ availableUsers, title = "Available Users" }) => {
  const { user } = useAuth();
  const {
    sendConnectionRequest,
    getMyConnections,
    getSentRequests,
    canConnect,
  } = useConnections();

  const myConnections = getMyConnections();
  const sentRequests = getSentRequests();

  const handleConnect = (targetUser) => {
    if (!canConnect(targetUser.role)) {
      toast.error("Cannot connect with users of the same role");
      return;
    }

    const isConnected = myConnections.some(
      (conn) =>
        (conn.user1.id === user?.id && conn.user2.id === targetUser.id) ||
        (conn.user1.id === targetUser.id && conn.user2.id === user?.id),
    );

    if (isConnected) {
      toast.error("Already connected with this user");
      return;
    }

    const hasSentRequest = sentRequests.some(
      (req) => req.toId === targetUser.id,
    );

    if (hasSentRequest) {
      toast.error("Connection request already sent");
      return;
    }

    const result = sendConnectionRequest(targetUser);
    if (result.success) {
      toast.success(`Connection request sent to ${targetUser.name}`);
    } else {
      toast.error(result.error);
    }
  };

  const getButtonStatus = (targetUser) => {
    if (!canConnect(targetUser.role)) {
      return { status: "disabled", text: "Same Role", disabled: true };
    }

    const isConnected = myConnections.some(
      (conn) =>
        (conn.user1.id === user?.id && conn.user2.id === targetUser.id) ||
        (conn.user1.id === targetUser.id && conn.user2.id === user?.id),
    );

    if (isConnected) {
      return { status: "connected", text: "Connected", disabled: true };
    }

    const hasSentRequest = sentRequests.some(
      (req) => req.toId === targetUser.id,
    );

    if (hasSentRequest) {
      return { status: "pending", text: "Request Sent", disabled: true };
    }

    return { status: "available", text: "Connect", disabled: false };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>

      {availableUsers.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-600">No users available to connect</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableUsers.map((targetUser) => {
            const buttonStatus = getButtonStatus(targetUser);
            return (
              <motion.div
                key={targetUser.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  buttonStatus.status === "available"
                    ? "border-blue-200 bg-blue-50"
                    : buttonStatus.status === "connected"
                      ? "border-green-200 bg-green-50"
                      : buttonStatus.status === "pending"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="mb-3">
                  <p className="font-semibold text-gray-800">
                    {targetUser.name}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {targetUser.role}
                  </p>
                  {targetUser.rating && (
                    <p className="text-sm text-yellow-600">
                      ⭐ {targetUser.rating} ({targetUser.completedJobs || 0}{" "}
                      jobs)
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleConnect(targetUser)}
                  disabled={buttonStatus.disabled}
                  className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                    buttonStatus.status === "available"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : buttonStatus.status === "connected"
                        ? "bg-green-600 text-white cursor-not-allowed"
                        : buttonStatus.status === "pending"
                          ? "bg-yellow-600 text-white cursor-not-allowed"
                          : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
                >
                  <UserPlus size={16} />
                  {buttonStatus.text}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConnectionBrowser;
