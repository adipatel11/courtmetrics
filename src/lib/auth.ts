import bcrypt from "bcryptjs";
import { createHmac, randomBytes } from "crypto";

const SALT_ROUNDS = 12;
export const SESSION_COOKIE = "cm_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET env var is required for auth sessions");
  }
  return secret;
}

export async function hashPassword(plain: string) {
  if (!plain || plain.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string) {
  if (!plain || !hash) return false;
  return bcrypt.compare(plain, hash);
}

type SessionPayload = {
  email: string;
  nonce: string;
  issuedAt: number;
};

export function createSessionToken(email: string) {
  const payload: SessionPayload = {
    email,
    nonce: randomBytes(16).toString("hex"),
    issuedAt: Date.now(),
  };
  const secret = getSessionSecret();
  const payloadBuffer = Buffer.from(JSON.stringify(payload), "utf8");
  const signature = createHmac("sha256", secret)
    .update(payloadBuffer)
    .digest("base64url");
  const token = `${payloadBuffer.toString("base64url")}.${signature}`;
  return { token, payload };
}

export function readSessionToken(token: string): SessionPayload | null {
  if (!token?.includes(".")) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  try {
    const payloadBuffer = Buffer.from(encodedPayload, "base64url");
    const payloadString = payloadBuffer.toString("utf8");
    const payload = JSON.parse(payloadString) as SessionPayload;
    const secret = getSessionSecret();
    const expectedSig = createHmac("sha256", secret)
      .update(payloadBuffer)
      .digest("base64url");

    if (expectedSig !== signature) return null;
    if (Date.now() - payload.issuedAt > SESSION_TTL_MS) return null;
    if (!payload.email) return null;
    return payload;
  } catch {
    return null;
  }
}
