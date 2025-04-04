import { NextFunction, Request, Response } from "express";
import httpResponse from "../utils/httpResponse";
import { EResponseStatusCode } from "../constant/application";
import httpError from "../utils/httpError";
import quicker from "../utils/quicker";
import dayjs from "dayjs";

export default {

  health: (req: Request, res: Response, next: NextFunction) => {
    try {
      const healthData = {
        application: quicker.getApplicationHealth(),
        system: quicker.getSystemHealth(),
        time: dayjs(new Date().toISOString()).format("YYYY-MM-DD HH:mm:ss"),
      };
      httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Health Check",
        healthData
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },
};
