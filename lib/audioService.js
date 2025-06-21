import axios from "axios";
import FormData from "form-data"; // Use default import
import OpenAI from "openai";
import { uploadAudio } from "./cloudinary";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processAudioMessage(waId, audio) {
  try {
    // 1. Download audio from WhatsApp
    const mediaUrl = `https://graph.facebook.com/v18.0/${audio.id}`;
    const headers = {
      Authorization: `Bearer EAAQ8GvpD3gYBOyBjBiZBEceqkSAzoXdZBCRQxbREouAnL8DtG8wKwYvONH8pPwD5GLMCcYX24HLyQxkGAEKRQt0aarzh7SIA4xWSrS7CN0FEHwwAeNV6kzfA5UWxOQCdCHCECEF1vccf54LFPCxRo4yWYKZBBrLxP3DMiordKJ0yw3BL83vZAGdC20yeTrViqAZDZD`, // Use env variable
    };

    const mediaResponse = await axios.get(mediaUrl, { headers });
    const audioResponse = await axios.get(mediaResponse.data.url, {
      responseType: "arraybuffer",
      headers,
    });

    const buffer = Buffer.from(audioResponse.data);

    // 2. Validate audio
    const duration = (buffer.length / 16000) * 8; // Estimate duration
    if (duration > 120) {
      throw new Error("الرسالة الصوتية طويلة جدًا (الحد الأقصى دقيقتين)");
    }

    // 3. Upload to Cloudinary
    const cloudinaryResult = await uploadAudio(buffer);
    const audioUrl = cloudinaryResult.secure_url;

    // 4. Create FormData for OpenAI
    const formData = new FormData();

    // Append file as Buffer with proper options
    formData.append("file", buffer, {
      filename: "voice_message.ogg",
      contentType: audio.mime_type,
      knownLength: buffer.length, // Important for proper formatting
    });

    formData.append("model", "whisper-1");
    formData.append("language", "ar");
    formData.append("response_format", "text");

    // 5. Send to OpenAI using axios
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(), // This sets multipart boundary
          "Content-Length": formData.getLengthSync(), // Critical for stability
        },
        maxBodyLength: 25 * 1024 * 1024, // 25MB limit for large audio
        timeout: 30000, // 30 seconds timeout
      }
    );

    return {
      text: response.data,
      audioUrl,
    };
  } catch (error) {
    console.error("[AUDIO] Processing error:", error);

    // Enhanced error handling
    let errorMessage =
      "عذرًا، لم نتمكن من معالجة الرسالة الصوتية. يرجى إعادة المحاولة";

    if (error.response?.data?.error?.message) {
      const openAiError = error.response.data.error.message;
      console.error("OpenAI Error:", openAiError);

      if (openAiError.includes("Unsupported audio format")) {
        errorMessage =
          "عذرًا، الصيغة الصوتية غير مدعومة. يرجى إرسال رسالة نصية";
      } else if (openAiError.includes("file is too large")) {
        errorMessage = "الرسالة الصوتية طويلة جدًا (الحد الأقصى 25 ميجابايت)";
      }
    } else if (error.code === "ECONNABORTED") {
      errorMessage = "تجاوزت العملية المهلة المسموحة. يرجى إرسال رسالة أقصر";
    }

    return {
      text: "",
      error: errorMessage,
    };
  }
}
