import OpenAI from "openai";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { waId, message, customerName } = await request.json();

    if (!waId || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate AI response
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You're a helpful customer support assistant for a business. 
                    Respond concisely and professionally to customer inquiries in WhatsApp style.
                    Keep responses under 500 characters. 
                    Customer name: ${customerName || "Customer"}`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = response.choices[0]?.message?.content;

    // Save AI response to conversation
    const convRef = doc(db, "conversations", waId);
    await setDoc(
      convRef,
      {
        lastMessage: {
          text: aiResponse,
          timestamp: Date.now(),
          sender: "bot",
        },
        status: "active",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Save AI message
    const messagesRef = collection(db, "conversations", waId, "messages");
    await addDoc(messagesRef, {
      text: aiResponse,
      sender: "bot",
      timestamp: Date.now(),
      platform: "whatsapp",
      read: false,
      status: "delivered",
    });

    // Send response via WhatsApp
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: waId,
        message: aiResponse,
      }),
    });

    return new Response(
      JSON.stringify({ success: true, response: aiResponse }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("OpenAI API error:", error);
    return new Response(
      JSON.stringify({
        error: "Error processing request",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
