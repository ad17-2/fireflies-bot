import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
  };
}

export interface UserJwtPayload extends JwtPayload {
  userId: string;
  email: string;
}

export interface Register {
  email: string;
  password: string;
  name: string;
}

export interface Login {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
}

export interface RegisterResult {
  email: string;
  name: string;
}
