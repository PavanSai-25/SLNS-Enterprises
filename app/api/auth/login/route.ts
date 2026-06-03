import { NextResponse } from "next/server";
import { loginUser } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { identifier, password } = (await request.json()) as { identifier?: string; password?: string };
    const result = await loginUser(identifier ?? "", password ?? "");
    const response = NextResponse.json({ user: result.user });

    response.cookies.set("slns-session", result.sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to log in." },
      { status: 401 }
    );
  }
}
