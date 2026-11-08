const ICONS: Record<string, string> = {
  sensor: "M10 4a2 2 0 1 1 4 0v9.2a4 4 0 1 1-4 0z",
  esp: "M6 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4",
  broker: "M4 8h14l-3-3M20 16H6l3 3",
  server: "M5 4h14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM5 14h14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2zM7 7h.01M7 17h.01",
  db: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  web: "M5 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 20h8M12 16v4",
};
const NODES: [keyof typeof ICONS, string, number][] = [
  ["sensor", "Sensor", -90], ["esp", "ESP32", -30], ["broker", "MQTT", 30],
  ["server", "Server", 90], ["db", "Database", 150], ["web", "Dashboard", 210],
];
const C = 320, R = 268;

/** Ilustrasi alur data: sensor → ESP32 → MQTT → server → database → dashboard. */
export default function LoginDiagram() {
  return (
    <svg className="absolute inset-0 hidden h-full w-full overflow-visible lg:block" viewBox="0 0 640 640" fill="none" stroke="#00cbaa" strokeWidth="1.5" aria-hidden>
      <circle cx={C} cy={C} r="150" opacity=".28" />
      <circle cx={C} cy={C} r="225" opacity=".2" />
      <circle cx={C} cy={C} r="300" opacity=".14" />
      <circle cx={C} cy={C} r={R} strokeDasharray="3 7" opacity=".55" />
      {NODES.map(([k, label, a]) => {
        const r = (a * Math.PI) / 180, x = C + R * Math.cos(r), y = C + R * Math.sin(r);
        const right = Math.cos(r) > 0.2, left = Math.cos(r) < -0.2;
        const tx = right ? x + 34 : left ? x - 34 : x;
        const ty = right || left ? y + 4 : Math.sin(r) < 0 ? y - 34 : y + 42;
        return (
          <g key={k}>
            <circle cx={x} cy={y} r="24" fill="#000" />
            <g transform={`translate(${x - 12},${y - 12})`} strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[k]} /></g>
            <text x={tx} y={ty} fill="#a1a1aa" stroke="none" fontFamily="Inter" fontSize="13" textAnchor={right ? "start" : left ? "end" : "middle"}>{label}</text>
          </g>
        );
      })}
    </svg>
  );
}