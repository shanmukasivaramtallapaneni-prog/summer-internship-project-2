import bcrypt from "bcryptjs";

import { prisma } from "../utils/prisma";
import { signToken, toPublicUser } from "../utils/jwt";
import { LoginInput, RegisterInput } from "../schemas/auth.schema";

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existing) {
    throw new AuthError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      passwordHash,
      role: "USER",
    },
  });

  const token = signToken({ userId: user.id, role: user.role });

  return {
    token,
    user: toPublicUser(user),
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    throw new AuthError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);

  if (!valid) {
    throw new AuthError("Invalid email or password", 401);
  }

  const token = signToken({ userId: user.id, role: user.role });

  return {
    token,
    user: toPublicUser(user),
  };
}
