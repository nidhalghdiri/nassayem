// /components/elements/WhatsAppChat.js
"use client";
import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  FiImage,
  FiVideo,
  FiPhone,
  FiMapPin,
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
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch all conversations sorted by last message timestamp
  useEffect(() => {
    const q = query(collection(db, "conversations"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({ id: doc.id, ...data });
        // Only update handoff if this is the selected conversation
        if (doc.id === selectedContact) {
          setHandoff(data.handoff || false);
        }
      });

      // Sort conversations by last message timestamp (newest first)
      list.sort(
        (a, b) =>
          (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0)
      );

      setConversations(list);
      if (list.length > 0 && !selectedContact) {
        setSelectedContact(list[0].id);
        setHandoff(list[0].handoff || false); // Initialize handoff state
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
    let debounceTimer;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        const list = [];
        snapshot.forEach((doc) => {
          if (doc.exists()) {
            list.push({ id: doc.id, ...doc.data() });
          }
        });
        setMessages(list);
        scrollToBottom();
      }, 500);
    });

    return () => {
      clearTimeout(debounceTimer);
      unsubscribe();
    };
  }, [selectedContact]);

  useEffect(() => {
    if (!selectedContact) return;
    const convRef = doc(db, "conversations", selectedContact);
    const unsubscribe = onSnapshot(convRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setHandoff(data.handoff || false);
      }
    });

    return () => unsubscribe();
  }, [selectedContact]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile || !selectedContact) return;

    // Upload to your storage (e.g., Firebase Storage)
    const storageRef = ref(
      storage,
      `properties/${selectedContact}/${selectedFile.name}`
    );
    await uploadBytes(storageRef, selectedFile);
    const downloadURL = await getDownloadURL(storageRef);

    // Send via API
    await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: selectedContact,
        senderType: "agent",
        media: {
          type: "image",
          url: downloadURL,
          caption: "Property Image",
        },
      }),
    });

    setSelectedFile(null);
  };

  const toggleHandoff = async () => {
    if (!selectedContact) return;

    try {
      console.log("[HANDOFF] toggleHandoff Old:  ", handoff);
      const newHandoffState = !handoff;
      console.log("[HANDOFF] toggleHandoff New:  ", newHandoffState);
      // Optimistically update UI
      // setHandoff(newHandoffState);
      // const response = await fetch(
      //   `/api/conversations/${selectedContact}/handoff`,
      //   {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       handoff: newHandoffState,
      //     }),
      //   }
      // );
      const convRef = doc(db, "conversations", selectedContact);
      await setDoc(
        convRef,
        {
          handoff: newHandoffState,
          handoffInitiatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      if (!response.ok) throw new Error("Failed to toggle handoff");
    } catch (error) {
      console.error("Error toggling handoff:", error);
      // Revert on error
      // setHandoff(!newHandoffState);
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

  // Render contact info
  const renderContact = (contact) => {
    if (!contact) return null;
    const name = contact.name?.formatted_name || "Contact";
    const primaryPhone = contact.phones?.[0]?.phone || "";
    return (
      <div className="contact-card">
        <div className="contact-header">
          <FiUser className="contact-icon" />
          <div className="contact-name">{name}</div>
        </div>
        <div className="contact-details">
          {contact.phones?.map((phone, index) => (
            <div key={index} className="contact-phone">
              <FiPhone className="phone-icon" />
              <a href={`tel:${phone.phone}`}>{phone.phone}</a>
              {phone.type && <span className="phone-type">({phone.type})</span>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render media based on type
  const renderMedia = (media) => {
    if (!media) return null;

    switch (media.type) {
      case "video":
        return (
          <div className="media-container video-container">
            <video controls width="100%">
              <source src={media.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {media.caption && <p className="media-caption">{media.caption}</p>}
          </div>
        );

      case "contact":
        return (
          <div className="media-container contact-container">
            {renderContact(media.contact)}
          </div>
        );

      case "location":
        return (
          <div className="media-container location-container">
            <a
              href={`https://www.google.com/maps?q=${media.latitude},${media.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="location-link"
            >
              <FiMapPin className="location-icon" />
              <span>{media.name || "Location"}</span>
            </a>
            {media.address && (
              <div className="location-address">{media.address}</div>
            )}
          </div>
        );

      case "image":
        return (
          <div className="media-container">
            <img
              src={media.url}
              alt={media.caption}
              onClick={() => window.open(media.url, "_blank")}
            />
            {media.caption && <p className="media-caption">{media.caption}</p>}
          </div>
        );

      default:
        return null;
    }
  };

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
                  {conv.analysis?.sentiment && (
                    <span
                      className={`sentiment-dot ${conv.analysis.sentiment}`}
                    />
                  )}
                </div>
                <p className="last-message">
                  {conv.lastMessage?.text.slice(0, 30)}...
                </p>
                {conv.analysis?.topic && (
                  <div className="conversation-topic">
                    {conv.analysis.topic}
                  </div>
                )}
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
              <div className="conversation-analysis">
                <div className="analysis-tags">
                  <span
                    className={`sentiment-tag ${
                      conversations.find((c) => c.id === selectedContact)
                        ?.analysis?.sentiment || "neutral"
                    }`}
                  >
                    {conversations.find((c) => c.id === selectedContact)
                      ?.analysis?.sentiment || "Neutral"}
                  </span>
                  <span className="topic-tag">
                    {conversations.find((c) => c.id === selectedContact)
                      ?.analysis?.topic || "General Inquiry"}
                  </span>
                </div>
                <div className="summary-tooltip">
                  <FiInfo className="info-icon" />
                  <div className="summary-content">
                    <h4>Conversation Summary</h4>
                    <p>
                      {conversations.find((c) => c.id === selectedContact)
                        ?.analysis?.summary || "No summary available yet"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="handoff-toggle">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={handoff}
                    onChange={() => toggleHandoff()}
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
                    {msg.text && <p>{msg.text}</p>}
                    {msg.media && renderMedia(msg.media)}
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
              <div className="chat-input">
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
              </div>
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
