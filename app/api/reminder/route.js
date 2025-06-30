// app/api/reminder/route.js
import { collection, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Building configuration
const BUILDING_INFO = {
  alwadi: {
    id: "alwadi",
    name_ar: "بناية الوادي",
    name_en: "Al Wadi Building",
    reception: "96898590405",
    template: "ns_reception_reminder_ar",
    lang: "ar",
  },
  awqad_north: {
    id: "awqad_north",
    name_ar: "بناية عوقد",
    name_en: "Awqad Building",
    reception: "96898590405",
    template: "ns_reception_reminder_ar",
    lang: "ar",
  },
  salalah_central: {
    id: "salalah_central",
    name_ar: "بناية صلالة الوسطى",
    name_en: "Salalah Central Building",
    reception: "96898590405",
    template: "ns_reception_reminder_ar",
    lang: "ar",
  },
  sadaa: {
    id: "sadaa",
    name_ar: "بناية السعادة 25",
    name_en: "Sadaa 25 Building",
    reception: "96898590405",
    template: "ns_reception_reminder_ar",
    lang: "ar",
  },
  sadaa_2: {
    id: "sadaa_2",
    name_ar: "بناية السعادة نستو",
    name_en: "Sadaa Nesto Building",
    reception: "96898590405",
    template: "ns_reception_reminder_ar",
    lang: "ar",
  },
  hay_tijari: {
    id: "hay_tijari",
    name_ar: "بناية الحي التجاري",
    name_en: "Commercial District Building",
    reception: "96898590405",
    template: "ns_reception_reminder_en",
    lang: "en",
  },
  villa_awqad_b: {
    id: "villa_awqad_b",
    name_ar: "فيلا عوقد - مربع ب",
    name_en: "Awqad Luxury Villa - Square B",
    reception: "96898590405",
    template: "ns_reception_reminder_ar",
    lang: "ar",
  },
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { conversationId, buildingId, summary } = body;

    // Validate required fields
    if (!conversationId || !buildingId || !summary?.ar || !summary?.en) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get building info
    const building = BUILDING_INFO[buildingId.toLowerCase()];
    if (!building) {
      return new Response(JSON.stringify({ error: "Invalid building ID" }), {
        status: 400,
      });
    }

    // Create reminder document
    const reminderData = {
      conversationId,
      buildingId,
      receptionNumber: building.reception,
      templateName: building.template,
      sentAt: new Date().toISOString(),
      status: "pending",
      summary: summary[building.lang],
    };

    // Save to ConversationReminder collection
    const remindersRef = collection(db, "conversationReminder");
    const docRef = await addDoc(remindersRef, reminderData);

    console.log("Reminder Building Data: ", building);

    // Send WhatsApp template
    const templateResponse = await sendTemplateMessage(
      building.reception,
      building.lang,
      building.template,
      conversationId,
      summary[building.lang],
      building.name_ar
    );

    console.log("Reminder templateResponse: ", templateResponse);

    // Update reminder status
    await updateDoc(docRef, {
      status: templateResponse.success ? "sent" : "failed",
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Reminder failed:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Helper function to send WhatsApp template
async function sendTemplateMessage(
  to,
  lang,
  templateName,
  conversationId,
  summary,
  building_name
) {
  try {
    const accessToken =
      "EAAQ8GvpD3gYBOyBjBiZBEceqkSAzoXdZBCRQxbREouAnL8DtG8wKwYvONH8pPwD5GLMCcYX24HLyQxkGAEKRQt0aarzh7SIA4xWSrS7CN0FEHwwAeNV6kzfA5UWxOQCdCHCECEF1vccf54LFPCxRo4yWYKZBBrLxP3DMiordKJ0yw3BL83vZAGdC20yeTrViqAZDZD";

    const url = `https://graph.facebook.com/v18.0/701862303001191/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        template: {
          name: templateName,
          language: lang == "en" ? "en_US" : "ar",
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: building_name },
                { type: "text", text: "Nidhal Ghdiri" },
                { type: "text", text: "96898590405" },
                { type: "text", text: "10/07 to 20/07" },
                { type: "text", text: "4" },
                { type: "text", text: summary.slice(0, 100) },
              ],
            },
          ],
        },
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Template send failed:", error);
    return { success: false };
  }
}
