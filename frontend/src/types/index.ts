export interface User { id: number; email: string; nama: string }
export interface Device { id: string; nama: string; online: boolean }
export interface Actuators { pemanas: boolean; uv: boolean; kipas: boolean; buzzer: boolean }
export interface Live {
  id: string; online: boolean; lastSeen: number | null;
  suhu: number | null; kelembapan: number | null; suhuPemanas: number | null;
  switchMode: number | null; desiredMode: number | null;
  sesi: { id: number; mulai: string | number; suhuTarget: number; kelembapanAwal: number | null } | null;
  aktuator: Actuators; uvManualOff: boolean; batasKering: number;
}
export interface Ev { waktu: number; jenis: string; teks: string }
export interface Pt { t: number; suhu: number; hum: number }
export interface Sesi {
  id: number; mulai: string; selesai: string | null; suhu_target: number;
  status_akhir: "berjalan" | "selesai" | "dibatalkan";
  kelembapan_awal: number | null; kelembapan_akhir: number | null;
  sempat_terputus: number; durasi_detik: number;
}