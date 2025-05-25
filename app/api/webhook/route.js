// /app/api/webhook/route.js

export async function POST(request) {
  try {
    const body = await request.json();

    // Log the incoming message for debugging
    console.log("Incoming WhatsApp Webhook:", JSON.stringify(body, null, 2));

    // Respond to WhatsApp to acknowledge receipt
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// /app/api/webhook/route.js

export async function GET(request) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === "ns_whatsapp") {
    return Response.json({ success: true, challenge }, { status: 200 });
  }

  return Response.json(
    { success: false, error: "Invalid token" },
    { status: 403 }
  );
}
