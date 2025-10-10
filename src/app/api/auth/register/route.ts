import { NextResponse } from "next/server";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { createUser, normalizeEmail } from "@/lib/userRepository";
import { createSessionToken, hashPassword, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    const hashedPassword = await hashPassword(password);
    const normalizedEmail = normalizeEmail(email);
    await createUser({ email: normalizedEmail, hashedPassword });

    const { token } = createSessionToken(normalizedEmail);
    const response = NextResponse.json({ email: normalizedEmail }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err) {
    console.error("Register route error", err);
    if (err instanceof ConditionalCheckFailedException) {
      return NextResponse.json(
        { error: "An account with that email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Unable to create account" },
      { status: 500 }
    );
  }
}
