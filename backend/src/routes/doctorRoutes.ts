import { Router } from "express";
import doctorController from "../controllers/doctorController";

const doctorRouter = Router();

doctorRouter.get("/test", doctorController.self);
doctorRouter.post("/addLeave", doctorController.addLeave);
doctorRouter.get("/get-available-slots/:doctorId", doctorController.getWeeklySchedule);
doctorRouter.get(
  "/get-doctor-details/:doctorId",
  doctorController.getDoctorDetails
);

export default doctorRouter;
