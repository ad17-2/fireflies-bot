import { Request, Response } from "express";
import * as authService from "../../services/auth.service";
import {
  registerHandler,
  loginHandler,
} from "../../controller/auth.controller";

jest.mock("../../services/auth.service");

describe("Auth Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("registerHandler", () => {
    const mockRegisterData = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    };

    it("should register user successfully", async () => {
      mockRequest.body = mockRegisterData;

      (authService.registerUser as jest.Mock).mockResolvedValue({
        email: mockRegisterData.email,
        name: mockRegisterData.name,
      } as never);

      await registerHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User created successfully",
        data: {
          email: mockRegisterData.email,
          name: mockRegisterData.name,
        },
      });
    });

    it("should return 400 if user already exists", async () => {
      mockRequest.body = mockRegisterData;

      (authService.registerUser as jest.Mock).mockResolvedValue(null as never);

      await registerHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User with this email already exists",
      });
    });

    it("should handle registration error", async () => {
      mockRequest.body = mockRegisterData;

      const mockError = new Error("Database error");
      (authService.registerUser as jest.Mock).mockRejectedValue(
        mockError as never
      );

      await registerHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Database error",
      });
    });

    it("should handle unknown registration error", async () => {
      mockRequest.body = mockRegisterData;

      (authService.registerUser as jest.Mock).mockRejectedValue(
        "Unknown error" as never
      );

      await registerHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("loginHandler", () => {
    const mockLoginData = {
      email: "test@example.com",
      password: "password123",
    };

    const mockToken = "mock-jwt-token";

    it("should login user successfully", async () => {
      mockRequest.body = mockLoginData;

      (authService.loginUser as jest.Mock).mockResolvedValue({
        token: mockToken,
      } as never);

      await loginHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Login successful",
        data: {
          token: mockToken,
        },
      });
    });

    it("should return 401 for invalid credentials", async () => {
      mockRequest.body = mockLoginData;

      (authService.loginUser as jest.Mock).mockResolvedValue(null as never);

      await loginHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid credentials",
      });
    });

    it("should handle login error", async () => {
      mockRequest.body = mockLoginData;

      const mockError = new Error("Database error");
      (authService.loginUser as jest.Mock).mockRejectedValue(
        mockError as never
      );

      await loginHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Database error",
      });
    });

    it("should handle unknown login error", async () => {
      mockRequest.body = mockLoginData;

      (authService.loginUser as jest.Mock).mockRejectedValue(
        "Unknown error" as never
      );

      await loginHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });

    it("should handle missing credentials", async () => {
      mockRequest.body = {};

      const mockError = new Error("Missing credentials");
      (authService.loginUser as jest.Mock).mockRejectedValue(
        mockError as never
      );

      await loginHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Missing credentials",
      });
    });
  });
});
