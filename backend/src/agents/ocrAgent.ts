import { generateText } from "ai";
import model from "../utils/googleAI";
import { ocrPrompt } from "../prompts";
import logger from "../utils/logger";

type MedicalOCRResponse = Record<string, unknown>;

export const extractMedicalData = async (fileUrl: string) => {
  try {
    // Validate file URL
    if (!fileUrl) {
      throw new Error("File URL is required");
    }

    // Validate URL format
    try {
      new URL(fileUrl);
    } catch (error) {
      throw new Error("Invalid file URL format");
    }

    // Generate text from the file using AI
    const result = await generateText({
      model: model,
      messages: [
        {
          role: "system",
          content: ocrPrompt,
        },
        {
          role: "user",
          content: fileUrl,
        },
      ],
    });

    // Clean and parse the response
    try {
      // Remove markdown code block markers if present
      let jsonString = result.text;
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.substring(7);
      }
      if (jsonString.endsWith('```')) {
        jsonString = jsonString.substring(0, jsonString.length - 3);
      }
      
      // Trim any whitespace
      jsonString = jsonString.trim();
      
      // Parse the cleaned JSON string
      const parsedResponse = JSON.parse(jsonString) as MedicalOCRResponse;
      
      logger.info("Successfully parsed medical data", {
        meta: {
          fileUrl,
          parsedData: parsedResponse
        }
      });
      
      return parsedResponse;
    } catch (parseError) {
      logger.error("Failed to parse OCR response", {
        meta: {
          error: parseError,
          rawResponse: result.text,
          fileUrl
        }
      });
      throw new Error("Failed to parse OCR response");
    }
  } catch (error) {
    logger.error("Error in extractMedicalData", {
      meta: {
        error: error,
        fileUrl,
      },
    });
    throw error;
  }
};

export default {
  extractMedicalData,
};