import { v2 as cloudinary } from "cloudinary";
import { AppConfig } from "../config";

cloudinary.config({
  cloud_name: String(AppConfig.get("CLOUDINARY_CLOUD_NAME")),
  api_key: String(AppConfig.get("CLOUDINARY_API_KEY")),
  api_secret: String(AppConfig.get("CLOUDINARY_API_SECRET")),
});

export { cloudinary };
