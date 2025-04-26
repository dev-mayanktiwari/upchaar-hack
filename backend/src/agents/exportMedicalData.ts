import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import { AppConfig } from "../config";
import path from "path";

async function exportMedicalText(text: string) {
  try {
    const auth = new GoogleAuth({
      keyFile: path.join(__dirname, "../../upchaar-455216-fcd344c9bbf9.json"),
      scopes: "https://www.googleapis.com/auth/cloud-platform",
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const projectId = String(AppConfig.get("PROJECT_ID"));
    const projectRegion = String(AppConfig.get("PROJECT_REGION"));
    const response = await axios.post(
      `https://healthcare.googleapis.com/v1beta1/projects/${projectId}/locations/${projectRegion}/services/nlp:analyzeEntities`,
      {
        documentContent: text,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    
    console.log("Exported Medical Text:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error exporting medical text:", error);
    throw new Error("Failed to export medical text");
  }
}

export default exportMedicalText;
