import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { EErrorStatusCode, EResponseStatusCode } from "../constant/application";
import httpError from "../utils/httpError";
import httpResponse from "../utils/httpResponse";
import bcrypt from "bcrypt";
import {
  appointmentSchema,
  createUserSchema,
  loginUserSchema,
} from "../types/userInputTypes";
import userDbServices from "../services/userDbServices";
import quicker from "../utils/quicker";
import redisClient from "../utils/redisClient";
import AuthenticatedRequest from "../types/expressRequest";
import { AppConfig } from "../config";
import { cloudinary } from "../utils/cloudinaryConfig";
import { extractMedicalData } from "../agents/ocrAgent";
import logger from "../utils/logger";
import { drugInteraction } from "../agents/drugInteraction";
import { http } from "winston";

export default {
  check: (req: Request, res: Response, next: NextFunction) => {
    try {
      httpResponse(req, res, EResponseStatusCode.OK, "Hello World", {
        name: "Mayank Tiwari",
      });
    } catch (error) {
      httpError(next, error, req);
    }
  },

  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const safeParse = createUserSchema.safeParse(body);

      console.log("Safeparse errors", safeParse.error?.format());

      if (!safeParse.success) {
        return httpError(
          next,
          new Error("Invalid Request"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }
      const { email, password } = safeParse.data;

      const existingUser = await userDbServices.findUniqueUser(email);

      if (existingUser) {
        return httpError(
          next,
          new Error("User already exists"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }
      const hashedPassword = await bcrypt.hashSync(password, 10);

      const user = await userDbServices.createUser(
        safeParse.data,
        hashedPassword
      );

      const extractedData = await extractMedicalData(
        user.medicalHistory?.reportUrl[0]!
      );

      logger.info("Extracted data", {
        meta: {
          extractedData,
        },
      });

      const updatedUser = await userDbServices.updateUserMedicalHistory(
        user.id,
        String(extractedData)
      );

      return httpResponse(
        req,
        res,
        EResponseStatusCode.CREATED,
        "User created successfully",
        updatedUser
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const safeParse = loginUserSchema.safeParse(body);
      if (!safeParse.success) {
        return httpError(
          next,
          new Error("Invalid Request"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }
      const { email, password } = safeParse.data;
      const user = await userDbServices.findUniqueUser(email);
      if (!user) {
        return httpError(
          next,
          new Error("User not exists"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return httpResponse(
          req,
          res,
          EErrorStatusCode.BAD_REQUEST,
          "Invalid password"
        );
      }

      const accessToken = quicker.generateJWTtoken(user.id);

      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Login successful",
        {
          accessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        }
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  bookAppointment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const safeParse = appointmentSchema.safeParse(body);
      if (!safeParse.success) {
        return httpError(
          next,
          new Error("Invalid Request"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }

      const { doctorId, time, date } = safeParse.data;
      const slotKey = `doctor:${doctorId}:slots:${date}`;
      const leaveKey = `doctor:${doctorId}:leave`;
      const patientId = (req as AuthenticatedRequest).id;
      const isOnLeave = await redisClient.sIsMember(leaveKey, date);
      const dateForDB = quicker.combineDateTimeUTC(date, time);

      if (isOnLeave) {
        return httpError(
          next,
          "Doctor is on leave",
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }

      const isBooked = await redisClient.hGet(slotKey, time);
      if (isBooked === "booked") {
        return httpError(
          next,
          "Slot already booked",
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }

      const transaction = redisClient.multi();

      // Step 4: Create the appointment in Prisma (Database)
      let appointment = await userDbServices.createAppointment(
        safeParse.data,
        patientId,
        dateForDB
      );

      // Step 5: Mark slot as "booked" in Redis
      transaction.hSet(slotKey, time, "booked");
      transaction.sAdd(`booked_slots:${doctorId}:${date}`, time);

      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Appointment booked successfully"
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  getAppointments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const patientId = (req as AuthenticatedRequest).id;
      const appointments = await userDbServices.getAppointments(patientId);
      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Appointments fetched successfully",
        appointments
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  trackAppointment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appointmentId = req.params.appointmentId;

      const appointment = await userDbServices.trackAppointment(
        Number(appointmentId),
        (req as AuthenticatedRequest).id
      );

      if (!appointment) {
        return httpError(
          next,
          new Error("Appointment not found"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }

      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Appointment tracked successfully",
        appointment
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  self: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).id;
      const user = await userDbServices.getUserById(userId);
      if (!user) {
        return httpError(
          next,
          new Error("User not found"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }
      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "User fetched successfully",
        user
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  getPresignedUrl: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expiresIn = 60 * 5;
      const timestamp = Math.round(new Date().getTime() / 1000);
      const expirationTimestamp = timestamp + expiresIn;
      const maxFileSize = 5 * 1024 * 1024; // 5 MB

      // Generate a unique public_id for the file
      const publicId = `users/medicationUpload/${uuidv4()}`;

      // Generate signature
      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp: expirationTimestamp,
          public_id: publicId,
        },
        String(AppConfig.get("CLOUDINARY_API_SECRET"))
      );

      // Construct full pre-filled URL
      const fullUploadUrl = `https://api.cloudinary.com/v1_1/${AppConfig.get(
        "CLOUDINARY_CLOUD_NAME"
      )}/auto/upload?api_key=${AppConfig.get(
        "CLOUDINARY_API_KEY"
      )}&timestamp=${expirationTimestamp}&signature=${signature}&public_id=${publicId}`;

      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Presigned URL generated successfully",
        {
          uploadUrl: fullUploadUrl,
          expiry: expiresIn,
          fileSize: maxFileSize,
        }
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  drugInteraction: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).id;
      const user = await userDbServices.getUserById(userId);

      if (!user) {
        return httpError(
          next,
          new Error("User not found"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }

      const userMedicalData = {
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        medications: user.medicalHistory?.currentMedications,
        allergies: user.medicalHistory?.allergies,
        chronicDiseases: user.medicalHistory?.chronicDiseases,
        pastSurgeries: user.medicalHistory?.pastSurgeries,
        smoking: user.medicalHistory?.smoking,
        alcoholConsumption: user.medicalHistory?.alcoholConsumption,
        reportData: user.medicalHistory?.reportData,
      };

      const drugInteractionResult = await drugInteraction(
        JSON.stringify(userMedicalData)
      );

      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Drug interaction data fetched successfully",
        {
          result: drugInteractionResult,
        }
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  addMedication: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).id;
      const { url } = req.body;

      if (!url) {
        return httpError(
          next,
          new Error("Medication data is required"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }

      const updatedUser = await userDbServices.addMedication(userId, url);

      const extractedData = await extractMedicalData(url);

      const updatedUserWithMedication =
        await userDbServices.updateUserMedicalHistory(
          userId,
          String(extractedData)
        );

      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Medication added successfully",
        updatedUserWithMedication
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },
};
