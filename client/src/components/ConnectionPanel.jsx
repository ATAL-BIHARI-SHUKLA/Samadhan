import React, { useState } from "react";
import {
  UserPlus,
  MessageSquare,
  CheckCircle,
  XCircle,
  Users,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useConnections } from "../hooks/useConnections";
import { useAuth } from "../hooks/useAuth";

const ConnectionPanel = () => {
  const { user } = useAuth();
  const {
    connections,
    connectionRequests,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    getPendingRequests,
    getSentRequests,
    getMyConnections,
    removeConnection,
  } = useConnections();

  const [activeTab, setActiveTab] = useState("requests"); // requests, sent, connected
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [messageContent, setMessageContent] = useState("");

  const pendingRequests = getPendingRequests();
  const sentRequests = getSentRequests();
  const myConnections = getMyConnections();

  const handleAcceptRequest = (requestId) => {
    const result = acceptConnectionRequest(requestId);
    if (result.success) {
      toast.success("Connection accepted!");
    } else {
      toast.error(result.error);
    }
  };

  const handleRejectRequest = (requestId) => {
    const result = rejectConnectionRequest(requestId);
    if (result.success) {
      toast.success("Request rejected");
    }
  };

  const handleSendRequest = (targetUser) => {
    const result = sendConnectionRequest(targetUser);
    if (result.success) {
      toast.success(`Connection request sent to ${targetUser.name}`);
    } else {
      toast.error(result.error);
    }
  };

  const handleRemoveConnection = (connectionId) => {
    const result = removeConnection(connectionId);
    if (result.success) {
      toast.success("Connection removed");
    }
  };

  const handleOpenMessage = (connection) => {
    setSelectedConnection(connection);
    setShowMessageModal(true);
  };

  const handleSendMessage = () => {
    if (!messageContent.trim()) return;
    // Message will be sent next step when we create the Messages component
    setMessageContent("");
    toast.success("Message sent!");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Users className="text-blue-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Connections</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === "requests"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <span className="flex items-center gap-2">
            Requests
            {pendingRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === "sent"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <span className="flex items-center gap-2">
            Sent
            {sentRequests.length > 0 && (
              <span className="bg-yellow-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {sentRequests.length}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("connected")}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === "connected"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <span className="flex items-center gap-2">
            Connected
            {myConnections.length > 0 && (
              <span className="bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {myConnections.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Pending Requests Tab */}
        {activeTab === "requests" && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600">No pending connection requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {request.fromUser.name}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {request.fromUser.role} wants to connect
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={16} />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Sent Requests Tab */}
        {activeTab === "sent" && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {sentRequests.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600">No pending sent requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {request.toUser.name}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {request.toUser.role} - Pending
                      </p>
                    </div>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Connected Users Tab */}
        {activeTab === "connected" && (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {myConnections.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600">No connections yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myConnections.map((connection) => {
                  const otherUser =
                    connection.user1.id === user?.id
                      ? connection.user2
                      : connection.user1;
                  return (
                    <motion.div
                      key={connection.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {otherUser.name}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {otherUser.role} - Connected
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenMessage(connection)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <MessageSquare size={16} />
                          Message
                        </button>
                        <button
                          onClick={() => handleRemoveConnection(connection.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && selectedConnection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">
                Message{" "}
                {selectedConnection.user1.id === user?.id
                  ? selectedConnection.user2.name
                  : selectedConnection.user1.name}
              </h3>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectionPanel;
