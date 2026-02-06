// Prim MST wrapper around the shared Dijkstra/Prim implementation.

import { DijkstraPrim } from "./DijkstraPrim.js";

export function Prim(canvas) {
  // New-style usage: `new Prim({ ...opts })` (preferred)
  // Legacy usage: `new Prim(canvas)`

  // In either case, return the underlying DijkstraPrim instance configured for Prim.
  if (canvas && typeof canvas.getContext === "function") {
    return new DijkstraPrim(canvas, false);
  }

  const opts = canvas || {};
  return new DijkstraPrim({
    ...opts,
    runningDijkstra: false,
  });
}
