import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(request, { params }) {
  const { waId } = params;
  const { handoff } = await request.json();

  try {
    const convRef = doc(db, "conversations", waId);
    await setDoc(
      convRef,
      {
        handoff,
        handoffInitiatedAt: handoff ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Handoff error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
