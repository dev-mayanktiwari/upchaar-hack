import { Router } from "express";
import hospitalController from "../controllers/hospitalController";

const hospitalRouter = Router();

hospitalRouter.get("/test", hospitalController.self);
hospitalRouter.post("/register", hospitalController.registerHospital);
hospitalRouter.get("/get-all-hospitals", hospitalController.getAllHospitals);

export default hospitalRouter;
