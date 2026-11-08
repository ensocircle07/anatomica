import { BrowserRouter } from "react-router";
import { AppRoutes } from "./AppRoutes.tsx";

// import.meta.env.BASE_URL is "/anatomica/" (from vite.config.ts).
// The router strips it, so routes are written without it.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export function App() {
  return (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  );
}
