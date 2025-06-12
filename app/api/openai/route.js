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

    // Get current reservation state
    let reservationState = (await getReservationState(waId)) || {
      step: "inactive",
      people: null,
      dates: null,
      building: null,
      unitType: null,
    };

    // Check if AI is starting reservation
    if (
      aiResponse.includes("كم عدد الأشخاص") &&
      reservationState.step === "inactive"
    ) {
      reservationState = {
        step: "asking_people",
        people: null,
        dates: null,
        building: null,
        unitType: null,
      };
      await saveReservationState(waId, reservationState);
    }

    let finalResponse = aiResponse;
    // Handle reservation flow
    if (reservationState.step !== "inactive") {
      const result = await handleReservationStep(
        reservationState,
        sanitizedMessage,
        waId
      );
      if (result.handled) {
        await saveReservationState(waId, result.newState);
        // Send response if provided
        if (result.response) {
          finalResponse = result.response;
        }
        return new Response(
          JSON.stringify({ success: true, response: aiResponse }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
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

  // PRICE_CHECK handler
  const priceCheckRegex = /<PRICE_CHECK:([^:]+):([^:]+):([^:]+):([^>]+)>/g;
  const priceMatches = [...cleanedText.matchAll(priceCheckRegex)];

  for (const match of priceMatches) {
    const [fullMatch, buildingId, unitType, startDate, endDate] = match;

    try {
      // const price = await netsuiteApi.getPrice({
      //   building: buildingId,
      //   unitType,
      //   startDate,
      //   endDate,
      // });
      const price = 100;
      console.log("We try to get the price for : ", {
        building: buildingId,
        unitType,
        startDate,
        endDate,
      });

      if (price) {
        cleanedText = cleanedText.replace(
          fullMatch,
          `السعر: ${price} ريال عماني\nهل ترغب بتأكيد الحجز؟`
        );
      } else {
        cleanedText = cleanedText.replace(
          fullMatch,
          "عذراً، تعذر الحصول على السعر الآن. يرجى التواصل مع مدير الحجوزات: <CONTACT:awqad_north:call_center>"
        );
      }
    } catch (error) {
      cleanedText = cleanedText.replace(
        fullMatch,
        "حدث خطأ أثناء الحصول على السعر. يرجى المحاولة لاحقاً."
      );
    }
  }

  return cleanedText;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleReservationStep(state, userMessage, waId) {
  if (state.lastUpdated < Date.now() - 30 * 60 * 1000) {
    // 30 minutes
    await clearReservationState(waId);
    return {
      handled: true,
      newState: { step: "inactive" },
      response: "انتهت جلسة الحجز. ابدأ من جديد إذا كنت ترغب بالحجز.",
    };
  }
  switch (state.step) {
    case "asking_people":
      const people = extractNumber(userMessage);
      if (people) {
        return {
          handled: true,
          newState: {
            ...state,
            step: "asking_dates",
            people,
            unitType: getUnitType(people),
          },
          response:
            "تم التسجيل! متى تود الإقامة؟ (من فضلك اكتب: من YYYY-MM-DD إلى YYYY-MM-DD)",
        };
      }
      return {
        handled: true,
        newState: state,
        response: "عفواً، كم عدد الأشخاص؟",
      };

    case "asking_dates":
      const dates = extractDates(userMessage);
      if (dates) {
        return {
          handled: true,
          newState: {
            ...state,
            step: "asking_building",
            dates,
          },
          response:
            "أي منطقة تفضل؟ عندنا: عوقد الشمالية، الوادي، صلالة الوسطى...",
        };
      }
      return {
        handled: true,
        newState: state,
        response: "من فضلك اكتب التواريخ بالصيغة: من YYYY-MM-DD إلى YYYY-MM-DD",
      };

    case "asking_building":
      const buildingId = extractBuildingId(userMessage);
      if (buildingId) {
        return {
          handled: true,
          newState: {
            ...state,
            step: "confirming",
            building: buildingId,
          },
          response: `هل هذا صحيح؟ 
عدد الأشخاص: ${state.people} 
التواريخ: من ${state.dates.start} إلى ${state.dates.end}
المنطقة: ${buildingId}
السعر: <PRICE_CHECK:${buildingId}:${state.unitType}:${state.dates.start}:${state.dates.end}>`,
        };
      }
      return {
        handled: true,
        newState: state,
        response: "عفواً، أي منطقة تفضل؟",
      };

    case "confirming":
      if (userMessage.includes("نعم") || userMessage.includes("أؤكد")) {
        // Create reservation
        // const reservationId = await createReservation(state);
        console.log("createReservation = ", state);

        // Clear state
        await clearReservationState(waId);

        return {
          handled: true,
          newState: { step: "inactive" },
          response: `تم الحجز بنجاح! 🎉
رقم الحجز: ${123}
للدفع: <CONTACT:${state.building}:receptionist>`,
        };
      } else {
        // Clear state if user declines
        await clearReservationState(waId);
        return {
          handled: true,
          newState: { step: "inactive" },
          response: "تم إلغاء الحجز. هل يمكنني مساعدتك بأي شيء آخر؟",
        };
      }

    default:
      return { handled: false };
  }
}

// Reservation state management
async function getReservationState(waId) {
  const docRef = doc(db, "reservationStates", waId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
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
  return null;
}

function getUnitType(people) {
  if (people <= 2) return "1_room";
  if (people <= 4) return "2_rooms";
  if (people <= 6) return "3_rooms";
  return "7_room_villa";
}
