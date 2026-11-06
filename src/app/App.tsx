import { BrowserRouter, Route, Routes } from "react-router";
import { AppLayout } from "./AppLayout.tsx";
import { NotFoundPage } from "./NotFoundPage.tsx";
import { HomePage } from "../features/home/HomePage.tsx";
import { AboutPage } from "../features/about/AboutPage.tsx";
import { BuildInfoPage } from "../features/about/BuildInfoPage.tsx";

// import.meta.env.BASE_URL is "/anatomica/" (from vite.config.ts).
// The router strips it, so routes below are written without it.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="about/build" element={<BuildInfoPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
