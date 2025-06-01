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

export default function WhatsAppChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isSending, setIsSending] = useState(false);
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
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setMessages(list);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [selectedContact]);

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
      const messagesRef = collection(
        db,
        "conversations",
        selectedContact,
        "messages"
      );
      await addDoc(messagesRef, {
        text: messageText,
        sender: "agent",
        timestamp: Date.now(),
        platform: "web",
        read: false,
        status: "sending",
      });

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

  return (
    <div className="whatsapp-ui">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>WhatsApp Conversations</h3>
        </div>
        <div className="conversation-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedContact(conv.id)}
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
                  {conv.lastMessage?.text.slice(0, 50)}...
                </p>
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
              <h3>
                {conversations.find((c) => c.id === selectedContact)
                  ?.customerName || selectedContact}
              </h3>
            </div>

            <div className="chat-box">
              {messages.length === 0 ? (
                <div className="no-messages">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.sender}`}>
                    <div className="message-content">
                      <p>{msg.text}</p>
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="chat-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={isSending}
              />
              <button type="submit" disabled={isSending || !input.trim()}>
                {isSending ? "Sending..." : "Send"}
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .whatsapp-ui {
          display: flex;
          height: 80vh;
          max-width: 1200px;
          margin: 20px auto;
          border: 1px solid #e1e1e1;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .sidebar {
          width: 30%;
          background-color: #f8f9fa;
          border-right: 1px solid #e1e1e1;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 15px;
          border-bottom: 1px solid #e1e1e1;
          background-color: #f0f2f5;
        }

        .conversation-list {
          flex: 1;
          overflow-y: auto;
        }

        .conversation-item {
          display: flex;
          padding: 12px;
          cursor: pointer;
          border-bottom: 1px solid #e1e1e1;
          transition: background-color 0.2s;
        }

        .conversation-item:hover {
          background-color: #f0f2f5;
        }

        .conversation-item.active {
          background-color: #e1f5fe;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #25d366;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-weight: bold;
        }

        .conversation-details {
          flex: 1;
          min-width: 0;
        }

        .conversation-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .time {
          font-size: 0.8em;
          color: #666;
        }

        .last-message {
          font-size: 0.9em;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #e5ddd5;
          background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AkEEjIZW4Z1XQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAALUlEQVQ4y2NgGAXDADDCGEuWLPkPxJ8/f2b4//8/A1JgZGTEKQYVQxVDig0rAAB2sRBC4S3wJQAAAABJRU5ErkJggg==");
        }

        .chat-header {
          padding: 15px;
          background-color: #f0f2f5;
          border-bottom: 1px solid #e1e1e1;
          text-align: center;
        }

        .chat-box {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .no-messages {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .message {
          max-width: 70%;
          display: flex;
          flex-direction: column;
        }

        .message.customer {
          align-self: flex-start;
        }

        .message.agent,
        .message.bot {
          align-self: flex-end;
        }

        .message-content {
          padding: 10px 15px;
          border-radius: 8px;
          position: relative;
          word-wrap: break-word;
        }

        .message.customer .message-content {
          background-color: white;
          border-top-left-radius: 0;
        }

        .message.agent .message-content {
          background-color: #dcf8c6;
          border-top-right-radius: 0;
        }

        .message.bot .message-content {
          background-color: #e5e5ea;
          border-top-right-radius: 0;
        }

        .message-time {
          font-size: 0.7em;
          color: #666;
          margin-top: 4px;
          text-align: right;
        }

        .chat-input {
          display: flex;
          padding: 10px;
          background-color: #f0f2f5;
          border-top: 1px solid #e1e1e1;
        }

        .chat-input input {
          flex: 1;
          padding: 12px 15px;
          border: none;
          border-radius: 20px;
          outline: none;
          font-size: 1em;
        }

        .chat-input button {
          margin-left: 10px;
          padding: 12px 20px;
          background-color: #25d366;
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.2s;
        }

        .chat-input button:hover {
          background-color: #128c7e;
        }

        .chat-input button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .no-chat-selected {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }
      `}</style>
    </div>
  );
}
