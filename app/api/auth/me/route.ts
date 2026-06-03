import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserBySession } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function GET() {
  const sessionId = cookies().get("slns-session")?.value;
  const user = await getUserBySession(sessionId);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
