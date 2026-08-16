import { type Request, type Response } from "express";
import { registerUser } from "../services/auth.service.js";

export async function register(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const user = await registerUser({
      name,
      email,
      password,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}