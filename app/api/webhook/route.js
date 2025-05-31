// /app/api/webhook/route.js
import getAIResponse from "@/lib/ai";
import { db, chatRef } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
export async function POST(request) {
  try {
    const body = await request.json();
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message || !message.from) return Response.json({ success: true });

    const waId = message.from;
    const text = message.text?.body || "[Media]";
    const timestamp = Date.now();

    // Save or update conversation
    const convRef = doc(db, "conversations", waId);
    const convSnap = await getDoc(convRef);
    if (!convSnap.exists()) {
      await setDoc(convRef, {
        customerPhoneNumber: waId,
        startedAt: timestamp,
        status: "active",
        lastMessage: { text, timestamp },
        sender: "customer",
      });
    } else {
      await setDoc(
        convRef,
        {
          lastMessage: { text, timestamp },
        },
        { merge: true }
      );
    }

    // Save message to subcollection
    const msgRef = collection(db, "conversations", waId, "messages");
    await addDoc(msgRef, {
      text,
      sender: "customer",
      timestamp,
      platform: "whatsapp",
      read: false,
    });

    // Get property data from Firebase or NetSuite
    const propertyDetails = {
      title: "Al-Saada Commercial Apartment",
      location: "Al-Saada, Salalah",
      bedrooms: 2,
      bathrooms: 2,
      size: "1200",
      pricing: { monthly: 250 },
      features: ["Furnished", "AC", "WiFi"],
    };

    // Fetch conversation history
    const historySnapshot = await getDocs(
      collection(db, "conversations", waId, "messages")
    );
    const conversationHistory = historySnapshot.docs.map((doc) => doc.data());

    // Get customer data (from Firebase or NetSuite)
    const customerData = await fetchCustomerFromNetSuite(waId); // You'll implement this later

    // Generate AI response
    const aiResponse = await getAIResponse(
      conversationHistory,
      propertyDetails,
      customerData
    );

    // Send AI reply via WhatsApp Business API
    const whatsappResponse = await sendWhatsAppMessage(waId, aiResponse.reply);

    // Save AI reply to Firebase
    await addDoc(collection(db, "conversations", waId, "messages"), {
      text: aiResponse.reply,
      sender: "bot",
      timestamp: Date.now(),
      platform: "web",
      read: false,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return Response.json({ success: false, error: error.message });
  }
}
// Dummy placeholder – replace with actual NetSuite call
async function fetchCustomerFromNetSuite(phoneNumber) {
  // Simulate fetching from NetSuite
  return {
    name: "Ahmed Al-Hinai",
    phone: phoneNumber,
    bookings: [{ unitId: "APT123", status: "confirmed" }],
  };
}

// Function to send WhatsApp message
async function sendWhatsAppMessage(to, message) {
  const url = `https://graph.facebook.com/v22.0/701862303001191/messages`;
  const data = {
    messaging_product: "whatsapp",
    to,
    text: { body: message },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer EAAQ8GvpD3gYBOyBjBiZBEceqkSAzoXdZBCRQxbREouAnL8DtG8wKwYvONH8pPwD5GLMCcYX24HLyQxkGAEKRQt0aarzh7SIA4xWSrS7CN0FEHwwAeNV6kzfA5UWxOQCdCHCECEF1vccf54LFPCxRo4yWYKZBBrLxP3DMiordKJ0yw3BL83vZAGdC20yeTrViqAZDZD`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

// /app/api/webhook/route.js

export async function GET(request) {
  // Extract query parameters from the request
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  // Verify the token matches your expected verify token
  if (mode === "subscribe" && token === "ns_whatsapp") {
    // Return the challenge as a plain text response
    return new Response(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain", // Ensure the response is plain text
      },
    });
  }

  // If the token doesn't match, return an error response
  return new Response("Invalid token", {
    status: 403,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
