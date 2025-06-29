import {
  getDocs,
  collection,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  const { waId } = await request.json();
  console.log("Start Analyze Conv: ", waId);
  try {
    // Get conversation document first to check if already sent
    const convRef = doc(db, "conversations", waId);
    const convDoc = await getDoc(convRef);
    const convData = convDoc.data() || {};
    console.log(" Analyze Conv Data: ", convData);
    // Skip if already sent to reception
    if (convData.summarySentToReception) {
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
      });
    }

    // Get conversation messages
    const messagesRef = collection(db, "conversations", waId, "messages");
    const snapshot = await getDocs(messagesRef);

    const conversation = [];
    snapshot.forEach((doc) => {
      const msg = doc.data();
      conversation.push(`${msg.sender}: ${msg.text}`);
    });

    const convoText = conversation.join("\n");

    // Generate analysis with enhanced summary
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a booking information analyst. Extract these key details from the conversation in both Arabic and English:
          1. BUILDING: Name or "Not mentioned"
          2. CHECK_IN: Date or "Not mentioned"
          3. CHECK_OUT: Date or "Not mentioned"
          4. PERSONS: Number or "Not mentioned"
          5. NEED: Customer's primary need
          6. MISSING: List any missing critical information
          
          Then create:
          7. SUMMARY_AR: Arabic summary with all details, noting missing info
          8. SUMMARY_EN: English summary with all details, noting missing info
          9. TOPIC: 2-3 word category
          10. SENTIMENT: positive/negative/neutral
          11. STATUS: resolved/pending/urgent
          
          Format:
          BUILDING: [value]
          CHECK_IN: [value]
          CHECK_OUT: [value]
          PERSONS: [value]
          NEED: [value]
          MISSING: [value]
          SUMMARY_AR: [text]
          SUMMARY_EN: [text]
          TOPIC: [text]
          SENTIMENT: [text]
          STATUS: [text]`,
        },
        { role: "user", content: convoText },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    // Parse response
    const analysis = { lastAnalyzedAt: new Date() };
    const text = response.choices[0].message.content;

    [
      "BUILDING",
      "CHECK_IN",
      "CHECK_OUT",
      "PERSONS",
      "NEED",
      "MISSING",
      "SUMMARY_AR",
      "SUMMARY_EN",
      "TOPIC",
      "SENTIMENT",
      "STATUS",
    ].forEach((key) => {
      const regex = new RegExp(`${key}:\\s*(.+)`);
      const match = text.match(regex);
      if (match) analysis[key.toLowerCase()] = match[1].trim();
    });

    // Check if all essential info is complete
    const essentialFields = ["building", "check_in", "check_out", "persons"];
    const isComplete = essentialFields.every(
      (field) =>
        analysis[field] &&
        !analysis[field].toLowerCase().includes("not mentioned")
    );

    // Update conversation with analysis
    await updateDoc(convRef, {
      analysis: analysis,
    });

    // Send to reception if all info complete and not sent before
    if (isComplete && !convData.summarySentToReception) {
      const receptionNumber = "96898590405";

      // 1. Send contact message (fixed format)
      // await fetch("/api/whatsapp/send", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     to: receptionNumber,
      //     senderType: "system",
      //     media: {
      //       type: "contact",
      //       contact: {
      //         name: {
      //           formatted_name: convData.customerName || waId,
      //           first_name: convData.customerName || waId,
      //         },
      //         phones: [{ phone: waId }],
      //       },
      //     },
      //   }),
      // });

      // 2. Send summary text
      const summaryText =
        `📋 New Booking Inquiry\n` +
        `👤 Customer: ${convData.customerName || waId}\n` +
        `📱 Phone: ${waId}\n\n` +
        `🏢 Building: ${analysis.building}\n` +
        `📅 Dates: ${analysis.check_in} to ${analysis.check_out}\n` +
        `👥 Persons: ${analysis.persons}\n\n` +
        `🔍 Summary (AR): ${analysis.summary_ar}\n\n` +
        `🔍 Summary (EN): ${analysis.summary_en}`;

      console.log("summaryText: ", summaryText);

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: receptionNumber,
          message: summaryText,
          senderType: "system",
        }),
      });

      // Mark as sent
      await updateDoc(convRef, {
        summarySentToReception: true,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Analysis failed:", error);
    return new Response(JSON.stringify({ error: "Analysis failed" }), {
      status: 500,
    });
  }
}

// Helper function to send contact message
async function sendContactMessage(to, waId, customerName) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to,
          senderType: "system",
          media: {
            type: "contact",
            contact: {
              name: {
                formatted_name: customerName || waId,
                first_name: customerName || waId,
                last_name: "",
              },
              phones: [{ phone: waId, wa_id: waId }],
            },
          },
        }),
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Failed to send contact:", error);
  }
}

// Helper function to send text message
async function sendTextMessage(to, text) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to,
          message: text,
          senderType: "bot",
        }),
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Failed to send text:", error);
  }
}
