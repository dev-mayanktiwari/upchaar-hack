import os from "os";
import { AppConfig } from "../config";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { drugInteractionPrompt } from "../prompts";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

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

  combineDateTimeUTC: (date: string, time: string): Date => {
    const datetime = dayjs.tz(
      `${date} ${time}`,
      "YYYY-MM-DD HH:mm",
      "Asia/Kolkata"
    );

    if (!datetime.isValid()) {
      throw new Error("Invalid time value");
    }

    return datetime.utc().toDate();
  },

  parsedDate: (date: string) => {
    const parsedDate = dayjs(date).startOf("day").toDate();
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

  getAvailableSlots: (
    startDate: string,
    endDate: string,
    doctorSchedule: any[],
    appointments: any[],
    leaveDates: any[]
  ) => {
    const result = [];
    let current = dayjs.tz(startDate, "Asia/Kolkata");
    const end = dayjs.tz(endDate, "Asia/Kolkata");

    while (current.isBefore(end, "day")) {
      const dateStr = current.format("YYYY-MM-DD");
      const dayOfWeek = current.day();

      const isOnLeave = leaveDates.some((ld) =>
        dayjs.tz(ld.leaveDate, "Asia/Kolkata").isSame(current, "day")
      );

      if (isOnLeave) {
        result.push({ date: dateStr, isAvailable: false, slots: [] });
        current = current.add(1, "day");
        continue;
      }

      const schedule = doctorSchedule.find((s) => s.day === dayOfWeek);

      if (!schedule) {
        result.push({ date: dateStr, isAvailable: false, slots: [] });
        current = current.add(1, "day");
        continue;
      }

      const slots = [];

      // 🕒 Convert full datetime strings to IST
      let slotTime = dayjs.tz(schedule.startTime, "Asia/Kolkata");
      const endTime = dayjs.tz(schedule.endTime, "Asia/Kolkata");

      while (slotTime.isBefore(endTime)) {
        const slotStr = slotTime.format("HH:mm");

        const isBooked = appointments.some((app) =>
          dayjs.tz(app.time, "Asia/Kolkata").isSame(slotTime, "minute")
        );

        slots.push({
          time: slotStr, // this is in IST now
          isAvailable: !isBooked,
        });

        slotTime = slotTime.add(20, "minute");
      }

      result.push({
        date: dateStr,
        isAvailable: true,
        slots,
      });

      current = current.add(1, "day");
    }

    return result;
  },

  cleanDateToYYYYMMDD: (date: string) => {
    const cleanDate = dayjs(date).format("YYYY-MM-DD");
    return cleanDate;
  },
};
