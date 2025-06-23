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

    // Generate analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze this conversation and provide:
          1. One-sentence SUMMARY in Arabic
          2. MAIN TOPIC in 2-3 words
          3. SENTIMENT (positive/negative/neutral)
          4. STATUS (resolved/pending/urgent)
          
          Format: 
          SUMMARY: [text]
          TOPIC: [text]
          SENTIMENT: [text]
          STATUS: [text]`,
        },
        { role: "user", content: convoText },
      ],
    });

    // Parse response
    const analysis = { lastAnalyzedAt: new Date() };
    const text = response.choices[0].message.content;

    ["SUMMARY", "TOPIC", "SENTIMENT", "STATUS"].forEach((key) => {
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
