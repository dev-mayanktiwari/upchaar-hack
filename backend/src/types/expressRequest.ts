import { Request } from "express";

interface AuthenticatedRequest extends Request {
  id: string;
}

export default AuthenticatedRequest;
