import { NextFunction, Request, Response } from "express";
import { EErrorStatusCode, EResponseStatusCode } from "../constant/application";
import httpError from "../utils/httpError";
import httpResponse from "../utils/httpResponse";
import AuthenticatedRequest from "../types/expressRequest";
import doctorDbServices from "../services/doctorDbServices";
import quicker from "../utils/quicker";

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

  addLeave: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = (req as AuthenticatedRequest).id;

      if (!doctorId) {
        return httpResponse(
          req,
          res,
          EErrorStatusCode.BAD_REQUEST,
          "Unauthenticated. Doctor ID is required"
        );
      }
      const { leaveDate, reason } = req.body;

      if (!leaveDate || !reason) {
        return httpResponse(
          req,
          res,
          EErrorStatusCode.BAD_REQUEST,
          "Leave date or reason is missing"
        );
      }

      const parsedDate = quicker.parsedDate(leaveDate);
      const updatedLeaveData = await doctorDbServices.addLeaveDate(
        doctorId,
        parsedDate,
        reason
      );

      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Leave date added successfully",
        updatedLeaveData
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },
};
