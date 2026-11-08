// The graph, built once when the app loads.
// ADR-0012 "Known limitation": all content loads eagerly. Revisit (code-split by region,
// precompute at build time) after the upper-limb slice.

import { entities } from "../content/index.ts";
import { buildGraph } from "../core/graph/build.ts";

export const graph = buildGraph(entities);
