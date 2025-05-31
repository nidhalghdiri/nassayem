import { streamText, Message } from "ai";
import { initialMessage } from "@/lib/data";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: ``,
  compatibility: "strict",
});

export const runtime = "edge";

export async function POST(req) {
  const { messages } = await req.json();

  const stream = await streamText({
    model: openai("gpt-4o"),
    messages: [initialMessage, ...messages],
    temperature: 1,
  });

  return stream?.toDataStreamResponse();
}
