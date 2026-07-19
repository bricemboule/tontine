import AppProviders from "@/app/providers";
import AppRouter from "@/app/router";
import "./index.css";

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
