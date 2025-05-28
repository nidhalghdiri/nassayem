// /components/elements/WhatsAppChat.js
"use client";
import { useEffect, useState } from "react";
import { collection, query, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function WhatsAppChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Listen to messages in real time
  useEffect(() => {
    const q = query(collection(db, "chats"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => list.push(doc.data()));
      setMessages(list);
    });
    return () => unsubscribe();
  }, []);

  // Handle message submission
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    await addDoc(collection(db, "chats"), {
      text: input,
      sender: "user",
      timestamp: Date.now(),
    });

    // Clear input
    setInput("");
  };

  return (
    <div className="chat-interface">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
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

      <style jsx>{`
        .chat-interface {
          max-width: 600px;
          margin: 20px auto;
          border: 1px solid #ccc;
          padding: 20px;
          border-radius: 8px;
          background: #f9f9f9;
        }

        .chat-box {
          height: 400px;
          overflow-y: auto;
          margin-bottom: 10px;
        }

        .message {
          margin: 10px 0;
          padding: 10px 15px;
          border-radius: 5px;
          max-width: 70%;
          font-size: 14px;
        }

        .message.user {
          background-color: #dcf8c6;
          align-self: flex-end;
          margin-left: auto;
        }

        .message.bot {
          background-color: #ececec;
          color: #000;
          margin-right: auto;
        }

        .chat-input {
          display: flex;
          gap: 10px;
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
      `}</style>
    </div>
  );
}
