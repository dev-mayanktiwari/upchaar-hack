import { Router } from "express";
import doctorController from "../controllers/doctorController";

const doctorRouter = Router();

doctorRouter.get("/test", doctorController.self);
doctorRouter.post("/addLeave", doctorController.addLeave);


export default doctorRouter;
