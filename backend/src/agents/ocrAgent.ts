import { genAI } from "../utils/googleAI";
import { ocrPrompt } from "../prompts";
import logger from "../utils/logger";

export const extractMedicalData = async (fileUrl: string) => {
  try {
    if (!fileUrl) {
      throw new Error("File URL is required");
    }

    // Fetch and convert PDF to base64
    const pdfBuffer = await fetch(fileUrl).then((res) => res.arrayBuffer());

    const result = await genAI.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: ocrPrompt },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: Buffer.from(pdfBuffer).toString("base64"),
              },
            },
          ],
        },
      ],
    });

    const response = await result.response;
    let text = response.text();

    if (!text) throw new Error("No text extracted from the PDF");

    // Strip Markdown formatting like ```json
    if (text.startsWith("```json")) text = text.slice(7);
    if (text.endsWith("```")) text = text.slice(0, -3);

    text = text.trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(text);
      logger.info("Parsed JSON successfully", {
        meta: {
          parsedJson,
          fileUrl,
        },
      });
    } catch (parseError) {
      logger.error("Failed to parse AI response as JSON", {
        meta: {
          error: parseError,
          rawResponse: text,
          fileUrl,
        },
      });
      throw new Error("Failed to parse JSON from AI response");
    }

    logger.info("Successfully parsed medical data", {
      meta: {
        fileUrl,
        parsedData: parsedJson,
      },
    });

    return JSON.stringify(parsedJson);
  } catch (error) {
    logger.error("Error in extractMedicalData", {
      meta: {
        error,
        fileUrl,
      },
    });
    throw error;
  }
};

export default {
  extractMedicalData,
};
