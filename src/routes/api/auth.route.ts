import express from "express";
import { validateRequest } from "../../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../../validations/auth.validation";
import {
  loginHandler,
  registerHandler,
} from "../../controller/auth.controller";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), async (req, res) => {
  registerHandler(req, res);
});
router.post("/login", validateRequest(loginSchema), async (req, res) => {
  loginHandler(req, res);
});

export { router as authRoutes };
