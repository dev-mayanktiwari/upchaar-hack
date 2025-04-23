import { Router } from "express";
import hospitalController from "../controllers/hospitalController";

const hospitalRouter = Router();

// hospitalRouter.get("/test", hospitalController.self);
hospitalRouter.post("/register", hospitalController.registerHospital);
hospitalRouter.put(
  "/update-department-head",
  hospitalController.setDepartmentHead
);
hospitalRouter.put(
  "/update-doctor-schedule",
  hospitalController.addDoctorSchedule
);
hospitalRouter.get("/get-all-hospitals", hospitalController.getAllHospitals);

export default hospitalRouter;
