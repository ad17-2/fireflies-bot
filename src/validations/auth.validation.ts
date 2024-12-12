import * as yup from "yup";

export const registerSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required")
    .trim(),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("Password is required"),
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .required("Name is required")
    .trim(),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required")
    .trim(),
  password: yup.string().required("Password is required"),
});
