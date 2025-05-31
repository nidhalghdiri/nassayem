// /components/elements/WhatsAppChat.js
"use client";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  getFirestore,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function WhatsAppChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);

  // Fetch all conversations
  useEffect(() => {
    const q = query(collection(db, "conversations"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({ id: doc.id, ...data });
      });
      setConversations(list);
      if (list.length > 0 && !selectedContact) {
        setSelectedContact(list[0].id); // Select first contact by default
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch messages for selected contact
  useEffect(() => {
    if (!selectedContact) return;

    const messagesRef = collection(
      db,
      "conversations",
      selectedContact,
      "messages"
    );
    const q = query(messagesRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => list.push(doc.data()));
      setMessages(list);
    });

    return () => unsubscribe();
  }, [selectedContact]);

  // Send message to WhatsApp and save to Firebase
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      text: input,
      sender: "agent",
      timestamp: Date.now(),
      platform: "web",
      read: true,
    };

    // Save to Firebase
    const messagesRef = collection(
      db,
      "conversations",
      selectedContact,
      "messages"
    );
    await addDoc(messagesRef, newMessage);

    // Clear input
    setInput("");

    // Send message via WhatsApp Business API
    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedContact,
          message: input,
        }),
      });

      const result = await response.json();
      console.log("Message sent via WhatsApp:", result);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
    }
  };

  return (
    <div className="whatsapp-ui">
      {/* Sidebar */}
      <div className="sidebar">
        <h4>Chats</h4>
        <ul>
          {conversations.map((conv) => (
            <li
              key={conv.id}
              onClick={() => setSelectedContact(conv.id)}
              className={`contact ${
                selectedContact === conv.id ? "active" : ""
              }`}
            >
              <strong>{conv.customerName || conv.id}</strong>
              <p>{conv.lastMessage?.text.slice(0, 30)}...</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedContact ? (
          <>
            <div className="chat-box">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.sender === "customer" ? "left" : "right"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="chat-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .whatsapp-ui {
          display: flex;
          height: 600px;
          max-width: 900px;
          margin: auto;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
        }

        .sidebar {
          width: 30%;
          background-color: #f1f1f1;
          padding: 10px;
          border-right: 1px solid #ccc;
          overflow-y: auto;
        }

        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 10px;
          background-color: #fff;
        }

        .chat-box {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          height: 100%;
          padding-bottom: 10px;
        }

        .message {
          max-width: 70%;
          padding: 10px 15px;
          border-radius: 10px;
          font-size: 14px;
          word-wrap: break-word;
        }

        .message.left {
          align-self: flex-start;
          background-color: #ececec;
          color: #000;
          margin-right: auto;
        }

        .message.right {
          align-self: flex-end;
          background-color: #dcf8c6;
          color: #000;
          margin-left: auto;
        }

        .contact {
          padding: 10px;
          margin: 5px 0;
          cursor: pointer;
          border-radius: 4px;
        }

        .contact.active {
          background-color: #d1e7dd;
        }

        .chat-input {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .chat-input input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .chat-input button {
          padding: 10px 20px;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .no-chat-selected {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: #888;
        }
      `}</style>
    </div>
  );
}
