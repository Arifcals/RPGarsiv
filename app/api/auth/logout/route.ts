import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Çıkış başarılı" }, { status: 200 });

  response.cookies.delete("admin-token");

  return response;
}
