import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(request, { params }) {
  try {
    const { waId } = params;
    const { handoff, agentId } = await request.json();

    if (typeof handoff !== "boolean" || !agentId) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await setDoc(
      doc(db, "conversations", waId),
      {
        handoff,
        handoffInitiatedAt: handoff ? new Date().toISOString() : null,
        handoffInitiatedBy: handoff ? agentId : null,
      },
      { merge: true }
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Handoff error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
