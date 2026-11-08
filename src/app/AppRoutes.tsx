import { Route, Routes } from "react-router";
import { AppLayout } from "./AppLayout.tsx";
import { NotFoundPage } from "./NotFoundPage.tsx";
import { HomePage } from "../features/home/HomePage.tsx";
import { AboutPage } from "../features/about/AboutPage.tsx";
import { BuildInfoPage } from "../features/about/BuildInfoPage.tsx";
import { EntityPage } from "../features/atlas/EntityPage.tsx";
import { RegionHubPage, RegionsIndexPage, SystemHubPage, SystemsIndexPage } from "../features/hubs/HubPages.tsx";
import { allRoutes } from "../core/routes.ts";
import { regions, systems } from "../content/taxonomy/index.ts";
import { regionPath, systemPath } from "../core/urls.ts";

// Separate from the router so the smoke test can render every route on the server.
// Entity routes are generated from content (src/core/routes.ts, ADR-0012 §1).
const entityRoutes = allRoutes.filter((r) => r.entityId);

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="about/build" element={<BuildInfoPage />} />
        <Route path="regions" element={<RegionsIndexPage />} />
        {regions.map((r) => (
          <Route key={r.id} path={regionPath(r.id).slice(1)} element={<RegionHubPage regionId={r.id} />} />
        ))}
        <Route path="systems" element={<SystemsIndexPage />} />
        {systems.map((s) => (
          <Route key={s.id} path={systemPath(s.id).slice(1)} element={<SystemHubPage systemId={s.id} />} />
        ))}
        {entityRoutes.map((r) => (
          <Route key={r.path} path={r.path.slice(1)} element={<EntityPage id={r.entityId!} />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
