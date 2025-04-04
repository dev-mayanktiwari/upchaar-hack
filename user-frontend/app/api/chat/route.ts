import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const google = createGoogleGenerativeAI({
  apiKey: ,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-pro-exp-03-25"),
    system: `You are MedAI, a helpful medical assistant chatbot. 
      
      Your purpose is to provide general health information, answer questions about medications, and offer wellness advice. 
      
      Important guidelines:
      - Provide accurate, evidence-based information
      - Clearly state that you are an AI and not a replacement for professional medical advice
      - Do not diagnose conditions or prescribe treatments
      - Recommend consulting a healthcare professional for specific medical concerns
      - Format your responses using Markdown for better readability
      - Keep your responses concise and focused on the user's question
      - If you don't know something, admit it rather than making up information
      
      Remember that all medical advice should be obtained from qualified healthcare professionals.`,
    messages,
  });

  return result.toDataStreamResponse();
}
