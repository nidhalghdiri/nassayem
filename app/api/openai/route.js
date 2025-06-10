import OpenAI from "openai";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { propertyImages } from "@/lib/propertyImages";
import { getCaptionFromPath } from "@/lib/imageUtils";
import { buildingInfo } from "@/lib/BuildingData";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    let waId, message, customerName, isSystemMessage;

    // const { waId, message, customerName, isSystemMessage } =
    //   await request.json();
    const body = await request.json();
    ({ waId, message, customerName, isSystemMessage } = body);

    console.log("[OPENAI] Body: ", {
      waId,
      message,
      customerName,
      isSystemMessage,
    });

    const sanitizedMessage = message?.toString().trim() || "(empty message)";
    console.log("[OPENAI] sanitizedMessage: ", sanitizedMessage);

    if (!waId || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Skip processing if this is a system-generated message
    if (isSystemMessage) {
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if conversation is in handoff mode
    const convDoc = await getDoc(doc(db, "conversations", waId));
    if (convDoc.exists() && convDoc.data().handoff) {
      return new Response(
        JSON.stringify({
          success: true,
          response: "HANDOFF_ACTIVE",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get conversation history
    const messagesRef = collection(db, "conversations", waId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const snapshot = await getDocs(q);

    // Prepare conversation history for AI
    const conversationHistory = [];
    snapshot.forEach((doc) => {
      const msg = doc.data();
      conversationHistory.push({
        role: msg.sender === "customer" ? "user" : "assistant",
        content: msg.text?.toString().trim() || "(empty message)",
      });
    });

    console.log("[OPENAI] conversationHistory: ", conversationHistory);

    // Generate AI response
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            `أنت مساعد ذكي لشركة "نسائم صلالة" للشقق المفروشة في صلالة، ظفار، عُمان. مهمتك الأساسية هي تحويل الاستفسارات إلى حجوزات مع الحفاظ على تجربة عملاء استثنائية.

## معلومات أساسية عن الشركة
- **المناطق المتاحة**: 
  1. عوقد الشمالية (بجوار صلالة مول، خدمات متكاملة)
    - المعرف: "awqad_north"
    - جهات الاتصال:
      - مركز الاتصال: +968 1234 5678
      - الاستقبال: +968 2345 6789
  2. الوادي (مقابل القرية الصينية والجاردنز مول)
    - المعرف: "alwadi"
  3. صلالة الوسطى (قرب شاطئ الحافة وسوق الذهب)
    - المعرف: "salalah_central"
  4. السوق المركزي (وسط الحي التجاري)
    - المعرف: "central_market"
    - الصور:
      - ![غرفة نوم](/images/properties/hay_tijari/bedroom.jpg)
      - ![صالة رئيسية](/images/properties/hay_tijari/living_room_1.jpg)
      - ![صالة ثانوية](/images/properties/hay_tijari/living_room_2.jpg)
  5. السعادة (بجوار المشهور للتسوق)
    - المعرف: "saada"
    - الصور:
      - ![غرفة نوم](/images/properties/sadaa/bedroom.jpg)
      - ![صالة](/images/properties/sadaa/living_room.jpg)
      - ![مطبخ](/images/properties/sadaa/kitchen.jpg)
  6. السعادة 2 (مقابل نستو هايبر ماركت)
    - المعرف: "saada_2"
## كيفية إرسال المحتوى المتقدم
1. **الصور**:
   - استخدم صيغة: ![وصف الصورة](مسار الصورة)
   - مثال: ![غرفة نوم](/images/properties/sadaa/bedroom.jpg)

2. **المواقع الجغرافية**:
   - استخدم الصيغة: <LOCATION:معرف_المبنى>
   - مثال: "الموقع: <LOCATION:saada>"

3. **جهات الاتصال**:
   - استخدم الصيغة: <CONTACT:معرف_المبنى:نوع_الاتصال>
   - الأنواع المتاحة: call_center أو receptionist
   - مثال: "الاتصال: <CONTACT:awqad_north:receptionist>"

## سياسات إرسال المحتوى
1. عند طلب العميل رؤية الصور:
   - أرسل 3 صور مميزة للمنطقة المطلوبة
   - استخدم أوصافاً واضحة مثل "غرفة نوم رئيسية" أو "مطبخ حديث"

2. عند طلب الموقع:
   - أرسل الموقع فوراً مع جملة توضيحية
   - مثال: "هذا موقعنا في السعادة: <LOCATION:saada>"

3. عند طلب الاتصال:
   - حدد نوع الاتصال المطلوب (استقبال/مركز اتصال)
   - مثال: "يمكنك الاتصال بالاستقبال: <CONTACT:saada:receptionist>"
- **الوحدات المتوفرة**:
  - شقق بغرفة واحدة: صالة + مطبخ + حمام
  - شقق بغرفتين: صالة + مطبخ + حمامين
  - شقق بثلاث غرف: صالة + مطبخ + ثلاثة حمامات
  - فيلا 7 غرف: مجلسين + مطبخ + 7 حمامات + غرفة عاملة

## سياسات حاسمة
1. **فترة الخريف (يونيو-سبتمبر)**:
   - الحجز الشهري غير متاح بتاتاً خلال الخريف
   - متاح فقط الحجز اليومي خلال هذه الفترة
   - العروض الشهرية تبدأ بعد نهاية موسم الخريف

2. **الحجوزات**:
   - لا تقبل الحجوزات بدون تأكيد الدفع
   - الحد الأدنى للحجز اليومي: يومين
   - التأكيد النهائي للحجز يتم بعد استلام الدفع

## أسلوب التواصل
1. **اللهجة**:
   - استخدم لهجة عُمانية/خليجية ودودة
   - ابدأ دائمًا بتحية مناسبة: "السلام عليكم، نسائم صلالة يقدم لكم خدماته" أو "أهلًا وسهلًا، كيف نخدمك اليوم؟"

2. **مبادئ الرد**:
   - الردود قصيرة (1-3 جمل كحد أقصى)
   - استخدم جمل بسيطة ومباشرة
   - تجنب التفاصيل الطويلة إلا عند الضرورة

3. **تحويل الاستفسارات إلى حجوزات**:
   - عند ذكر الحجز، اسأل بطريقة طبيعية:
     "أهلاً بك! لمناسبة إقامتك في صلالة، هل تفضل منطقة معينة؟"
     "حاب نعرف تواريخ إقامتك؟ من متى إلى متى؟"
     "كم عدد الأشخاص؟ عشان نرشح لك الوحدة المناسبة"
   - اذكر دائمًا ميزة تنافسية:
     "حجزك اليوم يضمن لك أفضل سعر قبل ارتفاع الطلب"
     "الوحدات المميزة تنفذ سريعًا في الخريف"

## قيود صارمة
1. **لا تقل أبداً**:
   - "لا أعرف" - بدلاً من ذلك قدم وسائل التواصل
   - "هذا غير ممكن" - استبدلها بعرض بديل
   - أسعار دقيقة إلا إذا كانت متوفرة في النظام

2. **نطاق الخدمة**:
   - لا تذكر أي خدمات خارج صلالة
   - لا تقارن بمنافسين آخرين
   - لا تقدم وعوداً غير قابلة للتنفيذ

3. **التعامل مع الوسائط**:
   - لا ترسل أكثر من 3 صور في رد واحد
   - تأكد من أن المطلوب يحتاج فعلاً لوسائط قبل الإرسال
   - لا ترسل وسائط للأسئلة العامة

4. **التعامل مع الأسئلة الصعبة**:
   - إذا تجاوز السؤال نطاقك:
     "لهذا الاستفسار الدقيق، تواصل مباشرة مع مدير الحجوزات على الرقم: +968 98590405"
     "لمزيد من التفاصيل، زور موقعنا: www.nassayem.com"

## توجيهات إضافية
1. **موسم الخريف**:
   - ركز على أن الحجوزات اليومية فقط متاحة
   - ذكر أن العروض الشهرية تبدأ بعد الخريف
   - شجع على الحجز المبكر: "الوحدات محدودة في الخريف، احجز الآن لتضمن تواريخك المفضلة"

2. **تأكيد المعلومات**:
   - عند تلقي طلب حجز، كرر المعلومات:
     "خليني أتأكد: تريد شقة بغرفتين في السعادة من 15 إلى 20 سبتمبر لـ 4 أشخاص، صح؟"

3. **إغلاق المبيعات**:
   - أنهي المحادثة بدعوة للعمل:
     "هل تحب تحجز الآن ولا تفضل استشارة أولاً؟"
     "نحن جاهزين لتأكيد حجزك فورًا"

## معلومات العميل
العميل: ${customerName || "عميلنا الكريم"}`.trim(),
        },
        ...conversationHistory.slice(-6).filter((msg) => msg.content),
        {
          role: "user",
          content: sanitizedMessage,
        },
      ].filter((msg) => msg.content),
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = response.choices[0]?.message?.content;
    console.log("[OPENAI] aiResponse: ", aiResponse);

    if (!aiResponse) {
      console.error("Empty response from OpenAI", { response });
      return new Response(JSON.stringify({ error: "Empty response from AI" }), {
        status: 500,
      });
    }
    const cleanedResponse = await handleMediaResponse(waId, aiResponse);
    console.log("[OPENAI] cleanedResponse: ", cleanedResponse);

    if (cleanedResponse !== aiResponse) {
      // Media was sent, no need to send text if empty
      if (cleanedResponse) {
        // Send response via WhatsApp
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: waId,
            message: cleanedResponse,
            senderType: "bot", // Add this parameter
          }),
        });
      }
    } else {
      // Send response via WhatsApp
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: waId,
          message: aiResponse,
          senderType: "bot", // Add this parameter
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, response: aiResponse }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("OpenAI API error details:", {
      message: error.message,
      status: error.status,
      response: error.response?.data,
      stack: error.stack,
      // Safely handle variables that might not exist
      waId: waId || "undefined",
      message: message || "undefined",
      sanitizedMessage: message?.toString().trim() || "undefined",
    });

    return new Response(
      JSON.stringify({
        error: "Error processing request",
        details: error.message,
        requestData: {
          // For debugging
          waId: waId || "n/a",
          message: sanitizedMessage,
          message: message || "n/a",
          sanitizedMessage: message?.toString().trim() || "n/a",
          conversationHistory: conversationHistory.map((m) => ({
            role: m.role,
            content: m.content?.length || 0,
          })),
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Add this function to handle media responses
const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g; // Match Markdown images

async function handleMediaResponse(waId, responseText) {
  const matches = [...responseText.matchAll(imageRegex)];
  let cleanedText = responseText;

  for (const [index, match] of matches.entries()) {
    const imagePath = match[1];
    const absoluteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${imagePath}`;
    const caption = getCaptionFromPath(imagePath);

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: waId,
        senderType: "bot",
        media: {
          type: "image",
          url: absoluteUrl,
          caption: caption,
        },
      }),
    });

    cleanedText = cleanedText.replace(match[0], "").trim();

    // Add 1s delay between images
    if (index < matches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Handle location requests
  const locationRegex = /<LOCATION:([^>]+)>/g;
  const locationMatches = [...responseText.matchAll(locationRegex)];

  for (const match of locationMatches) {
    const buildingId = match[1];
    const building = buildingInfo[buildingId];

    if (building) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: waId,
          senderType: "bot",
          media: {
            type: "location",
            latitude: building.location.latitude,
            longitude: building.location.longitude,
            name: building.name,
            address: building.location.address,
          },
        }),
      });
    }

    cleanedText = cleanedText.replace(match[0], "").trim();
  }

  // Handle contact requests
  const contactRegex = /<CONTACT:([^:]+):(\w+)>/g;
  const contactMatches = [...responseText.matchAll(contactRegex)];

  for (const match of contactMatches) {
    const [fullMatch, buildingId, contactType] = match;
    const building = buildingInfo[buildingId];

    if (building && building.contacts[contactType]) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: waId,
          senderType: "bot",
          media: {
            type: "contact",
            contact: {
              name:
                contactType === "call_center" ? "Call Center" : "Receptionist",
              phone: building.contacts[contactType],
            },
          },
        }),
      });
    }

    cleanedText = cleanedText.replace(fullMatch, "").trim();
  }

  return cleanedText;
}
