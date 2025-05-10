import { createGoogleGenerativeAI } from "@ai-sdk/google";
// import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppConfig } from "../config";

export const google = createGoogleGenerativeAI({
  apiKey: String(AppConfig.get("GEMINI_API_KEY")),
});

// THIS CODE IS NOT STABLE (GOOGLE GEN AI)
// export const ai = new GoogleGenAI({
//   apiKey: String(AppConfig.get("GEMINI_API_KEY")),
// });

const ai = new GoogleGenerativeAI(String(AppConfig.get("GEMINI_API_KEY")));
export const genAI = ai.getGenerativeModel({
  model: "gemini-2.0-flash",
});

// THIS CODE WAS FOR VERCEL AI SDK 
// const model = google("gemini-2.5-pro-exp-03-25");
// export default model;
