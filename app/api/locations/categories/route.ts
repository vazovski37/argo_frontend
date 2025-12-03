import { NextResponse } from "next/server";
import { getLocationCategories } from "@/lib/api/client";

export async function GET() {
  try {
    const result = await getLocationCategories();

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] Get location categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

