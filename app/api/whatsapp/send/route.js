// /app/api/whatsapp/send/route.js

import axios from "axios";
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
export async function POST(request) {
  try {
    const { to, message, senderType = "agent", media } = await request.json();
    console.log(
      "[SEND] Sending Message To " + to + " : " + (message || "[Media]")
    );
    console.log(
      "[SEND] Sending Media Message To " + to + " : " + "[Media] : " + media
    );

    if (!to || (!message && !media)) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // WhatsApp Business API configuration
    const accessToken =
      "EAAQ8GvpD3gYBOyBjBiZBEceqkSAzoXdZBCRQxbREouAnL8DtG8wKwYvONH8pPwD5GLMCcYX24HLyQxkGAEKRQt0aarzh7SIA4xWSrS7CN0FEHwwAeNV6kzfA5UWxOQCdCHCECEF1vccf54LFPCxRo4yWYKZBBrLxP3DMiordKJ0yw3BL83vZAGdC20yeTrViqAZDZD";

    const url = `https://graph.facebook.com/v18.0/701862303001191/messages`;

    // Handle local image paths (if URL starts with /)
    let mediaUrl = media?.url;
    if (mediaUrl) {
      mediaUrl = getAbsoluteUrl(mediaUrl); // Convert to absolute URL
    }

    let payload;
    if (media) {
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: media.type,
        [media.type]: {
          link: mediaUrl,
          caption: media.caption || "",
        },
      };
    } else {
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: { body: message },
      };
    }

    // First save message to Firebase as "sending"
    const messagesRef = collection(db, "conversations", to, "messages");
    const messageRef = await addDoc(messagesRef, {
      sender: senderType, // Use the parameter here
      timestamp: Date.now(),
      platform: "whatsapp",
      read: false,
      status: "sending",
      ...(media
        ? {
            media: {
              type: media.type,
              url: media.url,
              caption: media.caption,
            },
          }
        : {
            text: message,
          }),
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
        {
          status: "sent",
          whatsappMessageId: result.messages?.[0]?.id,
          ...(media ? { media: { ...media, url: mediaUrl } } : {}),
        },
        { merge: true }
      );

      // Update conversation last message
      await setDoc(
        doc(db, "conversations", to),
        {
          lastMessage: {
            text: media ? "[Media]" : message,
            timestamp: Date.now(),
            sender: "agent",
            isSystemMessage: true,
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
const getAbsoluteUrl = (path) => {
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;
};
