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
  // Extract query parameters from the request
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  // Verify the token matches your expected verify token
  if (mode === "subscribe" && token === "ns_whatsapp") {
    // Return the challenge as a plain text response
    return new Response(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain", // Ensure the response is plain text
      },
    });
  }

  // If the token doesn't match, return an error response
  return new Response("Invalid token", {
    status: 403,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
