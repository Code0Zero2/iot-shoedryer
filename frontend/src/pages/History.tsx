import { useEffect, useState } from "react";
import { api, downloadCsv } from "../services/api";
import { useApp } from "../hooks/useApp";
import { PageHead, Seg, State } from "../components/ui";
import { angka, durasi, tanggalJam } from "../services/format";
import type { Sesi } from "../types";

type Filter = "" | "selesai" | "dibatalkan";
const LIMIT = 8;

function Status({ s }: { s: Sesi }) {
  if (s.status_akhir === "berjalan") return <State tone="live">Berjalan</State>;
  if (s.status_akhir === "dibatalkan")
    return <State tone="off">Dibatalkan</State>;
  return s.sempat_terputus ? (
    <State tone="violet">Selesai, sempat terputus</State>
  ) : (
    <State tone="off">
      <span className="text-white">Selesai</span>
    </State>
  );
}

export default function History() {
  const { device, devices } = useApp();
  const [filter, setFilter] = useState<Filter>("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ total: number; data: Sesi[] } | null>(
    null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!device) return;
    api<{ total: number; data: Sesi[] }>(
      `/api/devices/${device.id}/sessions?limit=${LIMIT}&page=${page}${filter ? `&status=${filter}` : ""}`,
    )
      .then((d) => {
        setData(d);
        setError("");
      })
      .catch((e) => setError(e.message));
  }, [device, page, filter]);

  if (devices && !device)
    return <PageHead title="Riwayat sesi" sub="Belum ada alat di akunmu." />;
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <>
      <PageHead
        title="Riwayat sesi"
        sub={data ? `${total} sesi tercatat.` : undefined}
      />
      <section className="card">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Seg<Filter>
            value={filter}
            onChange={(f) => {
              setFilter(f);
              setPage(1);
            }}
            options={[
              { value: "", label: "Semua" },
              { value: "selesai", label: "Selesai" },
              { value: "dibatalkan", label: "Dibatalkan" },
            ]}
          />
          <button
            className="btn btn-ghost"
            disabled={!device}
            onClick={() =>
              device &&
              downloadCsv(
                `/api/devices/${device.id}/sessions.csv`,
                "riwayat-sesi.csv",
              ).catch((e) => setError(e.message))
            }
          >
            Ekspor CSV
          </button>
        </div>
        {error && (
          <p role="alert" className="mb-4 text-[13px] text-white">
            {error}
          </p>
        )}
        <ul className="sm:hidden">
          {data?.data.map((s) => (
            <li
              key={s.id}
              className="border-t border-ash py-4 first:border-0 first:pt-0"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white">
                  {tanggalJam(s.mulai)}
                </span>
                <span className="inline-block rounded-full bg-graphite px-2.5 py-1 text-xs font-medium leading-[1.2] text-white shadow-hair">
                  {s.suhu_target} °C
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-[13px] text-cloud">
                <span>
                  <span className="font-mono">{durasi(s.durasi_detik)}</span> ·
                  kelembapan akhir{" "}
                  {s.status_akhir === "berjalan"
                    ? "–"
                    : `${angka(s.kelembapan_akhir, 0)}%`}
                </span>
              </div>
              <div className="mt-2.5">
                <Status s={s} />
              </div>
            </li>
          ))}
          {data && data.data.length === 0 && (
            <li className="py-10 text-center text-sm text-smoke">
              Belum ada sesi{filter ? " dengan status ini" : ""}.
            </li>
          )}
        </ul>
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[640px] border-collapse text-left"></table>

          {data && data.data.length === 0 && (
            <p className="py-10 text-center text-sm text-smoke">
              Belum ada sesi{filter ? " dengan status ini" : ""}.
            </p>
          )}
        </div>
        <div className="mt-[22px] flex flex-wrap items-center justify-between gap-3 text-[13px] leading-none text-smoke">
          <span>
            Halaman {page} dari {pages}
          </span>
          <div className="flex gap-2">
            <button
              className="btn btn-ghost px-4! py-[9px]! text-[13px]!"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Sebelumnya
            </button>
            <button
              className="btn btn-soft px-4! py-[9px]! text-[13px]!"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
            >
              Berikutnya
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
