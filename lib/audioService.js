import OpenAI from "openai";

import axios from "axios";
import { deleteOldAudio, uploadAudio } from "./cloudinary";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processAudioMessage(waId, audio) {
  try {
    // 1. Download audio from WhatsApp
    const mediaUrl = `https://graph.facebook.com/v18.0/${audio.id}`;
    const headers = {
      Authorization: `Bearer EAAQ8GvpD3gYBOyBjBiZBEceqkSAzoXdZBCRQxbREouAnL8DtG8wKwYvONH8pPwD5GLMCcYX24HLyQxkGAEKRQt0aarzh7SIA4xWSrS7CN0FEHwwAeNV6kzfA5UWxOQCdCHCECEF1vccf54LFPCxRo4yWYKZBBrLxP3DMiordKJ0yw3BL83vZAGdC20yeTrViqAZDZD`,
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
      throw new Error("Voice message too long (max 2 minutes)");
    }

    // 3. Upload to Cloudinary
    const cloudinaryResult = await uploadAudio(buffer);
    const audioUrl = cloudinaryResult.secure_url;
    // deleteOldAudio(cloudinaryResult.public_id);

    // 4. Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: {
        data: buffer,
        name: "voice_message.ogg",
      },
      model: "whisper-1",
      language: "ar",
      response_format: "text",
    });

    return {
      text: transcription,
      audioUrl,
    };
  } catch (error) {
    console.error("[AUDIO] Processing error:", error);
    throw new Error("Voice processing failed: " + error.message);
  }
}
