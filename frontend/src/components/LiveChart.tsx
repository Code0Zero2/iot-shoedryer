import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { angka, jam } from "../services/format";
import type { Pt } from "../types";

const GAP_MS = 20000; // telemetri tiap 5 dtk; jeda lebih dari ini = perangkat terputus

function Tip({ active, payload }: { active?: boolean; payload?: { payload: Pt }[] }) {
  const p = active && payload?.[0]?.payload;
  if (!p) return null;
  return (
    <div className="rounded-lg bg-graphite px-3 py-2 text-[13px] leading-snug text-white shadow-hair">
      <div className="text-smoke">{jam(p.t)}</div>
      <div>Suhu {angka(p.suhu)} °C</div>
      <div>Kelembapan {angka(p.hum, 0)}%</div>
    </div>
  );
}

export default function LiveChart({ points, target, dry }: { points: Pt[]; target: number | null; dry: number }) {
  const gaps: [number, number][] = [];
  const data: (Pt | { t: number; suhu: null; hum: null })[] = [];
  points.forEach((p, i) => {
    const prev = points[i - 1];
    if (prev && p.t - prev.t > GAP_MS) { gaps.push([prev.t, p.t]); data.push({ t: prev.t + 1, suhu: null, hum: null }); }
    data.push(p);
  });

  if (points.length < 2) {
    return <div className="flex h-[360px] items-center justify-center text-sm text-smoke">Grafik muncul setelah ada beberapa data dari alat.</div>;
  }
  const axis = { fill: "#61626b", fontSize: 11, fontFamily: "Inter" };
  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={data} margin={{ top: 10, right: 14, bottom: 0, left: -14 }}>
        <CartesianGrid vertical={false} stroke="#303438" strokeOpacity={0.7} />
        <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={jam} tick={axis} axisLine={{ stroke: "#303438" }} tickLine={false} minTickGap={60} />
        <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={axis} axisLine={false} tickLine={false} />
        {gaps.map(([a, b]) => (
          <ReferenceArea key={a} x1={a} x2={b} fill="#b6abff" fillOpacity={0.12} stroke="none"
            label={{ value: `Terputus ${Math.round((b - a) / 1000)} dtk`, fill: "#b6abff", fontSize: 11, position: "insideTop" }} />
        ))}
        <ReferenceLine y={dry} stroke="#eef35f" strokeDasharray="4 5" strokeOpacity={0.8}
          label={{ value: `Batas kering ${dry}%`, fill: "#eef35f", fontSize: 11, position: "insideTopRight" }} />
        {target != null && (
          <ReferenceLine y={target} stroke="#61626b" strokeDasharray="1 5"
            label={{ value: `Target ${target} °C`, fill: "#8d8d96", fontSize: 11, position: "insideTopLeft" }} />
        )}
        <Tooltip content={<Tip />} cursor={{ stroke: "#61626b", strokeDasharray: "2 4" }} />
        <Line dataKey="hum" stroke="#b6abff" strokeWidth={2} dot={false} isAnimationActive={false} activeDot={{ r: 4.5, stroke: "#0e0f11", strokeWidth: 2 }} />
        <Line dataKey="suhu" stroke="#cfcfd3" strokeWidth={1.6} dot={false} isAnimationActive={false} activeDot={{ r: 4.5, stroke: "#0e0f11", strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}