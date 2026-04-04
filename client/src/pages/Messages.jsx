import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageSquare,
  AlertCircle,
  ChevronLeft,
  Clock,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useConnections } from "../hooks/useConnections";
import { useAuth } from "../hooks/useAuth";

const Messages = () => {
  const { user } = useAuth();
  const {
    getMyConnections,
    getConnectionMessages,
    sendMessage,
    markAsRead,
    removeConnection,
    getOtherUser,
  } = useConnections();

  const [selectedConnection, setSelectedConnection] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [myConnections, setMyConnections] = useState([]);
  const [connectionMessages, setConnectionMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMyConnections(getMyConnections());
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      const messages = getConnectionMessages(selectedConnection.id);
      setConnectionMessages(messages);
      markAsRead(selectedConnection.id);
      scrollToBottom();
    }
  }, [selectedConnection]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConnection) return;

    const result = sendMessage(selectedConnection.id, messageInput);
    if (result.success) {
      const newMessages = getConnectionMessages(selectedConnection.id);
      setConnectionMessages(newMessages);
      setMessageInput("");
      scrollToBottom();
      // Update connections list to show latest message
      setMyConnections(getMyConnections());
    } else {
      toast.error(result.error);
    }
  };

  const handleRemoveConnection = (connectionId) => {
    if (window.confirm("Are you sure you want to remove this connection?")) {
      const result = removeConnection(connectionId);
      if (result.success) {
        setSelectedConnection(null);
        setMyConnections(getMyConnections());
        toast.success("Connection removed");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Please log in to view messages</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Connections List */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="text-blue-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
          </div>
        </div>

        {/* Connections */}
        <div className="flex-1 overflow-y-auto">
          {myConnections.length === 0 ? (
            <div className="p-4 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600 text-sm">No connections yet</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {myConnections.map((connection) => {
                const otherUser = getOtherUser(connection);
                const unreadCount = getConnectionMessages(connection.id).filter(
                  (m) => !m.read && m.senderId !== user.id,
                ).length;

                return (
                  <motion.button
                    key={connection.id}
                    onClick={() => setSelectedConnection(connection)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConnection?.id === connection.id
                        ? "bg-blue-100 border-l-4 border-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {otherUser.name}
                        </p>
                        <p className="text-xs text-gray-600 capitalize">
                          {otherUser.role}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-1 flex-col bg-white">
        {selectedConnection ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConnection(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {getOtherUser(selectedConnection).name}
                  </h2>
                  <p className="text-xs text-gray-600 capitalize">
                    {getOtherUser(selectedConnection).role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveConnection(selectedConnection.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {connectionMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare
                      className="mx-auto text-gray-300 mb-2"
                      size={48}
                    />
                    <p className="text-gray-500">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                </div>
              ) : (
                connectionMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      msg.senderId === user.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.senderId === user.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.senderId === user.id
                            ? "text-blue-100"
                            : "text-gray-600"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 text-lg">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile View - Chat Modal */}
      <AnimatePresence>
        {selectedConnection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 md:hidden bg-white flex flex-col z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConnection(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {getOtherUser(selectedConnection).name}
                  </h2>
                  <p className="text-xs text-gray-600 capitalize">
                    {getOtherUser(selectedConnection).role}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {connectionMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.senderId === user.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId === user.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.senderId === user.id
                          ? "text-blue-100"
                          : "text-gray-600"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="2"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Messages;
