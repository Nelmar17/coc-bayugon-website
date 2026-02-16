export const runtime = "nodejs";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRY = "7d";

export type Role = "admin" | "editor" | "viewer" | "content_manager";

export type JwtPayload = {
  userId: string;
  email: string;
  role: Role;
};

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function getUserFromToken(token?: string | null) {
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;

  return prisma.user.findUnique({ where: { id: decoded.userId } });
}
