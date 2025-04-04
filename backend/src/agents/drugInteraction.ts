// import { generateText } from "ai";
// import model from "../utils/googleAI";
// import { drugInteractionPrompt } from "../prompts";
// import logger from "../utils/logger";

// export const drugInteraction = async (data: any) => {
//   try {
//     const result = await generateText({
//       model: model,
//       messages: [
//         {
//           role: "system",
//           content: drugInteractionPrompt,
//         },
//         {
//           role: "user",
//           content: data,
//         },
//       ],
//     });

//     // Clean and parse the response
//     try {
//       // Remove markdown code block markers if present
//       let jsonString = result.text;
//       if (jsonString.startsWith("```json")) {
//         jsonString = jsonString.substring(7);
//       }
//       if (jsonString.endsWith("```")) {
//         jsonString = jsonString.substring(0, jsonString.length - 3);
//       }

//       // Trim any whitespace
//       jsonString = jsonString.trim();

//       // Parse the cleaned JSON string
//       const parsedResponse = JSON.parse(jsonString);

//       logger.info("Successfully generated drug interaction", {
//         meta: {
//           parsedData: parsedResponse,
//         },
//       });

//       return parsedResponse;
//     } catch (parseError) {
//       logger.error("Failed to parse OCR response", {
//         meta: {
//           error: parseError,
//           rawResponse: result.text,
//         },
//       });
//       throw new Error("Failed to parse OCR response");
//     }
//   } catch (error) {
//     logger.error("Error in extractMedicalData", {
//       meta: {
//         error: error,
//       },
//     });
//     throw error;
//   }
// };

import { generateText } from "ai";
import model from "../utils/googleAI";
import { drugInteractionPrompt } from "../prompts";
import logger from "../utils/logger";

export const drugInteraction = async (data: any) => {
  try {
    // This remains the same as your original function,
    // but now it will use our custom MedLM model
    const result = await generateText({
      model: model,
      messages: [
        {
          role: "system",
          content: drugInteractionPrompt,
        },
        {
          role: "user",
          content: data,
        },
      ],
    });

    // Clean and parse the response
    try {
      // Remove markdown code block markers if present
      let jsonString = result.text;
      if (jsonString.startsWith("```json")) {
        jsonString = jsonString.substring(7);
      }
      if (jsonString.endsWith("```")) {
        jsonString = jsonString.substring(0, jsonString.length - 3);
      }

      // Trim any whitespace
      jsonString = jsonString.trim();

      // Parse the cleaned JSON string
      const parsedResponse = JSON.parse(jsonString);

      logger.info("Successfully generated drug interaction", {
        meta: {
          parsedData: parsedResponse,
        },
      });

      return parsedResponse;
    } catch (parseError) {
      logger.error("Failed to parse drug interaction response", {
        meta: {
          error: parseError,
          rawResponse: result.text,
        },
      });
      throw new Error("Failed to parse drug interaction response");
    }
  } catch (error) {
    logger.error("Error in drugInteraction", {
      meta: {
        error: error,
      },
    });
    throw error;
  }
};
