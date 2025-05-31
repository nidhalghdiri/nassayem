// // /lib/ai.js
// import { Configuration, OpenAIApi } from "openai";
// import { franc } from "franc";

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// // Detect language (English or Arabic)
// function detectLanguage(text) {
//   const langCode = franc(text);
//   return langCode === "arb" ? "ar" : "en";
// }

// // Get prompt based on property info and history
// async function getAIResponse(
//   conversationHistory,
//   propertyDetails,
//   customerData
// ) {
//   const userMessage = conversationHistory[conversationHistory.length - 1]?.text;

//   const language = detectLanguage(userMessage);

//   const systemPrompt = `
// You are Nassayem Salalah AI assistant.
// You help customers with property inquiries, reservations, check-in/out, contracts, promotions, and more.
// Respond naturally, politely, and clearly — use Arabic if the user speaks Arabic, else respond in English.
// Be concise and helpful.
// Only respond to messages related to property management and customer service.
// Never mention internal processes or that you're an AI.

// Customer Info:
// Name: ${customerData.name || "Guest"}
// Phone: ${customerData.phone}
// Last Bookings: ${
//     customerData.bookings.map((b) => b.unitId).join(", ") || "None"
//   }

// Property Info:
// ${propertyDetails.title}, ${propertyDetails.location}
// Price: ${propertyDetails.pricing.monthly} OMR/month
// Bedrooms: ${propertyDetails.bedrooms}
// Bathrooms: ${propertyDetails.bathrooms}
// Size: ${propertyDetails.size} SqFT
// Features: ${propertyDetails.features.join(", ")}

// Conversation History:
// ${conversationHistory.map((m) => `${m.sender}: ${m.text}`).join("\n")}

// Your task: Generate a natural response to the latest message: "${userMessage}"
// `;

//   const response = await openai.createChatCompletion({
//     model: "gpt-4o",
//     temperature: 0.7,
//     max_tokens: 256,
//     top_p: 1,
//     frequency_penalty: 0,
//     presence_penalty: 0,
//     messages: [
//       { role: "system", content: systemPrompt },
//       { role: "user", content: userMessage },
//     ],
//   });

//   return {
//     reply: response.data.choices[0].message.content.trim(),
//     language,
//   };
// }

// export default getAIResponse;
