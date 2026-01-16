import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { username, password } = await request.json();

    // Kullanıcıyı bul
    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı" }, { status: 401 });
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı" }, { status: 401 });
    }

    // Session oluştur (basit token)
    const token = Buffer.from(`${user._id}:${Date.now()}`).toString("base64");

    const response = NextResponse.json({ message: "Giriş başarılı", username: user.username }, { status: 200 });

    // Cookie'ye token ekle
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
