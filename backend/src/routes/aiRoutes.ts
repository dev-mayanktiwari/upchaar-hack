import { Router } from "express";
import aiController from "../controllers/aiController";

const aiRouter = Router();

aiRouter.get("/test", aiController.self);

export default aiRouter;
