// /components/elements/WhatsAppChat.js
"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  orderBy,
} from "firebase/firestore";
import {
  FiSend,
  FiUser,
  FiMessageSquare,
  FiMenu,
  FiX,
  FiCheck,
  FiClock,
} from "react-icons/fi";
import "/public/css/whatsapp.css";

export default function WhatsAppChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch all conversations sorted by last message timestamp
  useEffect(() => {
    const q = query(collection(db, "conversations"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({ id: doc.id, ...data });
      });

      // Sort conversations by last message timestamp (newest first)
      list.sort(
        (a, b) =>
          (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0)
      );

      setConversations(list);
      if (list.length > 0 && !selectedContact) {
        setSelectedContact(list[0].id);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch messages for selected contact (sorted by timestamp)
  useEffect(() => {
    if (!selectedContact) return;

    const messagesRef = collection(
      db,
      "conversations",
      selectedContact,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        if (doc.exists()) {
          list.push({ id: doc.id, ...doc.data() });
          setHandoff(doc.data().handoff || false);
        }
      });
      setMessages(list);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [selectedContact]);

  const toggleHandoff = async () => {
    try {
      const response = await fetch(
        `/api/conversations/${selectedContact}/handoff`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            handoff: !handoff,
            agentId: "12345",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to toggle handoff");
    } catch (error) {
      console.error("Error toggling handoff:", error);
    }
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Send message to WhatsApp and save to Firebase
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || !selectedContact) return;

    setIsSending(true);
    const messageText = input.trim();
    setInput("");

    try {
      // First save to Firebase as "sending" state
      // const messagesRef = collection(
      //   db,
      //   "conversations",
      //   selectedContact,
      //   "messages"
      // );
      // await addDoc(messagesRef, {
      //   text: messageText,
      //   sender: "agent",
      //   timestamp: Date.now(),
      //   platform: "web",
      //   read: false,
      //   status: "sending",
      // });

      // Send message via WhatsApp Business API
      console.log(
        "[UI] Sending Message To " + selectedContact + " : " + messageText
      );
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedContact,
          message: messageText,
          senderType: "agent", // Add this parameter
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update message status to "sent"
        const convRef = doc(db, "conversations", selectedContact);
        await setDoc(
          convRef,
          {
            lastMessage: {
              text: messageText,
              timestamp: Date.now(),
              sender: "agent",
            },
            status: "active",
          },
          { merge: true }
        );
      } else {
        // Update message status to "failed"
        console.error("Failed to send message:", result.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  // Group messages by date
  const groupedMessages = messages.reduce((acc, message) => {
    const date = formatDate(message.timestamp);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {});
  return (
    <div className="whatsapp-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-button" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        {selectedContact && (
          <div className="contact-info">
            <div className="avatar">
              <FiUser size={20} />
            </div>
            <h3>
              {conversations.find((c) => c.id === selectedContact)
                ?.customerName || selectedContact}
            </h3>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Conversations</h2>
        </div>
        <div className="conversation-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                setSelectedContact(conv.id);
                setMobileMenuOpen(false);
              }}
              className={`conversation-item ${
                selectedContact === conv.id ? "active" : ""
              }`}
            >
              <div className="avatar">
                {conv.customerName?.charAt(0) || conv.id.charAt(0)}
              </div>
              <div className="conversation-details">
                <div className="conversation-header">
                  <strong>{conv.customerName || conv.id}</strong>
                  <span className="time">
                    {conv.lastMessage?.timestamp
                      ? formatTime(conv.lastMessage.timestamp)
                      : ""}
                  </span>
                </div>
                <p className="last-message">
                  {conv.lastMessage?.text.slice(0, 30)}...
                </p>
                {conv.lastMessage?.sender === "customer" &&
                  !conv.lastMessage?.read && (
                    <span className="unread-badge"></span>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedContact ? (
          <>
            <div className="chat-header">
              <div className="contact-info">
                <div className="avatar">
                  <FiUser size={20} />
                </div>
                <div>
                  <h3>
                    {conversations.find((c) => c.id === selectedContact)
                      ?.customerName || selectedContact}
                  </h3>
                  <p className="status">
                    {handoff ? "Agent handling" : "Bot handling"}
                  </p>
                </div>
              </div>
              <div className="handoff-toggle">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={handoff}
                    onChange={() => setHandoff(!handoff)}
                  />
                  <span className="slider round"></span>
                </label>
                <span>{handoff ? "Manual" : "Auto"}</span>
              </div>
            </div>

            <div className="chat-messages">
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date} className="date-divider">
                  <span>{date}</span>
                </div>
              ))}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.sender} ${msg.status || ""}`}
                >
                  <div className="message-content">
                    <p>{msg.text}</p>
                    <div className="message-footer">
                      <span className="time">{formatTime(msg.timestamp)}</span>
                      {msg.sender !== "customer" && (
                        <span className="status-icon">
                          {msg.status === "sending" ? (
                            <FiClock size={12} />
                          ) : msg.status === "sent" ? (
                            <FiCheck size={12} />
                          ) : msg.status === "delivered" ? (
                            <>
                              <FiCheck size={12} />
                              <FiCheck size={12} style={{ marginLeft: -4 }} />
                            </>
                          ) : null}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="message-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={isSending}
              />
              <button type="submit" disabled={isSending || !input.trim()}>
                {isSending ? (
                  <div className="spinner"></div>
                ) : (
                  <FiSend size={20} />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <FiMessageSquare size={48} />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
