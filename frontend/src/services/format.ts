const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const p2 = (n: number) => String(n).padStart(2, "0");

export const jam = (t: number | string | Date) => { const d = new Date(t); return `${p2(d.getHours())}:${p2(d.getMinutes())}`; };
export const tanggalJam = (t: number | string | Date) => { const d = new Date(t); return `${d.getDate()} ${BULAN[d.getMonth()]}, ${jam(d)}`; };

export function durasi(detik: number) {
  const m = Math.max(1, Math.round(detik / 60));
  return m >= 60 ? `${Math.floor(m / 60)} j ${p2(m % 60)} mnt` : `${m} mnt`;
}
export const angka = (v: number | null | undefined, digit = 1) =>
  v == null ? "–" : v.toLocaleString("id-ID", { maximumFractionDigits: digit });

export function lalu(t: number | null, now: number) {
  if (!t) return "belum ada data";
  const s = Math.max(0, Math.round((now - t) / 1000));
  return s < 60 ? `${s} detik lalu` : `${Math.round(s / 60)} menit lalu`;
}