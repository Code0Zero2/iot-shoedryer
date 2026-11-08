import { useOutletContext } from "react-router-dom";
// import type { AppCtx } from "../components/Layout";
import { useApp } from "../hooks/useApp";
import { PageHead, State } from "../components/ui";

export default function Devices() {
  // const { devices } = useOutletContext<AppCtx>();
  const { devices } = useApp();
  return (
    <>
      <PageHead
        title="Perangkat"
        sub="Alat yang terhubung ke akunmu. Penambahan alat dilakukan oleh admin."
      />
      <section className="card">
        {devices?.length === 0 && (
          <p className="text-sm text-smoke">Belum ada alat.</p>
        )}
        {devices?.map((d, i) => (
          <div
            key={d.id}
            className={`flex items-center justify-between gap-4 py-4 ${i > 0 ? "border-t border-ash" : "pt-0"} ${i === devices.length - 1 ? "pb-0" : ""}`}
          >
            <div>
              <div className="font-medium text-white">{d.nama}</div>
              <div className="font-mono text-xs text-smoke">{d.id}</div>
            </div>
            <State tone={d.online ? "live" : "off"}>
              {d.online ? "Online" : "Offline"}
            </State>
          </div>
        ))}
      </section>
    </>
  );
}
