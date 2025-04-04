import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { AppConfig } from "./config";
import healthRouter from "./routes/healthRoutes";
import logger from "./utils/logger";
import userRouter from "./routes/userRoutes";
import aiRouter from "./routes/aiRoutes";
import doctorRouter from "./routes/doctorRoutes";
import hospitalRouter from "./routes/hospitalRoutes";
import { connectRedis, disconnectRedis } from "./utils/redisClient";
import { ResponseMessage } from "./constant/responseMessage";
import httpError from "./utils/httpError";
import globalErrorHandler from "./middlewares/globalErrorHandler";

const app = express();
const PORT = AppConfig.get("PORT") || 3000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: String(AppConfig.get("CORS_ORIGIN")),
    credentials: true,
  })
);

// Routes
app.use("/api/v1/health", healthRouter); // ✅ Fixed missing "/"
app.use("/api/v1/user", userRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/doctor", doctorRouter);
app.use("/api/v1/hospital", hospitalRouter);

app.use((req: Request, _: Response, next: NextFunction) => {
  try {
    throw new Error(ResponseMessage.NOT_FOUND);
  } catch (error) {
    httpError(next, error, req, 404);
  }
});

app.use(globalErrorHandler);

async function startServer() {
  try {
    await connectRedis(); // ✅ Ensure Redis is connected before starting

    app.listen(PORT, () => {
      logger.info("🚀 Server started successfully", {
        meta: {
          PORT: AppConfig.get("PORT") || 3000,
          SERVER_URL: AppConfig.get("SERVER_URL"),
        },
      });
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("Error starting server", {
      meta: { error },
    });
    process.exit(1); // ✅ Exit process if Redis connection fails
  }
}

startServer();

// Handle graceful shutdown (CTRL+C or server exit)
process.on("SIGINT", async () => {
  logger.info("Server shutting down...");
  await disconnectRedis(); // ✅ Clean up Redis before exit
  process.exit(0);
});
