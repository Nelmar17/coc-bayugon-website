// lib/auth-edge.ts
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export type EdgeJwtPayload = {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
};

export async function verifyEdgeToken(token: string): Promise<EdgeJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as EdgeJwtPayload;
  } catch {
    return null;
  }
}
