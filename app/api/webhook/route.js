import { doc, setDoc, collection, addDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate webhook payload
    if (!body.entry || !body.entry[0]?.changes?.[0]?.value) {
      return new Response("Invalid payload", { status: 400 });
    }

    const { contacts, messages } = body.entry[0].changes[0].value;
    if (!contacts?.[0] || !messages?.[0]) {
      return new Response("Missing contact or message data", { status: 400 });
    }

    const contact = contacts[0];
    const message = messages[0];
    const waId = contact.wa_id;
    const customerName = contact.profile.name;
    const messageText = message.text?.body || "[Media]";
    const messageTimestamp = parseInt(message.timestamp) * 1000; // Convert to milliseconds

    // Save conversation document
    const convRef = doc(db, "conversations", waId);
    await setDoc(
      convRef,
      {
        customerPhoneNumber: waId,
        customerName: customerName,
        lastMessage: {
          text: messageText,
          timestamp: messageTimestamp,
          sender: "customer",
        },
        status: "active",
        updatedAt: new Date().toISOString(),
        handoff: false, // Default to bot handling
        handoffInitiatedAt: null,
        handoffInitiatedBy: null,
      },
      { merge: true }
    );

    // Save individual message
    const messagesRef = collection(db, "conversations", waId, "messages");
    await addDoc(messagesRef, {
      text: messageText,
      sender: "customer",
      timestamp: messageTimestamp,
      platform: "whatsapp",
      read: false,
      status: "delivered",
    });

    console.log(`Saved message from ${waId}: ${messageText}`);

    // Generate AI response for text messages only
    if (message.text?.body) {
      const convDoc = await getDoc(doc(db, "conversations", waId));
      if (!convDoc.exists() || !convDoc.data().handoff) {
        const aiResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/openai`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              waId,
              message: messageText,
              customerName,
            }),
          }
        );

        if (!aiResponse.ok) {
          console.error(
            "Failed to generate AI response:",
            await aiResponse.text()
          );
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
