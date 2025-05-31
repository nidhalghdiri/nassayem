// /app/api/whatsapp/send/route.js

import axios from "axios";
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";

// export async function POST(request) {
//   try {
//     const { to, message } = await request.json();

//     // WhatsApp Business API endpoint
//     const url = `https://graph.facebook.com/v18.0/701862303001191/messages`;

//     const data = {
//       messaging_product: "whatsapp",
//       to,
//       type: "text",
//       text: { body: message },
//     };

//     try {
//       const response = await axios.post(url, data, {
//         headers: {
//           Authorization: `Bearer EAAQ8GvpD3gYBO0qnOZCHrX7IKSywZAlJBHH9oD85u4orc4iRNowaZBojBs2opRjTfqtd6ajEVtL4jL8Q1f6PARCqfWLQDkVTg6f7f9Dx7NfSYbkXPzQNaa6QveERBi8srzGZAiHzdzwu6NWah0ZCA8GVB8cHL8GElXprbAkfd6g6qwT8DEEZCH4Vx4PwTvhvfvCwZDZD`,
//           "Content-Type": "application/json",
//         },
//       });

//       // Save message to Firebase
//       const messagesRef = collection(db, "conversations", to, "messages");
//       await addDoc(messagesRef, {
//         text: message,
//         sender: "agent",
//         timestamp: Date.now(),
//         platform: "web",
//         read: true,
//       });

//       return Response.json({ success: true, data: response.data });
//     } catch (error) {
//       console.error(
//         "Error sending message:",
//         error.response?.data || error.message
//       );
//       return Response.json({ success: false, error: error.message });
//     }
//   } catch (error) {
//     console.error("Error sending WhatsApp message:", error);
//     return Response.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }
export async function POST(request) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // WhatsApp Business API configuration
    const accessToken =
      "EAAQ8GvpD3gYBOyBjBiZBEceqkSAzoXdZBCRQxbREouAnL8DtG8wKwYvONH8pPwD5GLMCcYX24HLyQxkGAEKRQt0aarzh7SIA4xWSrS7CN0FEHwwAeNV6kzfA5UWxOQCdCHCECEF1vccf54LFPCxRo4yWYKZBBrLxP3DMiordKJ0yw3BL83vZAGdC20yeTrViqAZDZD";

    const url = `https://graph.facebook.com/v18.0/701862303001191/messages`;
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "text",
      text: { body: message },
    };

    // First save message to Firebase as "sending"
    const messagesRef = collection(db, "conversations", to, "messages");
    const messageRef = await addDoc(messagesRef, {
      text: message,
      sender: "agent",
      timestamp: Date.now(),
      platform: "web",
      read: true,
      status: "sending",
    });

    // Send message via WhatsApp API
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Sended Result", result);

    if (response.ok) {
      // Update message status to "sent"
      await setDoc(
        doc(db, "conversations", to, "messages", messageRef.id),
        { status: "sent", whatsappMessageId: result.messages?.[0]?.id },
        { merge: true }
      );

      // Update conversation last message
      await setDoc(
        doc(db, "conversations", to),
        {
          lastMessage: {
            text: message,
            timestamp: Date.now(),
            sender: "agent",
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return Response.json({ success: true, data: result });
    } else {
      // Update message status to "failed"
      await setDoc(
        doc(db, "conversations", to, "messages", messageRef.id),
        { status: "failed", error: result.error?.message },
        { merge: true }
      );

      return Response.json(
        { success: false, error: result.error },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
