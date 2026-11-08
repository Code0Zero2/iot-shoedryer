import { useState } from "react";
import { api } from "../services/api";
import { useApp } from "../hooks/useApp";
import { useNow } from "../hooks/useNow";
import LiveChart from "../components/LiveChart";
import { Dot, PageHead, Seg, State } from "../components/ui";
import { angka, jam, lalu } from "../services/format";
import type { Actuators, Live } from "../types";

const AKTUATOR: {
  key: keyof Actuators;
  label: string;
  on: string;
  off: string;
}[] = [
  { key: "pemanas", label: "Pemanas", on: "Menyala", off: "Mati" },
  { key: "uv", label: "Lampu UV-C", on: "Menyala", off: "Mati" },
  { key: "kipas", label: "Kipas", on: "Menyala", off: "Mati" },
  { key: "buzzer", label: "Buzzer", on: "Berbunyi", off: "Mati" },
];
const EVENT_TONE: Record<string, "live" | "violet"> = {
  mulai: "live",
  pemanas: "live",
  selesai: "live",
  putus: "violet",
  sambung: "violet",
  restart: "violet",
};

function Numeral({
  label,
  value,
  unit,
  sub,
  first,
  desktopOnly,
}: {
  label: string;
  value: string;
  unit: string;
  sub: string;
  first?: boolean;
  desktopOnly?: boolean;
}) {
  return (
    <div
      className={`py-1 ${desktopOnly ? "hidden sm:block" : ""} ${first ? "pr-3 sm:pr-7" : "border-l border-ash pl-4 sm:px-7"}`}
    >
      <div className="text-[13px] font-medium leading-[1.2] text-cloud sm:text-sm">
        {label}
      </div>
      <div className="mt-3 whitespace-nowrap text-[38px] font-light leading-none tracking-[-0.018em] text-white sm:mt-[18px] sm:text-[52px] lg:text-[56px] xl:text-[68px]">
        {value}
        <small className="ml-1 text-lg tracking-[-0.01em] text-cloud sm:ml-1.5 sm:text-2xl">
          {unit}
        </small>
      </div>
      <div className="mt-2 text-xs leading-snug text-smoke sm:mt-3 sm:text-[13px]">
        {sub}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { device, devices, state } = useApp();
  const { live, events, points, push } = state;
  const now = useNow();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (devices && !device) {
    return (
      <PageHead
        title="Belum ada alat"
        sub="Akunmu belum terhubung ke alat. Minta admin menambahkan perangkat ke akunmu."
      />
    );
  }
  if (!device || !live) return <PageHead title="Memuat data alat..." />;

  const sesi = live.sesi;
  const mode = live.desiredMode ?? sesi?.suhuTarget ?? live.switchMode;
  const dry = live.batasKering;
  const awal = sesi?.kelembapanAwal ?? null;
  const progress =
    awal != null && live.kelembapan != null && awal > dry
      ? Math.min(
          100,
          Math.max(0, ((awal - live.kelembapan) / (awal - dry)) * 100),
        )
      : 0;
  const sisa =
    live.kelembapan != null
      ? Math.max(0, Math.round(live.kelembapan - dry))
      : null;

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal, coba lagi");
    } finally {
      setBusy(false);
    }
  }
  const post =
    (path: string, body: unknown = {}) =>
    () =>
      api<Live>(`/api/devices/${device.id}/${path}`, body).then(push);
  const control = !live.online || busy;
  const modeNote =
    sesi && live.desiredMode != null && live.desiredMode !== sesi.suhuTarget
      ? `Mode ${live.desiredMode} °C berlaku setelah sesi dimulai ulang.`
      : `Sinkron dengan switch di alat. Posisi sekarang: ${live.switchMode ?? "–"}\u00a0°C.`;

  const head = !live.online
    ? {
        title: "Perangkat tidak terhubung",
        sub: sesi
          ? "Sesi akan dilanjutkan otomatis begitu alat tersambung kembali. Semua keluaran alat mati selama terputus."
          : "Nyalakan alat dan pastikan Wi-Fi tersambung.",
      }
    : sesi
      ? {
          title: "Sepatu sedang dikeringkan",
          sub: `Mode ${sesi.suhuTarget} °C sejak ${jam(sesi.mulai)}. Sesi selesai otomatis saat kelembapan di bawah ${dry}%.`,
        }
      : {
          title: "Tidak ada sesi berjalan",
          sub: "Alat siap. Tekan mulai ulang sesi untuk mengeringkan sepatu lagi.",
        };

  return (
    <>
      <PageHead
        title={head.title}
        sub={head.sub}
        badge={
          live.online ? (
            <div className="flex flex-nowrap items-center gap-3 whitespace-nowrap">
              {sesi && (
                <span className="badge">
                  <Dot tone="live" />
                  Sesi berjalan
                </span>
              )}
              <span className="text-[13px] text-smoke">
                Data terakhir {lalu(live.lastSeen, now)}
              </span>
            </div>
          ) : undefined
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          <section className="card">
            di{" "}
            <div className="grid grid-cols-2 sm:grid-cols-3">
              <Numeral
                first
                label="Suhu ruang"
                value={angka(live.suhu)}
                unit="°C"
                sub={sesi ? `Target ${sesi.suhuTarget} °C` : "Sensor DHT11"}
              />
              <Numeral
                label="Kelembapan"
                value={angka(live.kelembapan, 0)}
                unit="%"
                sub={
                  awal != null
                    ? `Mulai dari ${angka(awal, 0)}%`
                    : "Sensor DHT11"
                }
              />
              <Numeral
                desktopOnly
                label="Suhu pemanas"
                value={angka(live.suhuPemanas, 0)}
                unit="°C"
                sub="Sensor DS18B20"
              />
            </div>
            <div className="mt-4 flex items-baseline justify-between border-t border-ash pt-3.5 sm:hidden">
              <span className="text-[13px] font-medium text-cloud">
                Suhu pemanas{" "}
                <span className="font-normal text-smoke">· DS18B20</span>
              </span>
              <span className="text-xl font-light text-white">
                {angka(live.suhuPemanas, 0)}
                <small className="ml-1 text-sm text-cloud">°C</small>
              </span>
            </div>
            {sesi && (
              <div className="mt-4 border-t border-ash pt-4 sm:mt-[30px] sm:pt-6">
                <div className="mb-3 flex flex-col gap-1 text-sm font-medium leading-[1.2] text-silver sm:flex-row sm:justify-between sm:gap-4">
                  <span>Menuju batas kering</span>
                  <span className="font-normal text-cloud">
                    {sisa != null ? `Tersisa ${sisa} poin kelembapan` : ""}
                  </span>
                </div>
                <div
                  className="relative h-2 rounded-full bg-carbon shadow-hair"
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-violet transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="card">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="card-title">Suhu dan kelembapan</h2>
              <div className="flex gap-[18px] text-[13px] leading-none text-cloud">
                <span>
                  <i className="mr-2 inline-block h-0.5 w-[18px] rounded bg-violet align-middle" />
                  Kelembapan (%)
                </span>
                <span>
                  <i className="mr-2 inline-block h-0.5 w-[18px] rounded bg-silver align-middle" />
                  Suhu (°C)
                </span>
              </div>
            </div>
            <LiveChart
              points={points}
              target={sesi?.suhuTarget ?? null}
              dry={dry}
            />
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <section className="card">
            <h2 className="card-title">Kontrol</h2>
            <div className="grid grid-cols-2 gap-x-3 sm:block">
              <div>
                <div className="ctl-label">Mode suhu</div>
                <Seg
                  value={mode}
                  disabled={control}
                  options={[
                    { value: 45, label: "45 °C" },
                    { value: 50, label: "50 °C" },
                  ]}
                  onChange={(v) => run(post("mode", { suhu: v }))}
                />
                <p className="note hidden sm:block">{modeNote}</p>
              </div>
              <div>
                <div className="ctl-label sm:mt-[26px]!">Lampu UV-C</div>
                <Seg
                  value={live.uvManualOff ? "mati" : "nyala"}
                  disabled={control || !sesi}
                  options={[
                    { value: "nyala", label: "Menyala" },
                    { value: "mati", label: "Mati" },
                  ]}
                  onChange={(v) => run(post("uv", { on: v === "nyala" }))}
                />
                <p className="note hidden sm:block">
                  Menyala otomatis selama sesi. Kamu bisa mematikannya dari
                  sini, dan akan menyala lagi di sesi berikutnya.
                </p>
              </div>
            </div>
            <p className="note sm:hidden">{modeNote}</p>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-ash pt-4 sm:mt-0 sm:block sm:border-0 sm:pt-0">
              <div className="ctl-label mb-0! mt-0! sm:mb-2.5! sm:mt-[26px]!">
                Sesi
              </div>
              <button
                className="btn btn-primary px-4! py-2.5! text-[13px]! sm:px-6! sm:py-3! sm:text-sm!"
                disabled={control || mode == null}
                onClick={() => run(post("restart", { suhu: mode }))}
              >
                Mulai ulang sesi
              </button>
            </div>
            <p className="note hidden sm:block">
              Switch dikunci selama sesi. Perubahan mode berlaku setelah sesi
              dimulai ulang.
            </p>
            {error && (
              <p
                role="alert"
                className="mt-3 text-[13px] leading-normal text-white"
              >
                {error}
              </p>
            )}
          </section>

          <section className="card">
            <h2 className="card-title">Aktuator</h2>
            <div className="mt-2 grid grid-cols-2 gap-x-4 sm:mt-3 sm:block">
              {AKTUATOR.map((a, i) => (
                <div
                  key={a.key}
                  className={`flex min-w-0 items-center justify-between gap-1 py-2.5 text-xs leading-[1.2] text-silver sm:border-b sm:border-ash sm:py-[13px] sm:text-[15px] ${i < 2 ? "border-b border-ash" : ""} ${i >= 2 ? "pb-0" : ""} ${i === 2 ? "sm:pb-[13px]" : ""} ${i === AKTUATOR.length - 1 ? "sm:border-b-0 sm:pb-0" : ""}`}
                >
                  <span className="whitespace-nowrap">{a.label}</span>
                  <State tone={live.aktuator[a.key] ? "live" : "off"}>
                    {live.aktuator[a.key] ? a.on : a.off}
                  </State>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Aktivitas</h2>
            {events.length === 0 ? (
              <p className="note">Belum ada aktivitas.</p>
            ) : (
              <ul className="mt-4">
                {events.slice(0, 8).map((e, i) => (
                  <li
                    key={`${e.waktu}-${i}`}
                    className="relative grid grid-cols-[48px_8px_1fr] gap-x-3 pb-[18px] last:pb-0"
                  >
                    {i < Math.min(events.length, 8) - 1 && (
                      <span className="absolute bottom-[-2px] left-[63px] top-[14px] w-px bg-ash" />
                    )}
                    <span className="font-mono text-xs leading-[1.6] text-smoke">
                      {jam(e.waktu)}
                    </span>
                    <span className="mt-[7px]">
                      <Dot tone={EVENT_TONE[e.jenis] ?? "off"} />
                    </span>
                    <span className="text-sm leading-normal text-silver">
                      {e.teks}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
