import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";
import { UserRole, hasPermission, RolePermissions } from "./rbac";

const JWT_SECRET = process.env.JWT_SECRET || "aurevo_fallback_jwt_secret_123456";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return decoded;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("aurevo_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function logAudit(
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, any>,
  userId?: string,
  userName?: string
) {
  try {
    await db.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
        userId,
        userName,
      },
    });
  } catch (err) {
    console.error("Audit logging error:", err);
  }
}
