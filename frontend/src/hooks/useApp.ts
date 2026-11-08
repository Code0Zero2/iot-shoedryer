import { useOutletContext } from "react-router-dom";
import type { Device } from "../types";
import type { LiveState } from "./useLive";

export interface AppCtx { devices: Device[] | null; device: Device | null; state: LiveState }
export const useApp = () => useOutletContext<AppCtx>();