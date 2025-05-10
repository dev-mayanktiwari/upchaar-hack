import { drugInteractionPrompt } from "../prompts";
import { genAI } from "../utils/googleAI";
import logger from "../utils/logger";

export const drugInteractionWithGemini = async (data: any) => {
  try {
    if (!data) {
      return {
        error: {
          message: "No medications provided.",
          reason: "Input must be a non-empty array.",
          suggestion: "Pass an array of medications with all required fields.",
        },
      };
    }

    console.log("Data received for drug interaction:", data);
    console.log("Hello from drug interaction with Gemini");
    // const properInput = JSON.parse(data);

    const response = await genAI.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${drugInteractionPrompt}\n\nMy medical details are: ${data}`,
            },
          ],
        },
      ],
    });

    let result = await response.response.text();

    // Remove ```json or ``` if present
    if (result.startsWith("```json")) result = result.slice(7);
    if (result.startsWith("```")) result = result.slice(3);
    if (result.endsWith("```")) result = result.slice(0, -3);

    result = result.trim();

    // Safely parse JSON
    let parsedJson;
    try {
      parsedJson = JSON.parse(result);
      logger.info("Parsed JSON successfully", {
        meta: { parsedJson },
      });
    } catch (parseError) {
      logger.error("Failed to parse Gemini response as JSON", {
        meta: { rawText: result, error: parseError },
      });
      throw new Error("Response was not valid JSON");
    }

    logger.info("Gemini parsed JSON response:", parsedJson);
    return parsedJson;
  } catch (error) {
    console.error("Error in drug interaction with Gemini:", error);
    throw new Error("Failed to fetch drug interaction data");
  }
};
