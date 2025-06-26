import { doc, setDoc, collection, addDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { processAudioMessage } from "@/lib/audioService";

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate webhook payload
    if (!body.entry || !body.entry[0]?.changes?.[0]?.value) {
      return new Response("Invalid payload", { status: 400 });
    }

    const value = body.entry[0].changes[0].value;

    // Ignore status updates and non-message events
    if (value.statuses || !value.messages) {
      return new Response("Ignoring status update", { status: 200 });
    }

    const { contacts, messages } = body.entry[0].changes[0].value;
    if (!contacts?.[0] || !messages?.[0]) {
      return new Response("Missing contact or message data", { status: 400 });
    }

    const contact = contacts[0];
    const message = messages[0];
    console.log("Contact Received: ", contact);
    console.log("Message Received: ", message);

    const waId = contact.wa_id;
    const customerName = contact.profile.name;
    let messageText = message.text?.body || "[Media]";
    const messageTimestamp = parseInt(message.timestamp) * 1000;

    // Save conversation document
    // Save conversation document
    try {
      const convRef = doc(db, "conversations", waId);
      const convDoc = await getDoc(convRef);
      const isHandoff = convDoc.exists() ? convDoc.data().handoff : false;

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
          handoff: isHandoff,
          analysis: {
            summary: "",
            status: "pending",
            topic: "",
            sentiment: "",
            lastAnalyzedAt: null,
          },
        },
        { merge: true }
      );
      console.log(`### Successfully saved conversation document for ${waId}`);
    } catch (error) {
      console.error("### Failed to save conversation document:", error);
      return new Response("### Failed to save conversation", { status: 500 });
    }

    console.log(`Saved message from ${waId}: ${messageText}`);

    // Skip AI processing during handoff
    if (isHandoff) {
      console.log(`Skipping AI response for ${waId} (handoff active)`);
      return new Response("OK (handoff active)", { status: 200 });
    }

    var messageObj = {
      text: messageText,
      sender: "customer",
      timestamp: messageTimestamp,
      platform: "whatsapp",
      read: false,
      status: "delivered",
    };

    // Add this after voice message handling and before text message handling
    if (message.type === "button" && message.button?.text) {
      console.log("Received button interaction:", message.button.text);

      // Forward button text to OpenAI as regular message
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
              message: message.button.text,
              customerName,
              isButton: true, // Add this flag
              // buttonPayload: message.button.payload, // Optional
            }),
          }
        );

        if (!aiResponse.ok) {
          console.error(
            "Failed to generate AI response for button:",
            await aiResponse.text()
          );
        }
      }
    }

    // Handle voice messages
    if (message?.audio?.voice) {
      const audio = message?.audio;
      const result = await processAudioMessage(waId, audio);
      console.log("Transcripted Text Message: ", result);

      messageObj = {
        ...messageObj,
        mediaType: "audio",
        audioUrl: result.audioUrl,
      };

      // Forward to OpenAI handler
      const openaiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/openai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            waId,
            message: result.text,
            customerName,
            isVoice: true,
          }),
        }
      );

      const responseData = await openaiResponse.json();

      if (!openaiResponse.ok) {
        console.error(
          "Failed to generate AI response for Audio:",
          responseData
        );
        // Send fallback message to user
        await sendWhatsAppMessage(
          waId,
          "عذرًا، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى"
        );
      }
    }

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

    // Save individual message
    // Save individual message with proper error handling
    try {
      const messagesRef = collection(db, "conversations", waId, "messages");
      const docRef = await addDoc(messagesRef, messageObj);
      console.log(`### Message saved with ID: ${docRef.id}`);
    } catch (error) {
      console.error("### Error adding message to Firestore:", error);
      // Consider retry logic here
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ waId }),
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
