import { NextResponse } from "next/server";
import { clearAuthToken } from "@/lib/api/cookies";

export async function POST() {
  try {
    // Clear the auth token cookie
    await clearAuthToken();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

