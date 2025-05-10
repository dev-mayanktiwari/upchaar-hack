import { NextFunction, Request, Response } from "express";
import { EErrorStatusCode, EResponseStatusCode } from "../constant/application";
import httpError from "../utils/httpError";
import httpResponse from "../utils/httpResponse";
import aiDbServices from "../services/aiDbServices";
import AuthenticatedRequest from "../types/expressRequest";
import { alternateDrugAgent } from "../agents/alternateDrugAgent";
import { medicineInteraction } from "../agents/medicineInteraction";
import userDbServices from "../services/userDbServices";
import logger from "../utils/logger";

export default {
  self: (req: Request, res: Response, next: NextFunction) => {
    try {
      httpResponse(req, res, EResponseStatusCode.OK, "Hello World", {
        name: "Mayank Tiwari",
      });
    } catch (error) {
      httpError(next, error, req);
    }
  },

  checkMedicineAvailability: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { medicineArray } = req.body;

      if (!medicineArray || !Array.isArray(medicineArray)) {
        throw new Error(
          "Invalid input: medicineArray is required and must be an array"
        );
      }

      console.log("Received medicineArray:", medicineArray);

      const unavailableMedicines: string[] = [];

      const docId = (req as AuthenticatedRequest).id;
      const hospitalInfo = await aiDbServices.getHospitalId(docId);

      if (!hospitalInfo?.hospitalId) {
        throw new Error("Hospital ID not found");
      }

      const hospitalId = String(hospitalInfo.hospitalId);
      console.log("Hospital ID:", hospitalId);

      // Use for...of loop for proper async/await handling
      for (const medicine of medicineArray) {
        const isAvailable = await aiDbServices.checkMedicineAvailability(
          medicine.name,
          medicine.strength,
          hospitalId
        );

        console.log(`Availability for ${medicine.name}:`, isAvailable);

        if (!isAvailable) {
          unavailableMedicines.push(
            `${medicine.name} - strength: ${medicine.strength}`
          );
        }
      }

      console.log("Unavailable medicines:", unavailableMedicines);

      const allMedicines = await aiDbServices.getAllMedicines(hospitalId);
      console.log("All medicines in the hospital:", allMedicines);

      const alternativeMedicines = await alternateDrugAgent(
        unavailableMedicines,
        allMedicines
      );

      console.log("Alternative medicines:", alternativeMedicines);

      httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Medicine availability checked",
        {
          unavailableMedicines,
          alternativeMedicines,
        }
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  medicineInteraction: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("Request body:", req.body);
      console.log("Request user:", (req as any).user); // Check if user exists in req
      console.log("Auth header:", req.headers.authorization); // Check auth header

      let userId;
      if (req.params.userId) {
        console.log("Using userId from params:", req.params.userId);
        userId = req.params.userId;
      } else if ((req as AuthenticatedRequest).id) {
        console.log(
          "Using userId from AuthenticatedRequest:",
          (req as AuthenticatedRequest).id
        );
        userId = (req as AuthenticatedRequest).id;
      } else {
        return httpError(
          next,
          new Error("User ID not found in request"),
          req,
          EErrorStatusCode.UNAUTHORIZED
        );
      }
      // const userId = req.params.userId || (req as AuthenticatedRequest).id;
      const medicineArray = req.body.medicineArray;
      const user = await userDbServices.getUserById(userId);
      console.log("User data:", user);

      if (!user) {
        return httpError(
          next,
          new Error("User not found"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }
      // @ts-ignore
      console.log("Medical report data:", user.medicalHistory?.reportData);
      const reportDataJson = JSON.parse(
        user.medicalHistory?.reportData[0] || ""
      );

      // console.log("Report data", reportDataJson);
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

      console.log(
        "Input user medical data for medicine interaction",
        userMedicalData
      );

      const medicineInteractionResult = await medicineInteraction(
        userMedicalData,
        medicineArray
      );

      logger.info("Drug interaction result", {
        meta: {
          data: medicineInteractionResult,
        },
      });

      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Drug interaction data fetched successfully",
        {
          result: medicineInteractionResult,
        }
      );
    } catch (error) {
      console.log("Error in medicine interaction:", error);
      httpError(next, error, req);
    }
  },
};
