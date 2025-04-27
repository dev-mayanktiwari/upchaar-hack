import { alternateMedicinePrompt } from "../prompts";
import { genAI } from "../utils/googleAI";
import logger from "../utils/logger";

export const alternateDrugAgent = async (
  missingMedicines: string[],
  allMedicines: any[]
) => {
  try {
    if (
      !missingMedicines ||
      !Array.isArray(missingMedicines) ||
      !Array.isArray(allMedicines)
    ) {
      return {
        error: {
          message: "Error in alternative medicine check.",
          reason: "Input must be non-empty arrays.",
          suggestion: "Pass valid arrays of missing and available medicines.",
        },
      };
    }

    console.log(
      "Data received for drug interaction:",
      missingMedicines,
      allMedicines
    );

    // Format allMedicines better for the prompt
    const formattedAvailableMedicines = allMedicines.map((med) => ({
      name: med.name,
      strength: med.strength,
      expiryDate: med.expiryDate,
    }));

    const promptText = `
${alternateMedicinePrompt}

Missing Medicines:
${missingMedicines.join("\n")}

Available Medicines:
${formattedAvailableMedicines
  .map((med) => `- ${med.name} (${med.strength}), `)
  .join("\n")}

Suggest one good alternative for each missing medicine based on availability and similar action if possible.
Only reply in JSON format like: 
{ "Alternatives": [ { "original": "MedicineName", "alternative": "AlternativeName" }, ... ] }
`;

    const response = await genAI.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }],
        },
      ],
    });

    let result = await response.response.text();

    // Remove ```json or ``` if present
    if (result.startsWith("```json")) result = result.slice(7);
    if (result.startsWith("```")) result = result.slice(3);
    if (result.endsWith("```")) result = result.slice(0, -3);

    result = result.trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(result);
      logger.info("Parsed JSON successfully", { meta: { parsedJson } });
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
