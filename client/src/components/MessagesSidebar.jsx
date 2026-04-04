import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useConnections } from "../hooks/useConnections";
import { useAuth } from "../hooks/useAuth";

const MessagesSidebar = () => {
  const { user } = useAuth();
  const { getMyConnections, getConnectionMessages, sendMessage, getOtherUser } =
    useConnections();

  const [myConnections, setMyConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [connectionMessages, setConnectionMessages] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMyConnections(getMyConnections());
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      const messages = getConnectionMessages(selectedConnection.id);
      setConnectionMessages(messages);
      scrollToBottom();
    }
  }, [selectedConnection]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConnection) return;

    const result = sendMessage(selectedConnection.id, messageInput);
    if (result.success) {
      const newMessages = getConnectionMessages(selectedConnection.id);
      setConnectionMessages(newMessages);
      setMessageInput("");
      scrollToBottom();
    } else {
      toast.error(result.error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-white" size={20} />
          <h3 className="text-white font-bold">Messages</h3>
          {myConnections.length > 0 && (
            <span className="text-xs bg-white text-blue-600 font-bold px-2 py-0.5 rounded-full">
              {myConnections.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white hover:bg-blue-500 p-1 rounded transition-colors"
        >
          {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {myConnections.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="text-gray-400 mb-2" size={24} />
                <p className="text-xs text-gray-600">
                  No connections yet. Send a request to start messaging!
                </p>
              </div>
            ) : (
              <>
                {/* Connections List */}
                <div className="border-b border-gray-200 overflow-y-auto max-h-40">
                  {myConnections.map((connection) => {
                    const otherUser = getOtherUser(connection);
                    return (
                      <motion.button
                        key={connection.id}
                        onClick={() => setSelectedConnection(connection)}
                        whileHover={{ backgroundColor: "#f3f4f6" }}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                          selectedConnection?.id === connection.id
                            ? "bg-blue-50 border-l-4 border-l-blue-600"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {otherUser.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {otherUser.role}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Chat Area */}
                {selectedConnection ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                      {connectionMessages.length === 0 ? (
                        <div className="text-center text-xs text-gray-500 mt-4">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        connectionMessages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${
                              msg.senderId === user.id
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs px-3 py-2 rounded-lg text-xs ${
                                msg.senderId === user.id
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              <p className="break-words">{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  msg.senderId === user.id
                                    ? "text-blue-100"
                                    : "text-gray-600"
                                }`}
                              >
                                {new Date(msg.timestamp).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                          </motion.div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200 bg-white">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Message..."
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim()}
                          className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center p-4">
                    <p className="text-xs text-gray-500">
                      Select a chat to start messaging
                    </p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesSidebar;
