import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { WebResponse } from "../types/response.type";
import { Login, LoginResult, RegisterResult } from "../types/auth.types";

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const result = await registerUser(req.body);

    if (!result) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const response: WebResponse<RegisterResult> = {
      message: "User created successfully",
      data: result,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body);

    if (!result) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const response: WebResponse<LoginResult> = {
      message: "Login successful",
      data: result,
    };

    res.json(response);
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
