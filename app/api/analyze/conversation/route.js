import { getDocs, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  const { waId } = await request.json();

  try {
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

    // Update conversation
    await updateDoc(doc(db, "conversations", waId), {
      analysis: analysis,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Analysis failed:", error);
    return new Response(JSON.stringify({ error: "Analysis failed" }), {
      status: 500,
    });
  }
}
