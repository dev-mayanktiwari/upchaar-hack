import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "../../.env" });
// console.log("Environment Variables Loaded", process.env.GEMINI_API_KEY);

type ConfigKeys =
  | "PORT"
  | "DATABASE_URL"
  | "SERVER_URL"
  | "ENV"
  | "REDIS_URL"
  | "GEMINI_API_KEY"
  | "ACCESS_TOKEN_SECRET"
  //  | "REFRESH_TOKEN_SECRET"
  // | "ACCESS_TOKEN_EXPIRY"
  //   | "REFRESH_TOKEN_EXPIRY"
  //   | "DOMAIN"
  //   | "MONGO_URL"
  //   | "REDIS_PASSWORD"
  //   | "ADMIN_USERNAME"
  | "CORS_ORIGIN"
  | "CLOUDINARY_CLOUD_NAME"
  | "CLOUDINARY_API_KEY"
  | "PROJECT_ID"
  | "PROJECT_REGION"
  | "CLOUDINARY_API_SECRET";

//   | "ADMIN_PASSWORD";

const _config: Record<ConfigKeys, string | undefined> = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  SERVER_URL: process.env.SERVER_URL,
  ENV: process.env.ENV,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  //   REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  // ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
  //   REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
  //   DOMAIN: process.env.DOMAIN,
  //   MONGO_URL: process.env.MONGO_URL,
  //   REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  //   ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  //   ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  PROJECT_ID: process.env.PROJECT_ID,
  PROJECT_REGION: process.env.PROJECT_REGION,
};

export const AppConfig = {
  get(key: ConfigKeys): string | number {
    const value = _config[key];
    if (value === undefined) {
      console.log(`Missing config key: ${key}`);
      process.exit(1);
    }

    // if (key === "PORT" || key === "REDIS_PORT") {
    //   return Number(value);
    // }

    return value;
  },
};
