import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import History from "./pages/History";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/masuk" element={<Login />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="riwayat" element={<History />} />
        <Route path="perangkat" element={<Devices />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}