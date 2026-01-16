"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Moon, Sun } from "lucide-react";

export default function FirstAdminPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else if (theme === "light") {
      setIsDark(false);
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/first-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Admin kullanıcı oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Kullanıcı oluşturulamadı");
      }
    } catch (err) {
      setError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">İlk Admin Kurulumu</h1>
            <Button variant="outline" size="sm" onClick={toggleTheme} className="rounded-full">
              {isDark ? (
                <>
                  <Sun className="h-4 w-4 mr-1" />
                  Light
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-1" />
                  Dark
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Sistemde henüz admin kullanıcı yok. İlk admin kullanıcıyı oluşturun.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {error && <div className="text-sm text-red-500 text-center">{error}</div>}

            {success && <div className="text-sm text-green-500 text-center">{success}</div>}

            <Button
              type="submit"
              className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg border-2 border-primary"
              disabled={loading}
            >
              {loading ? "Oluşturuluyor..." : "Admin Oluştur"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Zaten admin var mı?{" "}
              <a href="/login" className="text-primary hover:underline">
                Giriş yapın
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
