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
        return httpError(
          next,
          new Error("Unauthenticated. Doctor ID is required"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }

      const { leaveDate, reason } = req.body;

      if (!leaveDate || !reason) {
        return httpError(
          next,
          new Error("Leave date or reason is missing"),
          req,
          EErrorStatusCode.BAD_REQUEST
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

  getDoctorDetails: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = req.params.doctorId || (req as AuthenticatedRequest).id;

      if (!doctorId) {
        return httpError(
          next,
          new Error("Doctor ID is required"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }

      const doctor = await doctorDbServices.getDoctorById(doctorId);

      if (!doctor) {
        return httpError(
          next,
          new Error("Doctor not found"),
          req,
          EErrorStatusCode.NOT_FOUND
        );
      }

      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Doctor details fetched successfully",
        doctor
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  getWeeklySchedule: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const doctorId = req.params.doctorId || (req as AuthenticatedRequest).id;

      if (!doctorId) {
        return httpError(
          next,
          new Error("Doctor ID is required"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }

      // Get the starting date (today or specified date)
      const startDate = req.query.startDate
        ? quicker.parsedDate(req.query.startDate as string)
        : new Date();

      // console.log("Start Date:", startDate);
      // Calculate the end date (7 days from start date)
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      // console.log("End Date:", endDate);

      // Get doctor's schedule, appointments and leave dates for the week
      const doctorSchedule = await doctorDbServices.getDoctorSchedule(
        doctorId,
        startDate,
        endDate
      );

      // console.log("Doctor Schedule:", doctorSchedule);

      const doctorAppointments = await doctorDbServices.getDoctorAppointments(
        doctorId,
        startDate,
        endDate
      );

      // console.log("Doctor Appointments:", doctorAppointments);

      const leaveDates = await doctorDbServices.getLeaveDates(
        doctorId,
        startDate,
        endDate
      );

      // console.log("Leave Dates:", leaveDates);

      const cleanStart = quicker.cleanDateToYYYYMMDD(String(startDate));
      const cleanEnd = quicker.cleanDateToYYYYMMDD(String(endDate));

      // console.log("Clean Start Date:", cleanStart);
      // console.log("Clean End Date:", cleanEnd);
      
      const weeklySchedule = quicker.getAvailableSlots(
        cleanStart,
        cleanEnd,
        doctorSchedule,
        doctorAppointments,
        leaveDates
      );

      if (!weeklySchedule) {
        return httpError(
          next,
          new Error("No schedule found for the specified week"),
          req,
          EErrorStatusCode.NOT_FOUND
        );
      }

      // Return the weekly schedule
      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Weekly schedule fetched successfully",
        weeklySchedule
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },
};
