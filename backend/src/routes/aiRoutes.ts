import { Router } from "express";
import aiController from "../controllers/aiController";
import authMiddleware from "../middlewares/middleware";

const aiRouter = Router();

aiRouter.get("/test", aiController.self);
aiRouter.post(
  "/check-medicine-availability",
  authMiddleware,
  aiController.checkMedicineAvailability
);
aiRouter.post(
  "/medicine-interaction/:userId",
  aiController.medicineInteraction
);
aiRouter.post(
  "/medicine-interaction-protected",
  authMiddleware,
  aiController.medicineInteraction
);

export default aiRouter;
