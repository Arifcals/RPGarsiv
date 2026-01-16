import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { username, password } = await request.json();

    // Sistemde herhangi bir kullanıcı var mı kontrol et
    const existingUsers = await User.countDocuments();

    if (existingUsers > 0) {
      return NextResponse.json(
        { error: "Kullanıcı zaten var. Sistem sadece bir admin kullanıcıya izin verir." },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // İlk admin kullanıcıyı oluştur
    const user = await User.create({
      username,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "Admin kullanıcı başarıyla oluşturuldu", username: user.username },
      { status: 201 }
    );
  } catch (error) {
    console.error("First admin error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
