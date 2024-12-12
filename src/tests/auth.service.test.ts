import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { Register, Login } from "../types/auth.types";

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("../models/user.model", () => {
  return {
    User: jest.fn().mockImplementation(() => ({
      email: "",
      name: "",
      save: jest.fn().mockResolvedValue({} as never),
    })),
  };
});

import { registerUser, loginUser } from "../services/auth.service";

interface MockUserDocument {
  _id?: Types.ObjectId | string;
  email: string;
  name: string;
  password?: string;
  comparePassword?: jest.Mock;
  save?: jest.Mock;
}

type MockConstructor = {
  new (): MockUserDocument;
  findOne: jest.Mock;
} & jest.Mock;

const MockUserConstructor = jest.mocked(
  require("../models/user.model").User
) as MockConstructor;

MockUserConstructor.findOne = jest.fn();

describe("Authentication Service", () => {
  const mockEmail = "test@example.com";
  const mockPassword = "password123";
  const mockName = "Test User";
  const mockUserId = new Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    const mockUserData: Register = {
      email: mockEmail,
      password: mockPassword,
      name: mockName,
    };

    it("should register a new user successfully", async () => {
      MockUserConstructor.findOne.mockResolvedValue(null as never);

      const mockUser: MockUserDocument = {
        email: mockEmail,
        name: mockName,
        save: jest
          .fn()
          .mockResolvedValue({ email: mockEmail, name: mockName } as never),
      };
      (MockUserConstructor as jest.Mock).mockImplementation(() => mockUser);

      const result = await registerUser(mockUserData);

      expect(MockUserConstructor.findOne).toHaveBeenCalledWith({
        email: mockEmail,
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({
        email: mockEmail,
        name: mockName,
      });
    });

    it("should return null if user already exists", async () => {
      MockUserConstructor.findOne.mockResolvedValue({
        email: mockEmail,
        name: mockName,
      } as never);

      const result = await registerUser(mockUserData);

      expect(MockUserConstructor.findOne).toHaveBeenCalledWith({
        email: mockEmail,
      });
      expect(result).toBeNull();
    });

    it("should handle registration error", async () => {
      MockUserConstructor.findOne.mockResolvedValue(null as never);

      const mockError = new Error("Database error");
      const mockSave = jest.fn().mockRejectedValue(mockError as never);
      const mockUser: MockUserDocument = {
        email: mockEmail,
        name: mockName,
        save: mockSave,
      };
      (MockUserConstructor as jest.Mock).mockImplementation(() => mockUser);

      await expect(registerUser(mockUserData)).rejects.toThrow(mockError);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe("loginUser", () => {
    const mockCredentials: Login = {
      email: mockEmail,
      password: mockPassword,
    };

    const mockToken = "mock-jwt-token";

    beforeEach(() => {
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
    });

    it("should login user successfully with correct credentials", async () => {
      const mockComparePassword = jest.fn().mockResolvedValue(true as never);
      MockUserConstructor.findOne.mockResolvedValue({
        _id: mockUserId,
        email: mockEmail,
        comparePassword: mockComparePassword,
      } as never);

      const result = await loginUser(mockCredentials);

      expect(MockUserConstructor.findOne).toHaveBeenCalledWith({
        email: mockEmail,
      });
      expect(mockComparePassword).toHaveBeenCalledWith(mockPassword);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUserId.toString(),
          email: mockEmail,
        },
        expect.any(String),
        { expiresIn: "24h" }
      );
      expect(result).toEqual({ token: mockToken });
    });

    it("should return null if user does not exist", async () => {
      MockUserConstructor.findOne.mockResolvedValue(null as never);

      const result = await loginUser(mockCredentials);

      expect(MockUserConstructor.findOne).toHaveBeenCalledWith({
        email: mockEmail,
      });
      expect(result).toBeNull();
    });

    it("should return null if password is incorrect", async () => {
      const mockComparePassword = jest.fn().mockResolvedValue(false as never);
      MockUserConstructor.findOne.mockResolvedValue({
        _id: mockUserId,
        email: mockEmail,
        comparePassword: mockComparePassword,
      } as never);

      const result = await loginUser(mockCredentials);

      expect(MockUserConstructor.findOne).toHaveBeenCalledWith({
        email: mockEmail,
      });
      expect(mockComparePassword).toHaveBeenCalledWith(mockPassword);
      expect(result).toBeNull();
    });

    it("should handle login error", async () => {
      const mockError = new Error("Database error");
      MockUserConstructor.findOne.mockRejectedValue(mockError as never);

      await expect(loginUser(mockCredentials)).rejects.toThrow(mockError);
    });

    it("should handle non-ObjectId _id", async () => {
      const mockStringId = "123456789";
      const mockComparePassword = jest.fn().mockResolvedValue(true as never);
      MockUserConstructor.findOne.mockResolvedValue({
        _id: mockStringId,
        email: mockEmail,
        comparePassword: mockComparePassword,
      } as never);

      const result = await loginUser(mockCredentials);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockStringId,
          email: mockEmail,
        },
        expect.any(String),
        { expiresIn: "24h" }
      );
      expect(result).toEqual({ token: mockToken });
    });

    it("should handle password comparison error", async () => {
      const mockError = new Error("Password comparison failed");
      const mockComparePassword = jest
        .fn()
        .mockRejectedValue(mockError as never);
      MockUserConstructor.findOne.mockResolvedValue({
        _id: mockUserId,
        email: mockEmail,
        comparePassword: mockComparePassword,
      } as never);

      await expect(loginUser(mockCredentials)).rejects.toThrow(mockError);
      expect(mockComparePassword).toHaveBeenCalledWith(mockPassword);
    });
  });
});
