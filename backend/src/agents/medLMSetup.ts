import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAuth } from "google-auth-library";
import axios from "axios";

// Custom model implementation for the Google MedLM API
export const createMedLMModel = (
  projectId: string = "upchaar-455216",
  location: string = "us-central1",
  serviceAccountKeyPath: string = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    "../../upchaar-455216-fcd344c9bbf9.json"
) => {
  // URL for the MedLM API
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/medlm-large:predict`;

  // Set up auth client
  const auth = new GoogleAuth({
    keyFile: serviceAccountKeyPath,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  // Return a model object compatible with generateText
  return {
    provider: "google",
    generateContent: async (messages: any[], options: any = {}) => {
      try {
        // Get an authenticated client
        const client = await auth.getClient();

        // Format messages for MedLM API
        const formattedMessages = messages.map((msg) => ({
          author:
            msg.role === "system"
              ? "system"
              : msg.role === "user"
              ? "user"
              : "assistant",
          content: msg.content,
        }));

        // Prepare request body
        const requestBody = {
          instances: [
            {
              messages: formattedMessages,
            },
          ],
          parameters: {
            temperature: options.temperature || 0.2,
            maxOutputTokens: options.maxOutputTokens || 1024,
            topP: options.topP || 0.8,
            topK: options.topK || 40,
          },
        };

        // Make the API request
        const response = await client.request({
          url: endpoint,
          method: "POST",
          data: requestBody,
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Parse the response
        const result = response.data;
        const content =
          result.predictions[0]?.candidates[0]?.content ||
          "Sorry, I couldn't generate a response.";

        // Format response to match generateText output structure
        return {
          text: content,
          response: {
            candidates: result.predictions[0]?.candidates || [],
            raw: result,
          },
        };
      } catch (error) {
        console.error("Error calling MedLM API:", error);
        throw error;
      }
    },
  };
};

// Create and export the model instance
const model = createMedLMModel();
export default model;
