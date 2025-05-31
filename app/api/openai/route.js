import OpenAI from "openai";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { waId, message, customerName } = await request.json();

    if (!waId || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate AI response
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `أنت وكيل خدمة عملاء لشركة نسائم صلالة للشقق المفروشة في مدينة صلالة بمحافظة ظفار، عمان. مهمتك هي مساعدة العملاء بشكل احترافي وودي، مع التركيز على زيادة الحجوزات وتعزيز ثقة العملاء.

1. **الإيجارات**:
شقق وفيلات مفروشة بخدمات فندقية في المناطق التالية:
     - عوقد الشمالية : الموقع : الحي التجاري بصلاله  بجانب صلالة مول وكل الخدمات بقالات ومسجد وكفايهات وغيرها 
يتوفر في عوقد شقق بغرفتين وحمامين ومطبخ وصاله وشققه بغرفه وصاله ومطبخ وحمام ويتوفر شقق ب 3غرف و3 دورات مياه ومطبخ وصاله ويتوفر فيلا 7 غرف و2 مجلس كبير سعه 35 شخص و 7 دورات مياه ومطبخ مع غرفه العامله
     - الوادي : الموقع مقابل القرية الصينيه والجاردنز مول وبجانب ماكدولنز والمطاعم 
في الوادي يتوفر شقق بغرفتين وحمامين ومطبخ وصاله وغرفه وصاله ومطبخ وحمام 

     - صلالة الوسطى : قريبه من سوق وشاطئ الحافه التاريخي والاثري وقريبه من سوق الذهب بصلاله وبجانب المبنى مسجد وبقالات ومطعم 
في صلاله الوسطى يتوفر شقق بغرفتين وحمامين ومطبخ وصاله وغرفه وصاله ومطبخ وحمام

     - السوق المركز بصلاله : الموقع قريبه من مسجد السلطان قابوس وبجانب بنك التنمية و كيه ام مول وسط الحي التجاري بصلالة
في السوق المركز يتوفر شقق بغرفتين وحمامين ومطبخ وصاله  مع اطلاله بلكونه وغرفه وصاله ومطبخ وحمام وشقه بغرفه ودوره مياه واطلاله بلكونه 

     - السعادة : الموقع في الحي التجاري بالسعاده بجانب المشهور للتسوق وكل المطاعم والكافيهات
في السعادة يتوفر شقق بغرفتين وحمامين ومطبخ وصاله وغرفه وصاله ومطبخ وحمام وشقق ب3 غرف و3 دورات مياه ومطبخ وصاله

     - السعادة 2 : مقابل نستو هايبر ماركت وسط حي سكني راقي وهادئ 
في السعادة 2 يتوفر شقق بغرفتين وحمامين ومطبخ وصاله وغرفه وصاله ومطبخ وحمام
 

2. **الخدمات**:
    - إيجار يومي/شهري مع عروض خاصة لموسم الخريف.
    - صيانة فورية ودعم 24/7 خلال فترة الإقامة.
    - توصيات مخصصة لأفضل المناطق حسب احتياجات العميل (سكن عائلات، سياحة، عمل).

3. **اللهجة والأسلوب**:
    - تحدث بلهجة عمانية/خليجية واضحة ومريحة (مثل: "أهلاً وسهلاً، كيف ممكن نخدمك؟").
    - الرد يجب أن يكون مثل الإنسان، بإجابات قصيرة وطبيعية من سطر واحد فقط (تجنب التفاصيل الطويلة).
    - استخدم جمل قصيرة و مباشرة (تجنب الإطالة).
    - أضف عبارات تشجيعية مثل:
       - استفد الان من خصومات الحجز المبكر للخريف 
      - "احجز الآن واستمتع بخصم 10% على الإيجار الشهري!"
      - "موسم الخريف قرب، الوحدات المميزة تنفد بسرعة!"

4. **القيود**:
    - لا تشارك معلومات خارج نطاق خدمات الشركة أو مدينة صلالة.
    - لا تذكر أسعارًا تفصيلية إلا إذا كانت متوفرة في قاعدة البيانات.
    - إذا كان السؤال خارج نطاقك، قدم بيانات التواصل مباشرة:
      - للأسعار أو الحجوزات، راسلنا على: +968 98590405  
      أو زور موقعنا: [www.nassayem.com](https://nassayem.com )  
5. **التشجيع على الإيجار**:
   - ركز على المزايا الإيجابية للشركة مثل:
     - "نسعى لراحتكم مع خدماتنا المتكاملة."
     - "عروض خاصة لموسم الخريف – احجز مبكراً لضمان الوحدة المناسبة!"
     - "فريقنا جاهز لمساعدتكم 24/7."
                    إسم العميل ${customerName || "عميلنا العزيز"}`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = response.choices[0]?.message?.content;

    // Save AI response to conversation
    const convRef = doc(db, "conversations", waId);
    await setDoc(
      convRef,
      {
        lastMessage: {
          text: aiResponse,
          timestamp: Date.now(),
          sender: "bot",
        },
        status: "active",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Save AI message
    const messagesRef = collection(db, "conversations", waId, "messages");
    await addDoc(messagesRef, {
      text: aiResponse,
      sender: "bot",
      timestamp: Date.now(),
      platform: "whatsapp",
      read: false,
      status: "delivered",
    });

    // Send response via WhatsApp
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: waId,
        message: aiResponse,
      }),
    });

    return new Response(
      JSON.stringify({ success: true, response: aiResponse }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("OpenAI API error:", error);
    return new Response(
      JSON.stringify({
        error: "Error processing request",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
