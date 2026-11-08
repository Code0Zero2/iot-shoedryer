import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoginDiagram from "../components/LoginDiagram";
import { Logo } from "../components/ui";

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    try { await login(email.trim(), password); }
    catch (err) { setError(err instanceof Error ? err.message : "Gagal masuk, coba lagi"); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6">
      <header className="flex items-center justify-between pb-2 pt-[22px]">
        <Logo />
        <a className="btn btn-ghost" href="mailto:scienceninja9@gmail.com?subject=Akses%20Smart%20Shoe%20Dryer">Butuh akses?</a>
      </header>
      <div className="grid items-center gap-10 py-10 lg:min-h-[760px] lg:grid-cols-[1fr_640px] lg:py-0">
        <section className="lg:pr-6">
          <span className="badge">Smart Shoe Deodorizer &amp; Dryer</span>
          <h1 className="mt-[22px] text-[44px] font-light leading-[1.1] tracking-[-0.016em] text-white sm:text-6xl lg:text-[62px]">
            Sepatu kering, bau hilang, tanpa <em className="not-italic text-live">menebak</em> lamanya.
          </h1>
          <p className="mt-6 max-w-[46ch] text-base text-silver">
            Masuk untuk melihat suhu dan kelembapan secara langsung, memilih mode 45 atau 50 °C, dan memulai ulang sesi dari mana saja.
          </p>
        </section>
        <section className="relative lg:h-[640px] lg:w-[640px]">
          <LoginDiagram />
          <form onSubmit={submit} className="w-full max-w-[400px] rounded-xl bg-obsidian p-8 shadow-hair lg:absolute lg:left-[150px] lg:top-[130px] lg:w-[340px] lg:max-w-none lg:shadow-[inset_0_0_0_.5px_rgba(255,255,255,.1),0_0_0_14px_#000]">
            <h2 className="text-xl font-medium leading-[1.29] tracking-[-0.02em] text-white">Masuk ke dashboard</h2>
            <div className="mt-[18px]">
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required autoComplete="username" className="input" placeholder="nama@kampus.ac.id" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mt-[18px]">
              <label className="label" htmlFor="password">Kata sandi</label>
              <input id="password" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p role="alert" className="mt-4 text-[13px] leading-normal text-white">{error}</p>}
            <button type="submit" disabled={busy} className="btn btn-primary mt-[26px] w-full">{busy ? "Memeriksa..." : "Masuk"}</button>
            <p className="mt-[18px] text-[13px] leading-normal text-smoke">Akun dibuat oleh admin. Belum punya akses? Hubungi tim pengelola alat.</p>
          </form>
        </section>
      </div>
    </div>
  );
}