import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  X,
  Minimize2,
  Maximize2,
  MessageCircle,
  Paperclip,
  Smile,
  Mic,
  Check,
  CheckCheck,
  Clock,
  Volume2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatBox = ({ issueId, isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Hi! I'm your AI assistant. How can I help you with this issue?",
      timestamp: new Date(),
      status: "read",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = [
    "What's the current status?",
    "When will this be fixed?",
    "Can I get an update?",
    "Who is assigned to this?",
    "How long will it take?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
      status: "sent",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setShowSuggestions(false);

    // Update message status to delivered
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "delivered" } : msg,
        ),
      );
    }, 500);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "read" } : msg,
        ),
      );
    }, 1000);

    // Simulate AI response with more intelligent replies
    setTimeout(() => {
      const botResponses = {
        status:
          "The issue is currently being reviewed by our team. We'll update you within 24 hours.",
        time: "Based on similar issues, this typically takes 2-3 business days to resolve.",
        update:
          "I'll check the latest updates for you. The status is currently: In Progress.",
        assigned:
          "This issue has been assigned to John from the maintenance team.",
        default:
          "I'll help you track this issue. Let me check the system for the latest information...",
      };

      let response = botResponses.default;
      const lowerInput = inputMessage.toLowerCase();
      if (lowerInput.includes("status")) response = botResponses.status;
      else if (lowerInput.includes("time") || lowerInput.includes("long"))
        response = botResponses.time;
      else if (lowerInput.includes("update")) response = botResponses.update;
      else if (lowerInput.includes("assign")) response = botResponses.assigned;

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response,
        timestamp: new Date(),
        status: "read",
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content, messageId) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const MessageStatusIcon = ({ status }) => {
    switch (status) {
      case "sent":
        return <Clock size={12} className="text-gray-400" />;
      case "delivered":
        return <Check size={12} className="text-gray-400" />;
      case "read":
        return <CheckCheck size={12} className="text-primary-500" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", damping: 25 }}
          className={`fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl z-50 ${
            isMinimized ? "w-80" : "w-[400px]"
          }`}
        >
          {/* Header */}
          <div className="p-4 text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
                    <Bot size={20} />
                  </div>
                  <div className="absolute w-3 h-3 bg-green-500 border-2 rounded-full -bottom-1 -right-1 border-primary-600"></div>
                </div>
                <div>
                  <span className="font-semibold">AI Assistant</span>
                  <p className="text-xs text-primary-100">
                    Online • Ready to help
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 transition-colors rounded-lg hover:bg-white/20"
                >
                  {isMinimized ? (
                    <Maximize2 size={16} />
                  ) : (
                    <Minimize2 size={16} />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 transition-colors rounded-lg hover:bg-white/20"
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="h-[450px] flex flex-col bg-gradient-to-b from-gray-50 to-white">
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {/* Welcome Message */}
                  <AnimatePresence>
                    {showSuggestions && messages.length === 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-4"
                      >
                        <div className="p-4 border bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border-primary-100">
                          <div className="flex items-center mb-2 space-x-2">
                            <Sparkles size={16} className="text-primary-600" />
                            <span className="text-sm font-semibold text-primary-900">
                              Quick Suggestions
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion, idx) => (
                              <motion.button
                                key={idx}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleSuggestionClick(suggestion)
                                }
                                className="px-3 py-1.5 bg-white border border-primary-200 rounded-full text-xs text-primary-700 hover:bg-primary-50 transition-colors"
                              >
                                {suggestion}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {messages.map((message, idx) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] ${message.type === "user" ? "order-2" : "order-1"}`}
                      >
                        <div
                          className={`relative group p-3 rounded-2xl ${
                            message.type === "user"
                              ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white"
                              : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>

                          {/* Message Actions (for bot messages) */}
                          {message.type === "bot" && (
                            <div className="absolute transition-opacity opacity-0 -bottom-2 right-2 group-hover:opacity-100">
                              <div className="flex p-1 space-x-1 bg-white rounded-full shadow-md">
                                <button
                                  onClick={() =>
                                    copyMessage(message.content, message.id)
                                  }
                                  className="p-1 transition-colors rounded-full hover:bg-gray-100"
                                  title="Copy message"
                                >
                                  {copiedMessageId === message.id ? (
                                    <Check
                                      size={12}
                                      className="text-green-500"
                                    />
                                  ) : (
                                    <Copy size={12} className="text-gray-500" />
                                  )}
                                </button>
                                <button
                                  className="p-1 transition-colors rounded-full hover:bg-gray-100"
                                  title="Like"
                                >
                                  <ThumbsUp
                                    size={12}
                                    className="text-gray-500"
                                  />
                                </button>
                              </div>
                            </div>
                          )}

                          <div
                            className={`flex items-center justify-end space-x-1 mt-1 ${
                              message.type === "user"
                                ? "text-primary-100"
                                : "text-gray-400"
                            }`}
                          >
                            <span className="text-xs">
                              {formatTime(new Date(message.timestamp))}
                            </span>
                            {message.type === "user" && (
                              <MessageStatusIcon status={message.status} />
                            )}
                          </div>
                        </div>
                      </div>

                      {message.type === "bot" && (
                        <div className="flex-shrink-0 order-1 mr-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600">
                            <Bot size={14} className="text-white" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600">
                          <Bot size={14} className="text-white" />
                        </div>
                        <div className="p-3 bg-white border border-gray-200 rounded-2xl">
                          <div className="flex space-x-1">
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.6,
                                delay: 0,
                              }}
                              className="w-2 h-2 rounded-full bg-primary-400"
                            ></motion.div>
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.6,
                                delay: 0.2,
                              }}
                              className="w-2 h-2 rounded-full bg-primary-400"
                            ></motion.div>
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.6,
                                delay: 0.4,
                              }}
                              className="w-2 h-2 rounded-full bg-primary-400"
                            ></motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
                  <div className="flex items-end space-x-2">
                    <div className="relative flex-1">
                      <textarea
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-gray-50"
                        rows="1"
                        style={{ minHeight: "44px", maxHeight: "100px" }}
                      />
                      <div className="absolute flex space-x-1 right-2 bottom-2">
                        <button
                          className="p-1 text-gray-400 transition-colors hover:text-gray-600"
                          title="Attach file"
                        >
                          <Paperclip size={16} />
                        </button>
                        <button
                          className={`p-1 transition-colors ${isRecording ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                          title="Voice input"
                          onClick={() => setIsRecording(!isRecording)}
                        >
                          <Mic size={16} />
                        </button>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <Send size={18} />
                    </motion.button>
                  </div>
                  <p className="mt-3 text-xs text-center text-gray-400">
                    AI assistant may make mistakes. Check important info.
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatBox;
