import { Request, NextFunction, Response } from "express";
import AuthenticatedRequest from "../types/expressRequest";
import httpError from "../utils/httpError";
import { EErrorStatusCode } from "../constant/application";
import jwt from "jsonwebtoken";
import { AppConfig } from "../config";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const request = req as AuthenticatedRequest;
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return httpError(
      next,
      new Error("Unauthorized: No token provided"),
      req,
      EErrorStatusCode.UNAUTHORIZED
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const secretKey =
      (AppConfig.get("ACCESS_TOKEN_SECRET") as string) ||
      process.env.ACCESS_TOKEN_SECRET;
    if (!secretKey) {
      return httpError(
        next,
        new Error("Server error: Missing JWT secret"),
        req,
        EErrorStatusCode.INTERNAL_SERVER_ERROR
      );
    }

    const decoded = jwt.verify(token, secretKey) as { id: string } | null;

    if (!decoded?.id) {
      return httpError(
        next,
        new Error("Invalid token: Missing user ID"),
        req,
        EErrorStatusCode.UNAUTHORIZED
      );
    }

    request.id = decoded.id;
    next();
  } catch (error) {
    return httpError(
      next,
      new Error("Token verification failed"),
      req,
      EErrorStatusCode.UNAUTHORIZED
    );
  }
};

export default authMiddleware;
