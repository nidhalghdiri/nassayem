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

    // console.log("[OPENAI] conversationHistory: ", conversationHistory);

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
  1. بناية عوقد الشمالية (بجوار صلالة مول)
    - المعرف: "awqad_north"
    - الوصف: تقع بناية عوقد الشمالية في موقع استراتيجي بجانب صلالة مول، وتوفر إطلالة خلابة على المدينة مع سهولة الوصول إلى المطاعم، المقاهي، والمراكز التجارية الكبرى مثل لولو هايبرماركت. تُعتبر وجهة مثالية للإقامة القصيرة والطويلة في صلالة.
  2. بناية الوادي (مقابل القرية الصينية والجاردنز مول)
    - المعرف: "alwadi"
    - الوصف: موجودة في شارع مرباط وسط المدينة مقابل القرية الصينية والجاردنز مول، قريبة من المطاعم والكافيهات وكل المحالات التجارية مثل لولو هايبرماركت وماكدونالدز. موقع استراتيجي يوفر لك سهولة الوصول إلى أماكن التسوق والمطاعم الشهيرة في صلالة.
  3. بناية صلالة الوسطى (قرب شاطئ الحافة وسوق الذهب)
    - المعرف: "salalah_central"
    - الوصف: تقع بناية صلالة الوسطى في قلب المدينة، بالقرب من شاطئ الحافة الخلاب وسوق الذهب الشهير. تُعتبر وجهة مثالية للباحثين عن الإقامة الفاخرة مع سهولة الوصول إلى أماكن الجذب السياحي والتجارية مثل المطاعم الراقية، المقاهي العصرية، والمراكز التجارية الكبرى.
  4. السوق المركزي (وسط الحي التجاري)
    - المعرف: "hay_tijari"
    - الوصف: تقع بناية السوق المركزي في وسط الحي التجاري، بالقرب من أماكن التسوق والخدمات الأساسية مثل لولو هايبرماركت ونستو هايبرماركت. تُعتبر وجهة مثالية للإقامة القريبة من الخدمات اليومية.
  5. السعادة (بجوار المشهور للتسوق)
    - المعرف: "sadaa"
    - الوصف : تقع بناية السعادة في موقع متميز بجانب متجر المشهور للتسوق، مما يوفر سهولة الوصول إلى الأسواق والمطاعم والمقاهي. تُعتبر خيارًا مثاليًا للإقامة القصيرة أو الطويلة مع تصميمات داخلية عصرية ومرافق متكاملة.
  6. السعادة 2 (مقابل نستو هايبر ماركت)
    - المعرف: "sadaa_2"
    - الوصف: تقع بناية السعادة 2 في موقع استراتيجي مقابل نستو هايبرماركت، قريبة من المطاعم والمقاهي والمراكز التجارية الكبرى. تُعتبر وجهة مثالية للإقامة القصيرة والطويلة في صلالة.
## كيفية إرسال المحتوى المتقدم
1. **الصور**:
  - استخدم الصيغة: <GALLERY:معرف_المبنى>
  - مثال: "ها هي صور بناية الوادي: <GALLERY:alwadi>"

2. **المواقع الجغرافية**:
   - استخدم الصيغة: <LOCATION:معرف_المبنى>
   - مثال: "الموقع: <LOCATION:sadaa>"

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
   - مثال: "هذا موقعنا في السعادة: <LOCATION:sadaa>"

3. عند طلب الاتصال:
   - حدد نوع الاتصال المطلوب (استقبال/مركز اتصال)
   - مثال: "يمكنك الاتصال بالاستقبال: <CONTACT:sadaa:receptionist>"
- **الوحدات المتوفرة**:
  - شقق بغرفة واحدة: صالة + مطبخ + حمام
  - شقق بغرفتين: صالة + مطبخ + حمامين
  - شقق بثلاث غرف: صالة + مطبخ + ثلاثة حمامات
  - فيلا 7 غرف: مجلسين + مطبخ + 7 حمامات + غرفة عاملة

## تدفق عملية الحجز
1. عند التعبير عن الرغبة في الحجز:
   - اسأل أولاً: "كم عدد الأشخاص؟"
   - ثم اسأل: "ما هي تواريخ إقامتك؟ (من فضلك اكتبها بالصيغة: من 2025-09-01 إلى 2025-09-05)"
   - ثم اسأل: "أي منطقة تفضل؟ [اذكر المناطق المتاحة]"
   -  "كم السعر لشقة بغرفتين في السوق المركزي من 10 إلى 15 سبتمبر؟"
     → "<PRICE_CHECK:hay_tijari:2_rooms:2025-09-10:2025-09-15>"

  - "أريد حجز شقة لـ 4 أشخاص"
   → "<RESERVATION_START>"
2. عند طلب السعر:
   - استخدم الوسم <PRICE_CHECK> فقط بعد معرفة:
       * نوع الوحدة (بناءً على عدد الأشخاص)
       * المبنى
       * التواريخ الدقيقة
   - مثال: "السعر سيكون: <PRICE_CHECK:sadaa:2_rooms:2025-09-10:2025-09-15>"
3. بعد اكتمال المعلومات:
   - أرسل تأكيداً: "خليني أتأكد: تريد شقة بغرفتين في السعادة من 10 إلى 15 سبتمبر لـ 4 أشخاص، صحيح؟"
   - ثم قدم خيار الحجز: "هل ترغب بتأكيد الحجز الآن؟"

مثال:
"هل يوجد شقة بثلاث غرف في السعادة؟"
→ "<UNIT_CHECK:sadaa:3_rooms>"

"أبغى أعرف إذا كانت متاحة من 15 إلى 20 سبتمبر؟"
→ "<DATE_CHECK:2025-09-15:2025-09-20>"

"كم السعر لشقة بغرفتين في السوق المركزي من 10 إلى 15 سبتمبر؟"
→ "<PRICE_CHECK:hay_tijari:2_rooms:2025-09-10:2025-09-15>"
## توجيهات جديدة
1. **استخراج المعلومات التلقائي**:
   - استخرج التواريخ تلقائياً من أي صيغة يذكرها العميل (مثال: "1 يوليو" → "2025-07-01")
   - تعرف على أسماء الأشهر العربية والإنجليزية
   - افترض السنة الحالية إذا لم يُذكر سنة محددة

2. **تتبع السياق**:
   - تذكر المعلومات السابقة من المحادثة (عدد الأشخاص، التواريخ، المنطقة)
   - أعد استخدام المعلومات التي قدمها العميل مسبقاً
   - لا تسأل عن معلومات سبق للعميل تقديمها

3. **تدفق الحجز الذكي**:
   - عند بدء حجز جديد، استخدم المعلومات الموجودة مباشرة
   - إذا نقصت معلومة واحدة فقط، اسأل عنها فقط
   - أعد صياغة تواريخ العميل تلقائياً للصيغة YYYY-MM-DD

4. **التحقق من الوحدات**:
   - عند سؤال عن غرف في مبنى معين: استخدم <UNIT_CHECK:معرف_المبنى:نوع_الوحدة>
     مثال: "هل يوجد شقة بثلاث غرف في السعادة؟" → "<UNIT_CHECK:sadaa:3_rooms>"
   - إذا لم يتوفر النوع في المبنى:
     • اقترح مباني أخرى بها هذا النوع
     • استخدم: <BUILDING_SUGGESTION:نوع_الوحدة>

5. **فحص التوفر**:
   - استخدم <AVAILABILITY_CHECK:نوع_الوحدة:تاريخ_البدء:تاريخ_الانتهاء> 
     عند وجود نوع الوحدة والفترة

6. **الأسعار**:
   - استخدم <PRICE_CHECK> فقط عند توفر:
     • المبنى
     • نوع الوحدة
     • الفترة الكاملة
   - إذا نقصت معلومات، اطلبها تحديداً

7. **تذكر المعلومات**:
   - استخدم البيانات من تاريخ المحادثة فقط
   - لا تخزن البيانات الحساسة (الأشخاص، التواريخ) في قواعد البيانات
   - أعد استخدام المعلومات المقدمة مسبقاً دون إعادة السؤال
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

    console.log("[CHECK RES] AI Response: ", aiResponse);

    // Get current reservation state
    let reservationState = (await getReservationState(waId)) || {
      step: "inactive",
      people: null,
      dates: null,
      building: null,
      unitType: null,
      lastUpdated: Date.now(),
    };
    console.log("[CHECK RES] 1. Current reservationState: ", reservationState);

    // Handle new information extraction
    const extractedInfo = extractReservationInfo(
      sanitizedMessage,
      conversationHistory
    );
    if (extractedInfo) {
      reservationState = {
        ...reservationState,
        ...extractedInfo,
        lastUpdated: Date.now(),
      };
      await saveReservationState(waId, reservationState);
    }

    console.log("[CHECK RES] 2. Extracted Info: ", extractedInfo);

    let finalResponse = aiResponse;
    // Handle reservation flow
    if (reservationState.step !== "inactive") {
      const result = await handleReservationStep(
        reservationState,
        sanitizedMessage,
        waId,
        conversationHistory
      );
      console.log("[CHECK RES] 3. Handle reservationState: ", result);

      if (result.handled) {
        await saveReservationState(waId, result.newState);
        // Send response if provided
        if (result.response) {
          finalResponse = result.response;
        }
      }
    }

    const cleanedResponse = await handleMediaResponse(waId, finalResponse);
    console.log("[OPENAI] cleanedResponse: ", cleanedResponse);
    if (cleanedResponse !== finalResponse) {
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
          message: finalResponse,
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
// 2. Add building-unit mapping
const buildingUnitTypes = {
  awqad_north: ["1_room", "2_rooms"],
  alwadi: ["1_room", "2_rooms", "3_rooms"],
  salalah_central: ["1_room", "2_rooms"],
  hay_tijari: ["1_room", "2_rooms", "3_rooms"],
  sadaa: ["1_room", "2_rooms"],
  sadaa_2: ["1_room", "2_rooms", "3_rooms"],
};
// Add this function to handle media responses

async function handleMediaResponse(waId, responseText) {
  let cleanedText = responseText;
  // const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g; // Match Markdown images
  const galleryRegex = /<GALLERY:([^>]+)>/g;
  const galleryMatches = [...cleanedText.matchAll(galleryRegex)];
  const processedBuildings = new Set(); // To track processed buildings

  for (const match of galleryMatches) {
    const buildingId = match[1];
    // Skip if already processed
    if (processedBuildings.has(buildingId)) {
      cleanedText = cleanedText.replace(match[0], "").trim();
      continue;
    }
    processedBuildings.add(buildingId); // Mark as processed

    const building = buildingInfo[buildingId];
    if (!building || !building.media || !building.media.gallery) {
      console.error(
        `Invalid or missing gallery data for building: ${buildingId}`
      );
      cleanedText = cleanedText.replace(match[0], "").trim();
      continue;
    }
    // Send video first
    if (building.media.video) {
      const videoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${building.media.video.url}`;

      if (building) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: waId,
            senderType: "bot",
            media: {
              type: "video",
              url: videoUrl,
              caption: building.media.video.caption,
            },
          }),
        });
      } else {
        console.error(`Missing Image data for building: ${buildingId}`, {
          hasBuilding: !!building,
          hasLocation: building?.media,
        });
      }
      await delay(1000); // Optional delay between video and images
    }
    // Send gallery images
    for (const [index, image] of building.media.gallery.entries()) {
      const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${image.url}`;

      if (building) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: waId,
            senderType: "bot",
            media: {
              type: "image",
              url: imageUrl,
              caption: image.caption,
            },
          }),
        });
      } else {
        console.error(`Missing Image data for building: ${buildingId}`, {
          hasBuilding: !!building,
          hasLocation: building?.media,
        });
      }

      if (index < building.media.gallery.length - 1) {
        await delay(1000); // Delay between images
      }
    }
    // Remove the gallery tag from the message
    cleanedText = cleanedText.replace(match[0], "").trim();
  }

  // Handle location requests
  const locationRegex = /<LOCATION:([^>]+)>/g;
  const locationMatches = [...responseText.matchAll(locationRegex)];
  console.log("Matched Locations => ", locationMatches);

  for (const match of locationMatches) {
    const buildingId = match[1];
    const building = buildingInfo[buildingId];
    console.log("Matched Locations buildingInfo => ", building);

    if (building) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: waId,
          senderType: "bot",
          media: {
            type: "location",
            latitude: Number(building.location.latitude),
            longitude: Number(building.location.longitude),
            name: building.name,
            address:
              building.location.address?.full_address ||
              building.location.address?.street ||
              "Location Address",
          },
        }),
      });
    } else {
      console.error(`Missing location data for building: ${buildingId}`, {
        hasBuilding: !!building,
        hasLocation: building?.location,
        lat: building?.location?.latitude,
        lng: building?.location?.longitude,
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
    if (!building) {
      throw new Error(`Building ${buildingId} not found`);
    }

    const contact = building.contacts?.[contactType];
    if (!contact) {
      throw new Error(
        `Contact type ${contactType} not found for ${buildingId}`
      );
    }
    const phone = contact.phones?.[0]?.phone || contact.phones?.[0]?.wa_id;
    if (!phone) {
      throw new Error(
        `Phone number missing for ${contactType} in ${buildingId}`
      );
    }

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: waId,
        senderType: "bot",
        media: {
          type: "contact",
          contact_type: contactType,
          contact: contact,
        },
      }),
    });

    cleanedText = cleanedText.replace(fullMatch, "").trim();
  }

  // UNIT_CHECK handler
  const unitCheckRegex = /<UNIT_CHECK:([^:]+):([^>]+)>/g;
  const unitMatches = [...cleanedText.matchAll(unitCheckRegex)];

  for (const match of unitMatches) {
    const [fullMatch, buildingId, unitType] = match;
    const building = buildingInfo[buildingId];

    if (building && buildingUnitTypes[buildingId]?.includes(unitType)) {
      cleanedText = cleanedText.replace(
        fullMatch,
        `نعم، ${building.name} تحتوي على شقق ${unitType.replace("_", " ")}`
      );
    } else {
      // Find alternative buildings
      const alternatives = Object.entries(buildingUnitTypes)
        .filter(([id, units]) => units.includes(unitType) && id !== buildingId)
        .map(([id]) => buildingInfo[id]?.name)
        .filter(Boolean);

      const suggestion = alternatives.length
        ? `لكن لدينا في: ${alternatives.join("، ")}`
        : "عذراً، لا توجد وحدات من هذا النوع في أي بناية";

      cleanedText = cleanedText.replace(
        fullMatch,
        `لا، ${
          building?.name || "هذه البناية"
        } لا تحتوي على هذا النوع. ${suggestion}`
      );
    }
  }

  // AVAILABILITY_CHECK handler
  const availabilityRegex = /<AVAILABILITY_CHECK:([^:]+):([^:]+):([^>]+)>/g;
  const availabilityMatches = [...cleanedText.matchAll(availabilityRegex)];

  for (const match of availabilityMatches) {
    const [fullMatch, unitType, startDate, endDate] = match;
    // In real implementation, call your availability API here
    const isAvailable = true; // Mock result

    cleanedText = cleanedText.replace(
      fullMatch,
      isAvailable
        ? "نعم، الوحدات متاحة في هذه الفترة"
        : "عذراً، لا توجد وحدات متاحة. هل تريد تواريخ بديلة؟"
    );
  }

  // PRICE_CHECK validation
  const priceCheckRegex = /<PRICE_CHECK:([^:]+):([^:]+):([^:]+):([^>]+)>/g;
  const priceMatches = [...cleanedText.matchAll(priceCheckRegex)];

  for (const match of priceMatches) {
    const [fullMatch, buildingId, unitType, startDate, endDate] = match;

    // Validate required parameters
    if (!buildingId || !unitType || !startDate || !endDate) {
      cleanedText = cleanedText.replace(
        fullMatch,
        "عذراً، أحتاج معرفة (المبنى، نوع الوحدة، والفترة) لحساب السعر"
      );
      continue;
    }

    // ... existing price check logic ...
  }

  return cleanedText;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// NEW: Comprehensive info extraction from natural language
function extractReservationInfo(message, history) {
  // const info = {};

  // // Extract people count
  // const peopleMatch = message.match(/(\d+)\s+(شخص|أشخاص|نفر|أفراد)/);
  // if (peopleMatch) info.people = parseInt(peopleMatch[1]);

  // // Extract dates with natural language parsing
  // const dateMatch = message.match(
  //   /(من\s*)?(\d{1,2}\s+[\u0600-\u06FF]+|\d{4}-\d{2}-\d{2})(\s*إلى\s*|\s*-\s*|\s*حتى\s*)(\d{1,2}\s+[\u0600-\u06FF]+|\d{4}-\d{2}-\d{2})/i
  // );
  // if (dateMatch) {
  //   const startDate = parseArabicDate(dateMatch[2]);
  //   const endDate = parseArabicDate(dateMatch[4]);
  //   if (startDate && endDate) {
  //     info.dates = {
  //       start: formatDate(startDate),
  //       end: formatDate(endDate),
  //     };
  //   }
  // }

  // // Extract building from message or history
  // const buildingKeywords = {
  //   عوقد: "awqad_north",
  //   وادي: "alwadi",
  //   وسطى: "salalah_central",
  //   سوق: "hay_tijari",
  //   سعادة: "sadaa",
  //   "سعادة 2": "sadaa_2",
  // };

  // for (const [keyword, id] of Object.entries(buildingKeywords)) {
  //   if (message.includes(keyword)) {
  //     info.building = id;
  //     break;
  //   }
  // }

  // // Fallback to history if not found in current message
  // if (!info.building) {
  //   for (const msg of [...history].reverse()) {
  //     for (const [keyword, id] of Object.entries(buildingKeywords)) {
  //       if (msg.content?.includes(keyword)) {
  //         info.building = id;
  //         break;
  //       }
  //     }
  //     if (info.building) break;
  //   }
  // }

  // // Derive unit type if people count is available
  // if (info.people) {
  //   info.unitType = getUnitType(info.people);
  // }

  // return Object.keys(info).length > 0 ? info : null;
  return null; // Disable info extraction
}
async function handleReservationStep(
  state,
  userMessage,
  waId,
  conversationHistory
) {
  if (state.lastUpdated < Date.now() - 30 * 60 * 1000) {
    // 30 minutes
    await clearReservationState(waId);
    return {
      handled: true,
      newState: { step: "inactive" },
      response: "انتهت جلسة الحجز. ابدأ من جديد إذا كنت ترغب بالحجز.",
    };
  }
  const nextState = { ...state, lastUpdated: Date.now() };
  let response = null;
  switch (state.step) {
    case "asking_people":
      if (state.people) {
        // People already extracted, move to next step
        nextState.step = "asking_dates";
        response =
          "تم التسجيل! متى تود الإقامة؟ (مثال: من 1 يوليو إلى 5 يوليو)";
      } else {
        const people = extractNumber(userMessage);
        if (people) {
          nextState.step = "asking_dates";
          nextState.people = people;
          nextState.unitType = getUnitType(people);
          response =
            "تم التسجيل! متى تود الإقامة؟ (مثال: من 1 يوليو إلى 5 يوليو)";
        } else {
          response = "عفواً، كم عدد الأشخاص؟";
        }
      }
      break;

    case "asking_dates":
      if (state.dates) {
        // Dates already extracted, move to next step
        nextState.step = "asking_building";
        response =
          "أي منطقة تفضل؟ عندنا: عوقد الشمالية، الوادي، صلالة الوسطى...";
      } else {
        const dates = extractDates(userMessage, conversationHistory);
        if (dates) {
          nextState.step = "asking_building";
          nextState.dates = dates;
          response =
            "أي منطقة تفضل؟ عندنا: عوقد الشمالية، الوادي، صلالة الوسطى...";
        } else {
          response = "من فضلك اكتب التواريخ (مثال: من 1 يوليو إلى 5 يوليو)";
        }
      }
      break;

    case "asking_building":
      const buildingId = extractBuildingId(userMessage);
      if (state.building) {
        // Building already extracted, move to confirmation
        nextState.step = "confirming";
        response = confirmationMessage(nextState);
      } else {
        const buildingId = extractBuildingId(userMessage, conversationHistory);
        if (buildingId) {
          nextState.step = "confirming";
          nextState.building = buildingId;
          response = confirmationMessage(nextState);
        } else {
          response = "عفواً، أي منطقة تفضل؟";
        }
      }
      break;

    case "confirming":
      if (userMessage.match(/(نعم|أؤكد|صح|موافق)/i)) {
        // ... create reservation logic ...
        await clearReservationState(waId);
        response = `تم الحجز بنجاح! 🎉
رقم الحجز: ${123}
للدفع: <CONTACT:${state.building}:receptionist>`;
      } else {
        await clearReservationState(waId);
        response = "تم إلغاء الحجز. هل يمكنني مساعدتك بأي شيء آخر؟";
      }
      break;

    default:
      if (userMessage.match(/حجز|أريد حجز|أرغب بالحجز/i)) {
        nextState.step = "asking_people";
        response = "كم عدد الأشخاص؟";
      }
  }
  if (response) {
    return {
      handled: true,
      newState: nextState,
      response,
    };
  }

  return { handled: false };
}

// NEW: Arabic date parser
function parseArabicDate(dateStr) {
  const months = {
    يناير: 0,
    فبراير: 1,
    مارس: 2,
    أبريل: 3,
    مايو: 4,
    يونيو: 5,
    يوليو: 6,
    أغسطس: 7,
    سبتمبر: 8,
    أكتوبر: 9,
    نوفمبر: 10,
    ديسمبر: 11,
    // English fallbacks
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };

  // Try ISO format first
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr);
  }

  // Try natural language format
  const match = dateStr.match(/(\d{1,2})\s+(\S+)/);
  if (match) {
    const day = parseInt(match[1]);
    const monthName = match[2].toLowerCase();
    const month = months[monthName];

    if (month !== undefined) {
      const now = new Date();
      const year = now.getFullYear();
      return new Date(year, month, day);
    }
  }

  return null;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Reservation state management
async function getReservationState(waId) {
  // const docRef = doc(db, "reservationStates", waId);
  // const docSnap = await getDoc(docRef);
  // return docSnap.exists() ? docSnap.data() : null;
  return { step: "inactive" }; // Always return inactive since we're not storing state
}

async function saveReservationState(waId, state) {
  await setDoc(doc(db, "reservationStates", waId), state);
}

async function clearReservationState(waId) {
  await setDoc(doc(db, "reservationStates", waId), { step: "inactive" });
}

// Add these helper functions
function extractNumber(text) {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

function extractDates(text) {
  const regex =
    /(\d{4}-\d{2}-\d{2})\s*إلى\s*(\d{4}-\d{2}-\d{2})|(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/;
  const match = text.match(regex);

  if (match) {
    // Handle both Arabic "to" and hyphen formats
    const start = match[1] || match[3];
    const end = match[2] || match[4];
    return { start, end };
  }
  return null;
}
function parseDatesFromText(text) {
  // ISO format
  const isoRegex = /(\d{4}-\d{2}-\d{2})\s*إلى\s*(\d{4}-\d{2}-\d{2})/;
  const isoMatch = text.match(isoRegex);
  if (isoMatch) return { start: isoMatch[1], end: isoMatch[2] };

  // Natural language format
  const naturalRegex = /(\d{1,2}\s+\S+)\s+إلى\s+(\d{1,2}\s+\S+)/;
  const naturalMatch = text.match(naturalRegex);
  if (naturalMatch) {
    const startDate = parseArabicDate(naturalMatch[1]);
    const endDate = parseArabicDate(naturalMatch[2]);
    if (startDate && endDate) {
      return {
        start: formatDate(startDate),
        end: formatDate(endDate),
      };
    }
  }

  return null;
}

function extractBuildingId(text) {
  const buildings = {
    عوقد: "awqad_north",
    وادي: "alwadi",
    وسطى: "salalah_central",
    سوق: "hay_tijari",
    سعادة: "sadaa",
    "سعادة 2": "sadaa_2",
  };

  for (const [keyword, id] of Object.entries(buildings)) {
    if (text.includes(keyword)) return id;
  }
  // Check conversation history
  for (const msg of [...history].reverse()) {
    if (msg.role === "user") {
      for (const [keyword, id] of Object.entries(buildingKeywords)) {
        if (msg.content?.includes(keyword)) return id;
      }
    }
  }

  return null;
}

function confirmationMessage(state) {
  return `هل هذا صحيح؟ 
عدد الأشخاص: ${state.people} 
التواريخ: من ${state.dates.start} إلى ${state.dates.end}
المنطقة: ${state.building}
السعر: <PRICE_CHECK:${state.building}:${state.unitType}:${state.dates.start}:${state.dates.end}>`;
}

function getUnitType(people) {
  if (people <= 2) return "1_room";
  if (people <= 4) return "2_rooms";
  if (people <= 6) return "3_rooms";
  return "7_room_villa";
}
