// Mode demo: seluruh API dipalsukan di browser (tanpa backend).
// Aktifkan dengan VITE_DEMO=1. Akun: demo@shoedryer.id / demo1234
import type { Live, Sesi } from "../types";

export const DEMO = import.meta.env.VITE_DEMO === "1";
export const DEMO_EMAIL = "demo@shoedryer.id";
const DEMO_PASS = "demo1234";

class DemoError extends Error {
  status: number;
  constructor(m: string, status: number) { super(m); this.status = status; }
}

const MIN = 60000;
let mulai = Date.now() - 20 * MIN;
let target = 45;
let desired = 45;
let uvOff = false;
let sid = 99; // id sesi berjalan; naik tiap restart supaya grafik ikut mulai dari awal
const events: { waktu: string; jenis: string; teks: string }[] = [
  { waktu: new Date(mulai).toISOString(), jenis: "mulai", teks: "Sesi dimulai dengan mode 45 °C" },
];
const addEvent = (jenis: string, teks: string) => events.unshift({ waktu: new Date().toISOString(), jenis, teks });

const hum = (m: number) => Math.max(10, 72 - 41 * Math.pow(Math.min(m, 70) / 53, 0.85) + 0.8 * Math.sin(m * 1.7));
const tmp = (m: number) => (m < 14 ? 28 + (target - 28) * Math.pow(m / 14, 0.9) : target + 0.5 + 1.4 * Math.sin(m * 0.9));

function liveNow(): Live {
  const now = Date.now();
  const m = (now - mulai) / MIN;
  const h = Math.round(hum(m));
  const t = +tmp(m).toFixed(1);
  const heater = t < target;
  return {
    id: "demo01", online: true, lastSeen: now, suhu: t, kelembapan: h, suhuPemanas: heater ? 62 : 48,
    switchMode: 45, desiredMode: desired,
    sesi: { id: sid, mulai: new Date(mulai).toISOString(), suhuTarget: target, kelembapanAwal: 72 },
    aktuator: { pemanas: heater, uv: !uvOff, kipas: true, buzzer: false }, uvManualOff: uvOff, batasKering: 15,
  };
}

const ago = (menit: number) => new Date(Date.now() - menit * MIN).toISOString();
const S = (id: number, lalu: number, tgt: number, st: Sesi["status_akhir"], awal: number, akhir: number | null, dur: number, putus = 0): Sesi => ({
  id, mulai: ago(lalu), selesai: null, suhu_target: tgt, status_akhir: st,
  kelembapan_awal: awal, kelembapan_akhir: akhir, sempat_terputus: putus, durasi_detik: dur * 60,
});
const old: Sesi[] = [
  S(18, 900, 50, "selesai", 70, 14, 41), S(17, 2000, 45, "selesai", 75, 14, 72, 1), S(16, 3000, 45, "selesai", 68, 13, 58),
  S(15, 3010, 45, "dibatalkan", 70, 58, 8), S(14, 4000, 50, "selesai", 66, 13, 36), S(13, 5000, 45, "selesai", 71, 14, 65),
  S(12, 6000, 50, "dibatalkan", 69, 47, 22), S(11, 7000, 45, "selesai", 73, 14, 80), S(10, 8000, 45, "selesai", 67, 13, 55),
  S(9, 9000, 50, "selesai", 72, 14, 44),
];

export async function demoApi(path: string, body?: unknown): Promise<unknown> {
  await new Promise((r) => setTimeout(r, 120));
  const [p, qs] = path.split("?");
  const q = new URLSearchParams(qs);
  const b = (body ?? {}) as Record<string, unknown>;

  if (p === "/api/auth/login") {
    if (String(b.email).toLowerCase() !== DEMO_EMAIL || b.password !== DEMO_PASS) throw new DemoError("Email atau kata sandi salah", 401);
    return { token: "demo", user: { id: 1, email: DEMO_EMAIL, nama: "Pengguna Demo" } };
  }
  if (p === "/api/auth/me") return { id: 1, email: DEMO_EMAIL, nama: "Pengguna Demo" };
  if (p === "/api/devices") return [{ id: "demo01", nama: "Alat demo", online: true }];
  if (p.endsWith("/live")) return liveNow();
  if (p.endsWith("/events")) return events.slice(0, 20);
  if (p.endsWith("/log")) {
    const rows = [];
    for (let t = mulai; t <= Date.now(); t += 5000) {
      const m = (t - mulai) / MIN;
      rows.push({ waktu: new Date(t).toISOString(), suhu_ruang: +tmp(m).toFixed(1), kelembapan: Math.round(hum(m)) });
    }
    return rows;
  }
  if (p.endsWith("/sessions")) {
    const cur = S(sid, (Date.now() - mulai) / MIN, target, "berjalan", 72, null, (Date.now() - mulai) / MIN);
    let all = [cur, ...old];
    const st = q.get("status");
    if (st) all = all.filter((s) => s.status_akhir === st);
    const limit = Number(q.get("limit")) || 8, page = Number(q.get("page")) || 1;
    return { total: all.length, page, limit, data: all.slice((page - 1) * limit, page * limit) };
  }
  if (p.endsWith("/mode")) { desired = Number(b.suhu); return liveNow(); }
  if (p.endsWith("/restart")) {
    const t = b.suhu != null ? Number(b.suhu) : desired;
    old.unshift(S(100 + old.length, (Date.now() - mulai) / MIN, target, "dibatalkan", 72, Math.round(hum((Date.now() - mulai) / MIN)), (Date.now() - mulai) / MIN));
    addEvent("restart", `Sesi dimulai ulang dengan mode ${t} °C`);
    target = desired = t; mulai = Date.now(); uvOff = false; sid += 1;
    return liveNow();
  }
  if (p.endsWith("/uv")) { uvOff = !b.on; return liveNow(); }
  throw new DemoError("Tidak ditemukan", 404);
}

export function demoCsv(): Blob {
  const head = "id,mulai,selesai,suhu_target,status_akhir,kelembapan_awal,kelembapan_akhir,sempat_terputus";
  const rows = old.map((s) => [s.id, s.mulai, s.selesai ?? "", s.suhu_target, s.status_akhir, s.kelembapan_awal ?? "", s.kelembapan_akhir ?? "", s.sempat_terputus].join(","));
  return new Blob([[head, ...rows].join("\n")], { type: "text/csv" });
}