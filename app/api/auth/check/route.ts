import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token");

  if (token) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false });
}
