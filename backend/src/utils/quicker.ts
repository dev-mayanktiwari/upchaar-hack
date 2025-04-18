import os from "os";
import { AppConfig } from "../config";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { drugInteractionPrompt } from "../prompts";

dayjs.extend(utc);
dayjs.extend(customParseFormat);

export default {
  getSystemHealth: () => {
    return {
      cpuUsage: os.loadavg(),
      totalMemory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
      freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`,
    };
  },
  getApplicationHealth: () => {
    return {
      environment: AppConfig.get("ENV"),
      uptime: `${process.uptime().toFixed(2)} seconds`,
      memoryUsage: {
        totalHeap: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(
          2
        )} MB`,
        usedHeap: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
          2
        )} MB`,
      },
    };
  },
  generateJWTtoken: (userId: string) => {
    const token = jwt.sign(
      {
        id: userId,
      },
      AppConfig.get("ACCESS_TOKEN_SECRET") as string,
      {
        expiresIn: "30d",
      }
    );
    return token;
  },
  combineDateTimeUTC: (date: string, time: string): string => {
    return dayjs.utc(`${date} ${time}`).toISOString(); // Converts to ISO 8601 (UTC)
  },
  parsedDate: (date: string) => {
    const parsedDate = dayjs(date, "DD-MM-YY").startOf("day").toDate();
    return parsedDate;
  },
  getMedLMPrompt: (text: any) => {
    const messages = [
      {
        role: "system",
        content: drugInteractionPrompt,
      },
      {
        role: "user",
        content: `My medical details are as follows: ${text}`,
      },
    ];
    return messages;
  },
  cleanJsonObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj
        .map(this.cleanJsonObject)
        .filter((item) => item !== null && item !== undefined && item !== "");
    } else if (obj && typeof obj === "object") {
      const cleaned: any = {};
      for (const key in obj) {
        const value = this.cleanJsonObject(obj[key]);
        if (value !== null && value !== undefined && value !== "") {
          cleaned[key] = value;
        }
      }
      return cleaned;
    }
    return obj;
  },
};
