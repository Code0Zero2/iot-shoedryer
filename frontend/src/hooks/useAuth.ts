import { createContext, useContext } from "react";
import type { User } from "../types";

export interface AuthCtx {
  user: User | null; token: string | null; ready: boolean;
  login(email: string, password: string): Promise<void>; logout(): void;
}
export const AuthContext = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(AuthContext);