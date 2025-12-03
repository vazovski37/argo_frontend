import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/api/cookies";

const FLASK_API_URL = process.env.FLASK_API_URL || "http://localhost:5000/api";

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();

    // Forward to Flask backend
    const response = await fetch(`${FLASK_API_URL}/photos/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Upload failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Upload photo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

