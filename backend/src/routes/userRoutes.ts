import { Router } from "express";
import userController from "../controllers/userController";
import authMiddleware from "../middlewares/middleware";

const userRouter = Router();

userRouter.get("/test", userController.check);
userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);
userRouter.post(
  "/book-appointment",
  authMiddleware,
  userController.bookAppointment
);
userRouter.get(
  "/check-appointment/:appointmentId",
  authMiddleware,
  userController.trackAppointment
);
userRouter.get(
  "/get-appointments",
  authMiddleware,
  userController.getAppointments
);
userRouter.get("/self/:userId", userController.self);
userRouter.get("/get-presigned-url", userController.getPresignedUrl);
userRouter.get(
  "/drug-interaction",
  authMiddleware,
  userController.drugInteraction
);
userRouter.post(
  "/upload-medication",
  authMiddleware,
  userController.addMedication
);

export default userRouter;
