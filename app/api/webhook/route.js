// /app/api/webhook/route.js
export async function POST(request) {
  try {
    const body = await request.json();

    // Log the incoming payload for debugging
    console.log("Incoming WhatsApp Webhook:", JSON.stringify(body, null, 2));

    // Extract the message details
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const sender = message.from; // Sender's phone number
      const text = message.text?.body; // Message text

      console.log(`Received message from ${sender}: ${text}`);

      // Respond to the message (optional)
      replyToMessage(sender, `Thank you for your message: ${text}`);
    }

    // Acknowledge receipt of the message
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Function to send a reply
function replyToMessage(to, message) {
  const axios = require("axios");

  const data = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: message },
  };

  axios
    .post(`https://graph.facebook.com/v22.0/701862303001191/messages`, data, {
      headers: {
        Authorization: `Bearer EAAQ8GvpD3gYBOyBjBiZBEceqkSAzoXdZBCRQxbREouAnL8DtG8wKwYvONH8pPwD5GLMCcYX24HLyQxkGAEKRQt0aarzh7SIA4xWSrS7CN0FEHwwAeNV6kzfA5UWxOQCdCHCECEF1vccf54LFPCxRo4yWYKZBBrLxP3DMiordKJ0yw3BL83vZAGdC20yeTrViqAZDZD`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log("Reply sent successfully:", response.data);
    })
    .catch((error) => {
      console.error(
        "Error sending reply:",
        error.response?.data || error.message
      );
    });
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
