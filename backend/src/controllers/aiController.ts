import { NextFunction, Request, Response } from "express";
import { EResponseStatusCode } from "../constant/application";
import httpError from "../utils/httpError";
import httpResponse from "../utils/httpResponse";

export default {
  self: (req: Request, res: Response, next: NextFunction) => {
    try {
      httpResponse(req, res, EResponseStatusCode.OK, "Hello World", {
        name: "Mayank Tiwari",
      });
    } catch (error) {
      httpError(next, error, req);
    }
  },
};
