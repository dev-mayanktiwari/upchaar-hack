import { medicineInteractionPrompt } from "../prompts";
import { genAI } from "../utils/googleAI";
import logger from "../utils/logger";

export const medicineInteraction = async (data: any, medicines: string[]) => {
  try {
    console.log("Medicines received for alternatives:", medicines);
    console.log("Data received for medicines:", data);

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return {
        error: {
          message: "No medicines provided.",
          reason: "Input must be a non-empty array of medicine names.",
          suggestion:
            "Pass an array of medicine names to check for alternatives.",
        },
      };
    }
    console.log("Hello from medicine interaction with Gemini", data);
    const response = await genAI.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${medicineInteractionPrompt}\n\nMy medical history is: ${data}  \n\nHere are the medicines: ${JSON.stringify(
                medicines
              )}`,
            },
          ],
        },
      ],
    });

    let result = await response.response.text();

    // Clean up ```json ``` if present
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
    console.error("Error in drug alternative with Gemini:", error);
    throw new Error("Failed to fetch drug alternatives");
  }
};
