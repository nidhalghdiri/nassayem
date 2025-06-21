import OpenAI from "openai";

import axios from "axios";
import { deleteOldAudio, uploadAudio } from "./cloudinary";
import { Readable } from "stream";
// import ffmpeg from 'fluent-ffmpeg';
import ffmpeg from "fluent-ffmpeg";
import { promisify } from "util";
import { tmpdir } from "os";
import { writeFile, unlink } from "fs/promises";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processAudioMessage(waId, audio) {
  let tempFilePath = "";

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

    tempFilePath = path.join(tmpdir(), `voice_${Date.now()}.wav`);
    await writeFile(tempFilePath, buffer);

    const wavBuffer = await convertAudio(tempFilePath);

    // 3. Upload to Cloudinary
    const cloudinaryResult = await uploadAudio(wavBuffer);
    const audioUrl = cloudinaryResult.secure_url;
    // deleteOldAudio(cloudinaryResult.public_id);

    const file = await createOpenAIFile(wavBuffer);

    // Create a File-like object
    // const file = {
    //   buffer: wavBuffer,
    //   name: "voice_message.ogg",
    //   type: audio.mime_type, // 'audio/ogg; codecs=opus'
    //   stream: Readable.from(wavBuffer),
    //   [Symbol.toStringTag]: "File",
    // };

    console.log("Audio File To OpenAI: ", file);

    // 4. Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "ar",
      response_format: "text",
    });

    return {
      text: transcription,
      audioUrl: cloudinaryResult.secure_url,
    };
  } catch (error) {
    console.error("[AUDIO] Processing error:", error);

    // Special handling for format errors
    if (
      error.message.includes("parse multipart") ||
      error.message.includes("audio format") ||
      error.message.includes("Unsupported audio format")
    ) {
      return {
        text: "",
        error: "عذرًا، لم نتمكن من فهم الصيغة الصوتية. يرجى إرسال رسالة نصية",
      };
    }

    throw new Error("Voice processing failed: " + error.message);
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.error("Failed to clean up temp file:", cleanupError);
      }
    }
  }
}
async function convertAudio(inputPath) {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath.replace(".wav", "_converted.wav");

    ffmpeg(inputPath)
      .audioCodec("pcm_s16le")
      .audioFrequency(16000)
      .audioChannels(1)
      .format("wav")
      .on("error", reject)
      .on("end", () => resolve(outputPath))
      .save(outputPath);
  });
}

async function createOpenAIFile(buffer) {
  // Create a proper File object
  const tempFilePath = path.join(tmpdir(), `openai_${Date.now()}.wav`);
  await writeFile(tempFilePath, buffer);

  return {
    name: "voice_message.wav",
    type: "audio/wav",
    stream: fs.createReadStream(tempFilePath),
    [Symbol.toStringTag]: "File",
  };
}
