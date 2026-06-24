import { Request, Response } from "express";
import { RegisterInput, LoginInput } from "../schemas/auth.schema";
import { AuthError, loginUser, registerUser } from "../services/auth.service";

export async function register(req: Request, res: Response) {
  try {
    const result = await registerUser(req.body as RegisterInput);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await loginUser(req.body as LoginInput);
    res.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    throw error;
  }
}
