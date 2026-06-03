import { NextResponse } from "next/server";
import { registerCustomer } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { identifier, password } = (await request.json()) as { identifier?: string; password?: string };
    const result = await registerCustomer(identifier ?? "", password ?? "");
    const response = NextResponse.json({ user: result.user }, { status: 201 });

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
      { message: error instanceof Error ? error.message : "Unable to create account." },
      { status: 400 }
    );
  }
}
