import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { Device } from "../types";
import { useLive } from "../hooks/useLive";
import type { AppCtx } from "../hooks/useApp";
import { Dot, Logo } from "./ui";

export default function Layout() {
  const { user, ready, logout } = useAuth();
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [open, setOpen] = useState(false);
  const device = devices?.[0] ?? null;
  const state = useLive(device?.id);

  useEffect(() => { if (user) api<Device[]>("/api/devices").then(setDevices).catch(() => setDevices([])); }, [user]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  if (!ready) return null;
  if (!user) return <Navigate to="/masuk" replace />;

  const online = state.live?.online ?? false;
  const link = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-4 py-[9px] text-sm font-medium leading-[1.2] ${isActive ? "bg-graphite text-white shadow-hair" : "text-cloud hover:text-white"}`;
  const menuLink = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3.5 py-3 text-[15px] font-medium leading-[1.2] ${isActive ? "bg-graphite text-white shadow-hair" : "text-cloud hover:text-white"}`;

  return (
    <>
      <header className="relative mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-6 pb-2 pt-[22px]">
        <Logo />
        <nav className="hidden gap-1.5 md:flex">
          <NavLink to="/" end className={link}>Dashboard</NavLink>
          <NavLink to="/riwayat" className={link}>Riwayat</NavLink>
          <NavLink to="/perangkat" className={link}>Perangkat</NavLink>
        </nav>
        <div className="flex items-center gap-2.5">
          {device && <span className="pill whitespace-nowrap"><Dot tone={online ? "live" : "off"} /><span className="sm:hidden">{online ? "Online" : "Offline"}</span><span className="hidden sm:inline">{online ? "Perangkat online" : "Perangkat offline"}</span></span>}
          <button className="btn btn-ghost hidden md:inline-flex" onClick={logout}>Keluar</button>
          <button
            className="btn btn-ghost h-[38px] w-[38px] p-0! md:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open} aria-controls="menu-mobile"
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              {open ? <path d="M4 4l10 10M14 4L4 14" /> : <path d="M3 5h12M3 9h12M3 13h12" />}
            </svg>
          </button>
        </div>

        {open && (
          <div id="menu-mobile" className="absolute inset-x-6 top-full z-20 mt-2 rounded-xl bg-obsidian p-2 shadow-hair md:hidden">
            <NavLink to="/" end className={menuLink} onClick={() => setOpen(false)}>Dashboard</NavLink>
            <NavLink to="/riwayat" className={menuLink} onClick={() => setOpen(false)}>Riwayat</NavLink>
            <NavLink to="/perangkat" className={menuLink} onClick={() => setOpen(false)}>Perangkat</NavLink>
            <div className="my-2 border-t border-ash" />
            <button className="block w-full rounded-lg px-3.5 py-3 text-left text-[15px] font-medium leading-[1.2] text-cloud hover:text-white" onClick={() => { setOpen(false); logout(); }}>Keluar</button>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-[1200px] px-6 pb-12">
        <Outlet context={{ devices, device, state } satisfies AppCtx} />
        <p className="pt-10 text-xs text-fog">Masuk sebagai {user.nama}</p>
      </main>
    </>
  );
}