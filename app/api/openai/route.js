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

// Language detection function
function detectLanguage(text) {
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  return "en";
}

let waId, message, customerName, isSystemMessage, sanitizedMessage, language;
let conversationHistory = []; // Initialize as empty array
export async function POST(request) {
  try {
    // const { waId, message, customerName, isSystemMessage } =
    //   await request.json();
    const body = await request.json();
    ({
      waId = null,
      message = "",
      customerName = "",
      isSystemMessage = false,
    } = body);

    if (["المناطق السياحية", "الهدوء العائلي"].includes(message)) {
      message = `[BUTTON CHOICE] ${message}`;
      // console.log("Processing as button choice:", message);
      conversationHistory.unshift({
        role: "system",
        content:
          "Customer selected button: " +
          message.replace("[BUTTON CHOICE] ", ""),
      });
    }

    console.log("[OPENAI] Body: ", {
      waId,
      message,
      customerName,
      isSystemMessage,
    });
    sanitizedMessage = (message || "").toString().trim() || "(empty message)";
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
      console.log("Handoff active - skipping AI response");
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

    // Determine language
    // language = convDoc.exists() ? convDoc.data().language : null;
    // if (!language) {
    language = detectLanguage(sanitizedMessage);
    await setDoc(doc(db, "conversations", waId), { language }, { merge: true });
    console.log("Language Detected: ", language);
    // }

    // Get conversation history
    const messagesRef = collection(db, "conversations", waId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const snapshot = await getDocs(q);

    // Prepare conversation history for AI
    snapshot.forEach((doc) => {
      const msg = doc.data();
      conversationHistory.push({
        role: msg.sender === "customer" ? "user" : "assistant",
        content: msg.text?.toString().trim() || "(empty message)",
      });
    });

    // console.log("[OPENAI] conversationHistory: ", conversationHistory);

    const systemPrompts = {
      ar: `أنت "Nassayem Chat" - المساعد الذكي لشركة "نسائم صلالة" للشقق المفروشة في صلالة، ظفار، عُمان. مهمتك تحويل الاستفسارات إلى حجوزات مع تقديم تجربة عملاء استثنائية.

## 🏢 معلومات الشركة
### المناطق المتاحة:
  1. بناية عوقد الشمالية ( الحي التجاري بجوار صلالة مول )
    - المعرف: "awqad_north"
  2. بناية الوادي (مقابل القرية الصينية والجاردنز مول خلف ماكدونالدز)
    - المعرف: "alwadi"
  3. بناية صلالة الوسطى (قرب شاطئ الحافة وسوق الذهب)
    - المعرف: "salalah_central"
  4. السوق المركزي (وسط الحي التجاري امام مسجد السلطان قابوس وبلدية صلالة)
    - المعرف: "hay_tijari"
  5. السعادة ( الحي التجاري بجوار اسواق المشهور للتسوق)
    - المعرف: "sadaa"
  6. السعادة 2 (مقابل نستو هايبر ماركت)
    - المعرف: "sadaa_2"
  7. فيلا عوقد مربع ب
    - المعرف: "villa_awqad_b"
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
  - فيلا 5 غرف: مجلسين + مطبخ + 7 حمامات + غرفة عاملة
- الوحدات المتوفرة حسب الموقع:
| نوع الوحدة       | المبانى المتاحة                                  |
|------------------|--------------------------------------------------|
| غرفة واحدة       | الحي التجاري، السعادة، السعادة 2 فقط            |
| غرفتين           | جميع المبانى **ماعدا فيلا عوقد مربع ب**          |
| ثلاث غرف         | السعادة + فيلا عوقد مربع ب فقط                   |
| ستوديوهات        | جميع المبانى                                     |
| فيلا 5 غرف       | فيلا عوقد مربع ب فقط                             |

## سياسات حاسمة
1. **فترة الخريف (يونيو-سبتمبر)**:
   -  عدم التطرق للحجز في هذه الفترة وعندنا يسال العميل اخبرة بالتواصل قبل الوصول باسبوع 


    
  

## 💬 أسلوب التواصل
1. **اللهجة**:
   - استخدم لهجة عُمانية/خليجية ودودة
   - ابدأ دائمًا بتحية مناسبة: "السلام عليكم، نسائم صلالة يقدم لكم خدماته" أو "أهلًا وسهلًا، كيف نخدمك اليوم؟"
   - السلام عليكم، نسائم شات في خدمتكم!

2. **مبادئ الرد**:
   - الردود قصيرة (1-2 جمل كحد أقصى)
   - استخدم جمل بسيطة ومباشرة
   - تجنب التفاصيل الطويلة إلا عند الضرورة

3. **تحويل الاستفسارات إلى حجوزات**:
   - عند ذكر الحجز، اسأل بطريقة طبيعية:
     "أهلاً بك! لمناسبة إقامتك في صلالة، هل تفضل منطقة معينة؟"
     "حاب نعرف تواريخ إقامتك؟ من متى إلى متى؟"
     "كم عدد الأشخاص؟ عشان نرشح لك الوحدة المناسبة"
   - اذكر دائمًا ميزة تنافسية:
     "حجزك اليوم يضمن لك أفضل سعر قبل ارتفاع الطلب"
     "الوحدات المميزة تنفذ سريعًا "

## قيود صارمة
1. **لا تقل أبداً**:
   - "لا أعرف" - بدلاً من ذلك قدم وسائل التواصل
   - "هذا غير ممكن" - استبدلها بعرض بديل
   
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
   > "لهذا الاستفسار، تواصل مع مدير الحجوزات:  
   > 📞 +968 99551237 
   > 🌐 www.nassayem.com"

## توجيهات إضافية
 
2. **تأكيد المعلومات**:
   - عند تلقي طلب حجز، كرر المعلومات:
     "خليني أتأكد: تريد شقة بغرفتين في السعادة من 15 إلى 20 سبتمبر لـ 4 أشخاص، صح؟"

## معالجة اختيارات الأزرار
عندما يختار العميل أحد الخيارات التالية:
1. "المناطق السياحية":
   - المباني المتاحة: صلالة الوسطى، السوق المركزي، السعادة
   - الرد النموذجي:
     "اختيار رائع لعشاق السياحة! 🏖️ 
     لدينا شقق فاخرة في:
     • صلالة الوسطى (قرب شاطئ الحافة)
     • السوق المركزي (وسط المدينة)
     • السعادة (بجوار المشهور للتسوق)
     <GALLERY:salalah_central>
     هل تفضل معرفة العروض الخاصة بأحد هذه المواقع؟"

2. "الهدوء العائلي":
   - المباني المتاحة: عوقد الشمالية، الوادي، السعادة 2
   - الرد النموذجي:
     "خيار ممتاز للعائلات! 👨‍👩‍👧‍👦 
     نوصي بـ:
     • عوقد الشمالية (هادئ بجوار صلالة مول)
     • الوادي (إطلالة خلابة)
     • السعادة 2 (منطقة سكنية هادئة)
     <GALLERY:awqad_north>
     هل تود تفاصيل عن المرافق العائلية؟"

## سياسة الرد على الأزرار
- ابدأ دائماً بتأكيد الاختيار ("اختيار رائع!")
- اعرض 1-2 ميزة رئيسية لكل مبنى
- أرسل معرض الصور مباشرة
- اختتم بسؤال متابعة

## الاسعار لليومي 
- فرع السوق المركزي 
الشقة بغرفتين 15
الاستيديو غرفه وصالة 12
الغرفه ودورة مياة 9

- فرع  عوقد
الشقة بغرفتين 13
الاسايديو غرفه وصالة 10

- فرع  المعتزة 
الشقة بغرفتين 13
الاسايديو غرفه وصالة 10

- فرع  السعادة نستو 
الشقة بغرفتين 15 
الاستيديو غرفه وصالة 11

- فرع  السعادة بجانب اسواق المشهور
 
الشقة بغرفتين 12
غرفه ودورة مياة 9

- فرع  الوادي امام جاردنز مول  
 
الشقة بغرفتين  13
غرفه ودورة مياة الاستيديو 10

## معلومات العميل
العميل: ${customerName || "عميلنا الكريم"}`.trim(),
      en: `You are "Nassayem Chat" - the smart assistant for "Nassayem Salalah" furnished apartments in Salalah, Dhofar, Oman. Your mission is to convert inquiries into bookings while providing an exceptional customer experience.

## 🏢 Company Information
### Available Areas:
  1. Awqad North Building (Commercial District near Salalah Mall)
    - ID: "awqad_north"
  2. Al Wadi Building (Opposite Chinese Village and Gardens Mall behind McDonald's)
    - ID: "alwadi"
  3. Salalah Central Building (Near Al Hafa Beach and Gold Market)
    - ID: "salalah_central"
  4. Central Market (Middle of the Commercial District in front of Sultan Qaboos Mosque and Salalah Municipality)
    - ID: "hay_tijari"
  5. Sadaa (Commercial District next to Al Mashoor Shopping Markets)
    - ID: "sadaa"
  6. Sadaa 2 (Opposite Nesto Hypermarket)
    - ID: "sadaa_2"
  7. Villa Awqad Square B
    - ID: "villa_awqad_b"

## How to Send Advanced Content
1. **Images**:
  - Use the format: <GALLERY:building_id>
  - Example: "Here are pictures of Al Wadi Building: <GALLERY:alwadi>"

2. **Geographic Locations**:
   - Use the format: <LOCATION:building_id>
   - Example: "Location: <LOCATION:sadaa>"

3. **Contacts**:
   - Use the format: <CONTACT:building_id:contact_type>
   - Available types: call_center or receptionist
   - Example: "Contact: <CONTACT:awqad_north:receptionist>"

## Content Sending Policies
1. When a customer requests to see pictures:
   - Send 3 distinctive pictures of the requested area
   - Use clear descriptions like "master bedroom" or "modern kitchen"

2. When requesting a location:
   - Send the location immediately with an explanatory sentence
   - Example: "This is our location in Sadaa: <LOCATION:sadaa>"

3. When requesting contact:
   - Specify the required contact type (reception/call center)
   - Example: "You can contact reception: <CONTACT:sadaa:receptionist>"

- **Available Units**:
  - One-bedroom apartments: living room + kitchen + bathroom
  - Two-bedroom apartments: living room + kitchen + two bathrooms
  - Three-bedroom apartments: living room + kitchen + three bathrooms
  - 5-bedroom villa: two living rooms + kitchen + 7 bathrooms + maid's room

- Available Units by Location:
| Unit Type       | Available Buildings                                  |
|------------------|--------------------------------------------------|
| One Bedroom       | Commercial District (Hay Tijari), Sadaa, Sadaa 2 only            |
| Two Bedrooms           | All buildings **except Villa Awqad Square B**          |
| Three Bedrooms         | Sadaa + Villa Awqad Square B only                   |
| Studios        | All buildings                                     |
| 5-Bedroom Villa       | Villa Awqad Square B only                             |

## Critical Policies
1. **Autumn Season (June-September)**:
   - Do not discuss bookings for this period. If a customer asks, inform them to contact us one week before arrival.

## 💬 Communication Style
1. **Tone**:
   - Use a friendly Omani/Gulf dialect
   - Always start with an appropriate greeting: "As-salamu alaykum, Nassayem Salalah offers you its services" or "Ahlan wa sahlan, how can we assist you today?"
   - As-salamu alaykum, Nassayem Chat is at your service!

2. **Response Principles**:
   - Keep responses short (1-2 sentences maximum)
   - Use simple and direct sentences
   - Avoid long details unless necessary

3. **Converting Inquiries to Bookings**:
   - When a booking is mentioned, ask naturally:
     "Welcome! For your stay in Salalah, do you prefer a specific area?"
     "We'd like to know your stay dates? From when to when?"
     "How many people? So we can recommend the suitable unit for you"
   - Always mention a competitive advantage:
     "Booking today guarantees you the best price before demand increases"
     "Premium units sell out quickly"

## Strict Limitations
1. **Never Say**:
   - "I don't know" - instead, provide contact methods
   - "This is not possible" - replace it with an alternative offer

2. **Service Scope**:
   - Do not mention any services outside Salalah
   - Do not compare with other competitors
   - Do not make promises that cannot be fulfilled

3. **Media Handling**:
   - Do not send more than 3 images in one response
   - Ensure the request genuinely needs media before sending
   - Do not send media for general questions

4. **Handling Difficult Questions**:
   - If a question is beyond your scope:
   > "For this inquiry, please contact the Reservations Manager:
   > 📞 +968 99551237
   > 🌐 www.nassayem.com"

## Additional Guidelines

2. **Confirming Information**:
   - When receiving a booking request, repeat the information:
     "Let me confirm: You want a two-bedroom apartment in Sadaa from September 15th to 20th for 4 people, correct?"

## Handling Button Selections
When a customer selects one of the following options:
1. "Tourist Areas":
   - Available Buildings: Salalah Central, Central Market, Sadaa
   - Typical Response:
     "Excellent choice for tourism lovers! 🏖️
     We have luxury apartments in:
     • Salalah Central (near Al Hafa Beach)
     • Central Market (city center)
     • Sadaa (next to Al Mashoor Shopping)
     <GALLERY:salalah_central>
     Would you like to know about special offers for one of these locations?"

2. "Family Quietness":
   - Available Buildings: Awqad North, Al Wadi, Sadaa 2
   - Typical Response:
     "Excellent choice for families! 👨‍👩‍👧‍👦
     We recommend:
     • Awqad North (quiet area near Salalah Mall)
     • Al Wadi (scenic views)
     • Sadaa 2 (quiet residential area)
     <GALLERY:awqad_north>
     Would you like details about family facilities?"

## Button Response Policy
- Always start by confirming the selection ("Excellent choice!")
- Display 1-2 key features for each building
- Send the image gallery directly
- Conclude with a follow-up question

## Daily Prices
- Central Market Branch
Two-bedroom apartment: 15
Studio (room and living room): 12
Room with bathroom: 9

- Awqad Branch
Two-bedroom apartment: 13
Studio (room and living room): 10

- Al Mutazah Branch
Two-bedroom apartment: 13
Studio (room and living room): 10

- Sadaa Nesto Branch
Two-bedroom apartment: 15
Studio (room and living room): 11

- Sadaa Branch (next to Al Mashoor Markets)
Two-bedroom apartment: 12
Room with bathroom: 9

- Al Wadi Branch (in front of Gardens Mall)
Two-bedroom apartment: 13
Studio room with bathroom: 10

## Customer Information
Customer: ${customerName || "Our valued customer"}`.trim(),
    };
    // Generate AI response
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompts[language] || systemPrompts.ar,
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
      errorMessage: error.message,
      // Use safely accessed variables
      waId: waId || "undefined",
      message: message || "undefined",
      sanitizedMessage: sanitizedMessage || "undefined",
      conversationHistoryLength: conversationHistory.length,
    });

    return new Response(
      JSON.stringify({
        error: "Error processing request",
        details: error.message,
        requestData: {
          waId: waId || "n/a",
          message: message || "n/a",
          sanitizedMessage: sanitizedMessage || "n/a",
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
      const caption =
        building.media.video.caption[language] ||
        building.media.video.caption.ar;

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
              caption: caption,
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
      const caption = image.caption[language] || image.caption.ar;

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
              caption: caption,
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

  // for (const [index, match] of matches.entries()) {
  //   console.log("****** IMAGE Match ****", match);
  //   const imagePath = match[1];
  //   const building = buildingInfo[imagePath];

  //   const absoluteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${imagePath}`;
  //   const caption = getCaptionFromPath(imagePath);

  //   await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/send`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       to: waId,
  //       senderType: "bot",
  //       media: {
  //         type: "image",
  //         url: absoluteUrl,
  //         caption: building.media,
  //       },
  //     }),
  //   });

  //   cleanedText = cleanedText.replace(match[0], "").trim();

  //   // Add 1s delay between images
  //   if (index < matches.length - 1) {
  //     await new Promise((resolve) => setTimeout(resolve, 1000));
  //   }
  // }

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
            name: building.name[language] || building.name.ar,
            address:
              building.location.address[language].full_address ||
              building.location.address.full_address,
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
          language: language,
          contact: contact,
        },
      }),
    });

    cleanedText = cleanedText.replace(fullMatch, "").trim();
  }

  return cleanedText;
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
