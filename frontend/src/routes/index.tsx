import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useLayoutEffect } from "react";
import { ArrowRight, CheckCircle2, ListChecks, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

/**
 * Route '/' (Login & Register).
 * Memiliki `beforeLoad` guard yang mencegah akses jika token sudah ada di SSR.
 */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      throw redirect({ to: "/tasks" });
    }
  },
  head: () => ({
    meta: [
      { title: "Tinggo — Ticket Kanggo" },
      {
        name: "description",
        content:
          "Sistem Manajemen Tugas (Tinggo).",
      },
      { property: "og:title", content: "Tinggo — Ticket Kanggo" },
      {
        property: "og:description",
        content:
          "Sistem Manajemen Tugas (Tinggo).",
      },
    ],
  }),
  component: AuthPage,
});

const SPECS = [
  {
    icon: ShieldCheck,
    label: "JWT + bcrypt",
    note: "Register, login, logout, route terproteksi",
  },
  {
    icon: ListChecks,
    label: "CRUD tugas",
    note: "Judul, deskripsi, status, deadline",
  },
  {
    icon: CheckCircle2,
    label: "Filter status",
    note: "pending · in-progress · done",
  },
];

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  /**
   * Route Guard Klien: Mencegah flicker (kilasan) antarmuka.
   * Jika pengguna sudah memiliki sesi aktif, lemparkan langsung ke '/tasks' sebelum komponen digambar.
   */
  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("token")) {
        navigate({ to: "/tasks", replace: true });
      } else {
        setIsMounted(true);
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isRegister) {
        // Validasi ekstra di klien sebelum dikirim ke server untuk menghemat resource (bandwidth/CPU server)
        if (password !== confirmPassword) {
          toast.error("Konfirmasi kata sandi tidak cocok.");
          setIsLoading(false);
          return;
        }
        await api.post("/auth/register", { name, email, password });
        toast.success("Akun berhasil dibuat. Silakan masuk.");
        setMode("login");
      } else {
        const response = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", response.data.data.token);
        // Save user detail if needed: localStorage.setItem("user", JSON.stringify({ email }));
        navigate({ to: "/tasks" });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative overflow-hidden bg-ink px-8 py-14 text-primary-foreground sm:px-14 lg:border-r lg:border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-ember/25 blur-3xl"
        />
        <div className="relative flex h-full max-w-xl flex-col justify-center gap-10">
          <p className="label-eyebrow text-primary-foreground/50">Kanggo · Technical Test</p>
          <img src="/logo.png" alt="Tinggo Logo" className="h-16 w-16 mb-2" />

          <h1 className="text-[2.25rem] font-semibold leading-[1.05] sm:text-6xl">
            Satu papan kerja,
            <br />
            <span className="text-ember">nol tugas terlupa.</span>
          </h1>

          <p className="max-w-md text-sm leading-relaxed text-primary-foreground/70">
            Tinggo adalah sistem antarmuka untuk manajemen tugas (Ticket Kanggo). Semua alur inti — auth,
            CRUD, filter, sorting, pencarian — dapat dicoba langsung.
          </p>

          <ul className="max-w-md">
            {SPECS.map((spec) => (
              <li
                key={spec.label}
                className="flex items-center gap-3 border-t border-primary-foreground/10 py-3.5 last:border-b"
              >
                <spec.icon className="size-4 shrink-0 text-ember" aria-hidden />
                <span className="font-display text-sm font-medium">{spec.label}</span>
                <span className="ml-auto text-right text-[11px] text-primary-foreground/50 sm:text-xs">
                  {spec.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm space-y-8">
          <div className="inline-flex rounded-full border border-border bg-secondary p-1">
            {(["login", "register"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={cn(
                  "rounded-full px-4 py-1.5 font-display text-xs font-medium capitalize transition-colors",
                  mode === value ? "bg-ink text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {value}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">
              {isRegister ? "Buat akun baru" : "Masuk ke papan kerja"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isRegister
                ? "Isi data diri Anda di bawah ini. Password akan di-hash dan dienkripsi sebelum tersimpan di database."
                : "Akses papan kerja dan kelola tugas Anda. Pastikan kredensial Anda valid."}
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            {isRegister ? (
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input 
                  id="name" 
                  placeholder="Masukkan nama lengkap Anda" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required={isRegister} 
                  className="placeholder:text-muted-foreground/60"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email">Alamat Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="contoh: nama@perusahaan.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder={isRegister ? "Min. 6 karakter" : "Masukkan kata sandi Anda"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  minLength={isRegister ? 6 : undefined}
                  className="placeholder:text-muted-foreground/60 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {isRegister && (
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Gunakan minimal 6 karakter.
                </p>
              )}
            </div>

            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Masukkan ulang kata sandi Anda" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    minLength={6}
                    className="placeholder:text-muted-foreground/60 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? "Memproses..." : (isRegister ? "Daftar & masuk" : "Masuk")}
              {!isLoading && <ArrowRight className="size-4" aria-hidden />}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            Terintegrasi langsung dengan backend Express & MySQL Kanggo.
          </p>
        </div>
      </section>
    </main>
  );
}
