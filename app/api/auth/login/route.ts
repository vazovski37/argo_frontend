import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/api/client";
import { setAuthToken } from "@/lib/api/cookies";
import { LoginRequestSchema } from "@/lib/schemas/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parseResult = LoginRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;

    // Call Flask backend
    const result = await login(email, password);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    // Set auth token in httpOnly cookie
    if (result.data?.token) {
      await setAuthToken(result.data.token);
    }

    // Return user data (without token - it's in the cookie)
    return NextResponse.json({
      user: result.data?.user,
    });
  } catch (error) {
    console.error("[API] Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

