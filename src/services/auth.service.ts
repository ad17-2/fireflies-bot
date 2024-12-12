import { User } from "../models/user.model";
import {
  Login,
  Register,
  RegisterResult,
  UserJwtPayload,
} from "../types/auth.types";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const generateToken = (payload: UserJwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

export const registerUser = async (
  userData: Register
): Promise<RegisterResult | null> => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    return null;
  }

  const user = new User(userData);
  await user.save();

  return {
    email: user.email,
    name: user.name,
  };
};

export const loginUser = async (
  credentials: Login
): Promise<{ token: string } | null> => {
  const user = await User.findOne({ email: credentials.email });
  if (!user) {
    return null;
  }

  const isMatch = await user.comparePassword(credentials.password);
  if (!isMatch) {
    return null;
  }

  const payload: UserJwtPayload = {
    userId:
      user._id instanceof Types.ObjectId
        ? user._id.toString()
        : String(user._id),
    email: user.email,
  };

  const token = generateToken(payload);

  return {
    token,
  };
};
