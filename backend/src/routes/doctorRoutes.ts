import { Router } from "express";
import doctorController from "../controllers/doctorController";
import authMiddleware from "../middlewares/middleware";

const doctorRouter = Router();

doctorRouter.get("/test", doctorController.self);
doctorRouter.post("/addLeave", authMiddleware, doctorController.addLeave);
doctorRouter.get(
  "/get-available-slots/:doctorId",
  doctorController.getWeeklySchedule
);
doctorRouter.get(
  "/get-doctor-details/:doctorId",
  doctorController.getDoctorDetails
);
doctorRouter.post("/login", doctorController.login);

export default doctorRouter;
