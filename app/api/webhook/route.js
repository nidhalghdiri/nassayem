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
    .post(`https://graph.facebook.com/v18.0/701862303001191/messages`, data, {
      headers: {
        Authorization: `Bearer EAAQ8GvpD3gYBO0qnOZCHrX7IKSywZAlJBHH9oD85u4orc4iRNowaZBojBs2opRjTfqtd6ajEVtL4jL8Q1f6PARCqfWLQDkVTg6f7f9Dx7NfSYbkXPzQNaa6QveERBi8srzGZAiHzdzwu6NWah0ZCA8GVB8cHL8GElXprbAkfd6g6qwT8DEEZCH4Vx4PwTvhvfvCwZDZD`,
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
