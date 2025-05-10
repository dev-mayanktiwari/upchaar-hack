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
import AuthenticatedRequest from "../types/expressRequest";
import { AppConfig } from "../config";
import { cloudinary } from "../utils/cloudinaryConfig";
import { extractMedicalData } from "../agents/ocrAgent";
import logger from "../utils/logger";
import { drugInteractionWithGemini } from "../agents/drugInteraction";

interface MedicationItem {
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  prescribedBy?: string;
  [key: string]: any;
}

interface ReportDataItem {
  type?: string;
  date?: string;
  facility?: string;
  testName?: string;
  results?: any;
  value?: number | string;
  unit?: string;
  referenceRange?: string;
  interpretation?: string;
  findings?: string;
  [key: string]: any;
}

interface UserMedicalData {
  age?: number;
  gender?: string;
  bloodGroup?: string;
  medications: MedicationItem[];
  allergies: string[];
  chronicDiseases: string[];
  pastSurgeries: string[];
  smoking: boolean;
  alcoholConsumption: boolean;
  reportData: ReportDataItem[];
}

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
      console.log("Existing user", existingUser);

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

      let updatedUser = user;

      // Only try to extract medical data if there's a report URL
      if (
        user.medicalHistory?.reportUrl &&
        user.medicalHistory.reportUrl.length > 0
      ) {
        try {
          const extractedData = await extractMedicalData(
            user.medicalHistory.reportUrl[0]
          );

          console.log("Extracted data", JSON.stringify(extractedData));
          logger.info("Extracted data from user Controller", {
            meta: {
              data: JSON.parse(extractedData),
            },
          });

          updatedUser = await userDbServices.updateUserMedicalHistory(
            user.id,
            extractedData
          );
        } catch (extractError) {
          console.log("Error extracting medical data", extractError);
          logger.error("Error extracting medical data", {
            error: extractError,
            userId: user.id,
          });
          // We continue even if extraction fails
        }
      }

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
      console.log("Safeparse errors", safeParse.error?.format());
      if (!safeParse.success) {
        return httpError(
          next,
          new Error("Invalid Request"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }

      const parsedDate = quicker.parsedDate(safeParse.data.date);

      // REWRITE THIS CHECK MORE BETTER TILL THEN WE ARE USING THE SCHEDULE
      // SO DON'T THINK THERE WILL BE ANY PROBLEM

      // const isOnLeave = doctorDbServices.isOnLeave(
      //   safeParse.data.doctorId,
      //   parsedDate
      // );

      // if (!!isOnLeave) {
      //   return httpError(
      //     next,
      //     new Error("Doctor is on leave"),
      //     req,
      //     EErrorStatusCode.BAD_REQUEST
      //   );
      // }

      const { doctorId, time, date } = safeParse.data;

      const patientId = (req as AuthenticatedRequest).id;
      const dateForDB = quicker.combineDateTimeUTC(date, time);

      const existingAppointment = await userDbServices.isTimeSlotTaken(
        doctorId,
        dateForDB
      );

      if (existingAppointment) {
        return httpError(
          next,
          new Error("Time slot already taken"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }

      const appointment = await userDbServices.createAppointment(
        safeParse.data,
        patientId,
        dateForDB
      );

      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Appointment booked successfully",
        appointment
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
      const userId = (req as AuthenticatedRequest).id || req.params.userId;
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
      const expiresIn = 60 * 5; // 5 minutes
      const timestamp = Math.round(Date.now() / 1000);
      const expirationTimestamp = timestamp + expiresIn;
      const maxFileSize = 5 * 1024 * 1024; // 5 MB

      // Generate a unique public_id
      const publicId = `users/medicationUpload/${uuidv4()}`;

      // Generate the signature
      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp: expirationTimestamp,
          public_id: publicId,
        },
        String(AppConfig.get("CLOUDINARY_API_SECRET"))
      );

      // Construct the upload URL with resource_type = raw
      const fullUploadUrl = `https://api.cloudinary.com/v1_1/${AppConfig.get(
        "CLOUDINARY_CLOUD_NAME"
      )}/raw/upload?api_key=${AppConfig.get(
        "CLOUDINARY_API_KEY"
      )}&timestamp=${expirationTimestamp}&signature=${signature}&public_id=${publicId}`;

      // Return the presigned URL and upload metadata
      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Presigned URL generated successfully",
        {
          uploadUrl: fullUploadUrl,
          expiry: expiresIn,
          fileSize: maxFileSize,
          publicId, // optional, useful for frontend tracking
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
      // @ts-ignore
      const reportDataJson = JSON.parse(user.medicalHistory?.reportData || []);
      console.log("Report data", reportDataJson);
      console.log("Report data JSON", reportDataJson);
      const userMedicalData = {
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        // medications,
        allergies: user.medicalHistory?.allergies || [],
        chronicDiseases: user.medicalHistory?.chronicDiseases || [],
        pastSurgeries: user.medicalHistory?.pastSurgeries || [],
        smoking: user.medicalHistory?.smoking || false,
        alcoholConsumption: user.medicalHistory?.alcoholConsumption || false,
        reportData: reportDataJson,
      };

      const drugInteractionResult = await drugInteractionWithGemini(
        JSON.stringify(userMedicalData)
      );

      logger.info("Drug interaction result", {
        meta: {
          data: drugInteractionResult,
        },
      });

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

  //     const user = await userDbServices.getUserById(userId);

  //     if (!user) {
  //       return httpError(
  //         next,
  //         new Error("User not found"),
  //         req,
  //         EErrorStatusCode.BAD_REQUEST
  //       );
  //     }

  //     // Parse currentMedications if it's a string
  //     let medications = [];
  //     if (user.medicalHistory?.currentMedications) {
  //       try {
  //         // If it's stored as a JSON string, parse it
  //         medications = JSON.parse(user.medicalHistory.currentMedications);

  //         // Ensure it's an array
  //         if (!Array.isArray(medications)) {
  //           medications = [medications];
  //         }
  //       } catch (e) {
  //         // If it's not valid JSON, use it as a simple string
  //         medications = [{ name: user.medicalHistory.currentMedications }];
  //       }
  //     }

  //     // Format reportData properly if needed
  //     // @ts-ignore
  //     let reportData = [];
  //     if (
  //       user.medicalHistory?.reportData &&
  //       Array.isArray(user.medicalHistory.reportData)
  //     ) {
  //       reportData = user.medicalHistory.reportData;
  //     }

  //     const userMedicalData = {
  //       age: user.age,
  //       gender: user.gender,
  //       bloodGroup: user.bloodGroup,
  //       medications: medications,
  //       allergies: user.medicalHistory?.allergies || [],
  //       chronicDiseases: user.medicalHistory?.chronicDiseases || [],
  //       pastSurgeries: user.medicalHistory?.pastSurgeries || [],
  //       smoking: user.medicalHistory?.smoking || false,
  //       alcoholConsumption: user.medicalHistory?.alcoholConsumption || false,
  //       // @ts-ignore
  //       reportData: reportData,
  //     };

  //     const drugInteractionResult = await drugInteraction(
  //       JSON.stringify(userMedicalData)
  //     );

  //     return httpResponse(
  //       req,
  //       res,
  //       EResponseStatusCode.OK,
  //       "Drug interaction data fetched successfully",
  //       {
  //         result: drugInteractionResult,
  //       }
  //     );
  //   } catch (error) {
  //     httpError(next, error, req);
  //   }
  // },
  // drugInteraction: async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userId = (req as AuthenticatedRequest).id;
  //     const user = await userDbServices.getUserById(userId);

  //     if (!user) {
  //       return httpError(
  //         next,
  //         new Error("User not found"),
  //         req,
  //         EErrorStatusCode.BAD_REQUEST
  //       );
  //     }

  //     // Parse currentMedications
  //     let medications: any[] = [];
  //     if (user.medicalHistory?.currentMedications) {
  //       try {
  //         const parsed = JSON.parse(user.medicalHistory.currentMedications);
  //         medications = Array.isArray(parsed) ? parsed : [parsed];
  //       } catch (e) {
  //         medications = [{ name: user.medicalHistory.currentMedications }];
  //       }
  //     }

  //     // Normalize reportData
  //     let reportData: any[] = [];
  //     if (Array.isArray(user.medicalHistory?.reportData)) {
  //       reportData = user.medicalHistory.reportData.map((report) => {
  //         if (typeof report === "object" && report !== null) {
  //           return { ...report };
  //         } else {
  //           return { raw: String(report) };
  //         }
  //       });
  //     }

  //     const userMedicalData = {
  //       age: user.age,
  //       gender: user.gender,
  //       bloodGroup: user.bloodGroup,
  //       medications,
  //       allergies: user.medicalHistory?.allergies || [],
  //       chronicDiseases: user.medicalHistory?.chronicDiseases || [],
  //       pastSurgeries: user.medicalHistory?.pastSurgeries || [],
  //       smoking: user.medicalHistory?.smoking || false,
  //       alcoholConsumption: user.medicalHistory?.alcoholConsumption || false,
  //       reportData,
  //     };

  //     // Log to verify correctness (optional)
  //     // console.log(JSON.stringify(userMedicalData, null, 2));

  //     const drugInteractionResult = await drugInteraction(
  //       JSON.stringify(userMedicalData)
  //     );

  //     return httpResponse(
  //       req,
  //       res,
  //       EResponseStatusCode.OK,
  //       "Drug interaction data fetched successfully",
  //       {
  //         result: drugInteractionResult,
  //       }
  //     );
  //   } catch (error) {
  //     httpError(next, error, req);
  //   }
  // },

  // drugInteraction: async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userId = (req as AuthenticatedRequest).id;
  //     const user = await userDbServices.getUserById(userId);

  //     if (!user) {
  //       return httpError(
  //         next,
  //         new Error("User not found"),
  //         req,
  //         EErrorStatusCode.BAD_REQUEST
  //       );
  //     }

  //     // Parse currentMedications
  //     let medications: any[] = [];
  //     if (user.medicalHistory?.currentMedications) {
  //       try {
  //         const parsed = JSON.parse(user.medicalHistory.currentMedications);
  //         medications = Array.isArray(parsed) ? parsed : [parsed];
  //       } catch (e) {
  //         medications = [{ name: user.medicalHistory.currentMedications }];
  //       }
  //     }

  //     // Properly handle reportData
  //     let reportData: any[] = [];
  //     if (user.medicalHistory?.reportData) {
  //       // Ensure it's an array
  //       const reportsArray = Array.isArray(user.medicalHistory.reportData)
  //         ? user.medicalHistory.reportData
  //         : [user.medicalHistory.reportData];

  //       reportData = reportsArray.map((report) => {
  //         // If it's already an object, use it directly
  //         if (typeof report === "object" && report !== null) {
  //           return report; // Don't wrap it in another object
  //         }
  //         // If it's a string that might be JSON, try to parse it
  //         else if (typeof report === "string") {
  //           try {
  //             const parsedReport = JSON.parse(report);
  //             return parsedReport;
  //           } catch (e) {
  //             // If parsing fails, keep as string
  //             return { raw: report };
  //           }
  //         }
  //         // Fallback
  //         return { raw: String(report) };
  //       });
  //     }

  //     const userMedicalData = {
  //       age: user.age,
  //       gender: user.gender,
  //       bloodGroup: user.bloodGroup,
  //       medications,
  //       allergies: user.medicalHistory?.allergies || [],
  //       chronicDiseases: user.medicalHistory?.chronicDiseases || [],
  //       pastSurgeries: user.medicalHistory?.pastSurgeries || [],
  //       smoking: user.medicalHistory?.smoking || false,
  //       alcoholConsumption: user.medicalHistory?.alcoholConsumption || false,
  //       reportData,
  //     };

  //     // For debugging
  //     console.log(
  //       "Processed medical data:",
  //       JSON.stringify(userMedicalData, null, 2)
  //     );

  //     const drugInteractionResult = await drugInteraction(
  //       JSON.stringify(userMedicalData)
  //     );

  //     return httpResponse(
  //       req,
  //       res,
  //       EResponseStatusCode.OK,
  //       "Drug interaction data fetched successfully",
  //       {
  //         result: drugInteractionResult,
  //       }
  //     );
  //   } catch (error) {
  //     httpError(next, error, req);
  //   }
  // },
  // drugInteraction: async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userId = (req as AuthenticatedRequest).id;
  //     const user = await userDbServices.getUserById(userId);

  //     if (!user) {
  //       return httpError(
  //         next,
  //         new Error("User not found"),
  //         req,
  //         EErrorStatusCode.BAD_REQUEST
  //       );
  //     }

  //     // Parse currentMedications with proper schema
  //     let medications: MedicationItem[] = [];
  //     if (user.medicalHistory?.currentMedications) {
  //       try {
  //         const parsed = JSON.parse(user.medicalHistory.currentMedications);
  //         medications = Array.isArray(parsed) ? parsed : [parsed];

  //         // Validate each medication matches our schema
  //         medications = medications.map((med) => {
  //           // Ensure each medication has at least a name property
  //           if (!med.name && typeof med === "string") {
  //             return { name: med };
  //           }
  //           return med;
  //         });
  //       } catch (e) {
  //         console.log("Parsing error:", e);
  //         // If parsing fails, treat it as a simple string medication name
  //         medications = [{ name: user.medicalHistory.currentMedications }];
  //       }
  //     }

  //     // Process reportData with proper schema
  //     let reportData: ReportDataItem[] = [];
  //     if (user.medicalHistory?.reportData) {
  //       const reportsArray = Array.isArray(user.medicalHistory.reportData)
  //         ? user.medicalHistory.reportData
  //         : [user.medicalHistory.reportData];

  //       reportData = reportsArray.map((report) => {
  //         // If it's already a properly structured object
  //         if (
  //           typeof report === "object" &&
  //           report !== null &&
  //           // @ts-ignore
  //           !isObjectLiteral(report)
  //         ) {
  //           return report;
  //         }
  //         // If it's a string that might be JSON
  //         else if (typeof report === "string" && report !== "[object Object]") {
  //           try {
  //             return JSON.parse(report);
  //           } catch (e) {
  //             console.log("Parsing error:", e);
  //             // Not valid JSON, store as raw text with a type
  //             return {
  //               type: "Unknown",
  //               raw: report,
  //             };
  //           }
  //         }
  //         // Handle "[object Object]" issue
  //         else if (
  //           report === "[object Object]" ||
  //           // @ts-ignore
  //           report?.raw === "[object Object]"
  //         ) {
  //           // This indicates a previous serialization issue
  //           // Return an empty object that follows our schema
  //           return {
  //             type: "Unknown",
  //             note: "Data serialization error",
  //           };
  //         }
  //         // Fallback
  //         return {
  //           type: "Unknown",
  //           raw: String(report),
  //         };
  //       });
  //     }

  //     // Construct medical data using our schema
  //     const userMedicalData: UserMedicalData = {
  //       age: user.age,
  //       gender: user.gender,
  //       bloodGroup: user.bloodGroup,
  //       medications,
  //       allergies: user.medicalHistory?.allergies || [],
  //       chronicDiseases: user.medicalHistory?.chronicDiseases || [],
  //       pastSurgeries: user.medicalHistory?.pastSurgeries || [],
  //       smoking: user.medicalHistory?.smoking || false,
  //       alcoholConsumption: user.medicalHistory?.alcoholConsumption || false,
  //       reportData,
  //     };

  //     // For debugging - inspect the structure
  //     console.log(
  //       "Processed medical data:",
  //       JSON.stringify(userMedicalData, null, 2)
  //     );

  //     const drugInteractionResult = await drugInteraction(
  //       JSON.stringify(userMedicalData)
  //     );

  //     return httpResponse(
  //       req,
  //       res,
  //       EResponseStatusCode.OK,
  //       "Drug interaction data fetched successfully",
  //       {
  //         result: drugInteractionResult,
  //       }
  //     );
  //   } catch (error) {
  //     httpError(next, error, req);
  //   }
  // },
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
