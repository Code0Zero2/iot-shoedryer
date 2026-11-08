import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api, socketUrl } from "../services/api";
import { DEMO } from "../services/demo";
import { useAuth } from "./useAuth";
import type { Ev, Live, Pt } from "../types";

interface LogRow { waktu: string; suhu_ruang: number; kelembapan: number }

const mergePts = (a: Pt[], b: Pt[]) => {
  const m = new Map<number, Pt>();
  [...a, ...b].forEach((p) => m.set(p.t, p));
  return [...m.values()].sort((x, y) => x.t - y.t);
};

/** Data realtime satu perangkat: snapshot, aktivitas, dan titik grafik sesi berjalan. */
export function useLive(deviceId?: string) {
  const { token } = useAuth();
  const [live, setLive] = useState<Live | null>(null);
  const [events, setEvents] = useState<Ev[]>([]);
  const [points, setPoints] = useState<Pt[]>([]);
  const [connected, setConnected] = useState(false);
  const sesiId = useRef<number | null>(null);
  const lastAdded = useRef<number | null>(null);
  const applyRef = useRef<(l: Live) => void>(() => {});

  useEffect(() => {
    if (!deviceId || !token) return;
    let alive = true;
    sesiId.current = null; lastAdded.current = null; // state diganti oleh data pertama dari perangkat ini

    const apply = (l: Live) => {
      if (!alive || l.id !== deviceId) return;
      setLive(l);
      const sid = l.sesi?.id ?? null;
      if (sid !== sesiId.current) {
        sesiId.current = sid; lastAdded.current = null; setPoints([]);
        if (sid) {
          api<LogRow[]>(`/api/devices/${deviceId}/sessions/${sid}/log`).then((rows) => {
            if (!alive || sesiId.current !== sid) return;
            setPoints((prev) => mergePts(rows.map((r) => ({ t: Date.parse(r.waktu), suhu: r.suhu_ruang, hum: r.kelembapan })), prev));
          }).catch(() => {});
        }
      }
      if (sid && l.online && l.lastSeen && l.suhu != null && l.kelembapan != null && l.lastSeen !== lastAdded.current) {
        lastAdded.current = l.lastSeen;
        const p = { t: l.lastSeen, suhu: l.suhu, hum: l.kelembapan };
        setPoints((prev) => mergePts(prev, [p]));
      }
    };

    applyRef.current = apply;
    api<Live>(`/api/devices/${deviceId}/live`).then(apply).catch(() => {});
    const loadEvents = () =>
      api<{ waktu: string; jenis: string; teks: string }[]>(`/api/devices/${deviceId}/events`)
        .then((r) => alive && setEvents(r.map((e) => ({ ...e, waktu: Date.parse(e.waktu) })))).catch(() => {});
    loadEvents();

    if (DEMO) {
      const i = setInterval(() => { api<Live>(`/api/devices/${deviceId}/live`).then(apply).catch(() => {}); loadEvents(); }, 5000);
      return () => { alive = false; clearInterval(i); };
    }

    const socket = io(socketUrl, { auth: { token } });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("live", apply);
    socket.on("event", loadEvents); // event socket tidak membawa id perangkat, jadi muat ulang daftar
    return () => { alive = false; socket.close(); };
  }, [deviceId, token]);

  /** Pakai snapshot dari respons perintah supaya tampilan langsung berubah. */
  const push = (l: Live) => applyRef.current(l);
  return { live, events, points, connected: DEMO || connected, push };
}
export type LiveState = ReturnType<typeof useLive>;