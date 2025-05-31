// /app/api/whatsapp/send/route.js

import axios from "axios";
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";

export async function POST(request) {
  try {
    const { to, message } = await request.json();

    // WhatsApp Business API endpoint
    const url = `https://graph.facebook.com/v18.0/701862303001191/messages`;

    const data = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    };

    try {
      const response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer EAAQ8GvpD3gYBO0qnOZCHrX7IKSywZAlJBHH9oD85u4orc4iRNowaZBojBs2opRjTfqtd6ajEVtL4jL8Q1f6PARCqfWLQDkVTg6f7f9Dx7NfSYbkXPzQNaa6QveERBi8srzGZAiHzdzwu6NWah0ZCA8GVB8cHL8GElXprbAkfd6g6qwT8DEEZCH4Vx4PwTvhvfvCwZDZD`,
          "Content-Type": "application/json",
        },
      });

      // Save message to Firebase
      const messagesRef = collection(db, "conversations", to, "messages");
      await addDoc(messagesRef, {
        text: message,
        sender: "agent",
        timestamp: Date.now(),
        platform: "web",
        read: true,
      });

      return Response.json({ success: true, data: response.data });
    } catch (error) {
      console.error(
        "Error sending message:",
        error.response?.data || error.message
      );
      return Response.json({ success: false, error: error.message });
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
