import { useEffect, useState } from "react";

/** Waktu sekarang (ms), diperbarui tiap detik. */
export function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  return now;
}