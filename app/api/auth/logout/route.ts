import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function POST() {
  const sessionId = cookies().get("slns-session")?.value;
  await deleteSession(sessionId);

  const response = NextResponse.json({ ok: true });
  response.cookies.set("slns-session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });

  return response;
}
