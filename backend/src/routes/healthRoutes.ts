import { Router } from "express";
import healthController from "../controllers/healthController";

const healthRouter = Router();

healthRouter.get("/", healthController.health);

export default healthRouter;
