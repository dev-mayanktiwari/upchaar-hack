import os from "os";
import { AppConfig } from "../config";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { drugInteractionPrompt } from "../prompts";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(utc);

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

  getAvailableSlots: (
    startDate: string,
    endDate: string,
    doctorSchedule: any[],
    appointments: any[],
    leaveDates: any[]
  ) => {
    // console.log("Doctor Schedule from fn:", doctorSchedule);
    // console.log("Appointments from fn:", appointments);
    const result = [];
    let current = dayjs(startDate);
    const end = dayjs(endDate);

    // console.log("Start Date:", startDate);
    // console.log("End Date:", endDate);

    while (current.isBefore(end, "day")) {
      const dateStr = current.format("YYYY-MM-DD");
      const dayOfWeek = current.day();

      const isOnLeave = leaveDates.some((ld) =>
        dayjs(ld.leaveDate).isSame(current, "day")
      );
      // console.log("Is on leave:", isOnLeave);
      if (isOnLeave) {
        result.push({ date: dateStr, isAvailable: false, slots: [] });
        current = current.add(1, "day");
        continue;
      }

      const schedule = doctorSchedule.find((s) => s.day === dayOfWeek);
      // console.log("Schedule for the day:", schedule);
      if (!schedule) {
        result.push({ date: dateStr, isAvailable: false, slots: [] });
        current = current.add(1, "day");
        continue;
      }

      const slots = [];
      let slotTime = dayjs(schedule.startTime);
      const endTime = dayjs(schedule.endTime);
      // console.log("Slot Time:", slotTime);
      // console.log("End Time:", endTime);
      while (slotTime.add(20, "minute").isSameOrBefore(endTime)) {
        const slotStr = slotTime.format("HH:mm");
        const fullDateTime = slotTime.toISOString();

        const isBooked = appointments.some((app) =>
          dayjs(app.time).isSame(slotTime, "minute")
        );

        slots.push({
          time: slotStr,
          isAvailable: !isBooked,
        });

        slotTime = slotTime.add(20, "minute");
      }
      // console.log("Available slots for the day:", slots);
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
