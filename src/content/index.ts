// Every content record, collected for the validator, graph builder and coverage report.
// Pure data: no React, no DOM (ADR-0005).

import type { Entity } from "./schema/index.ts";
import { humerusRecords } from "./entities/osteology/upper-limb/humerus.ts";
import { armMuscleRecords } from "./entities/myology/upper-limb/arm.ts";
import { nerveRecords } from "./entities/neurology/upper-limb/nerves.ts";
import { arteryRecords } from "./entities/angiology/upper-limb/arteries.ts";
import { spaceRecords } from "./entities/topography/upper-limb/spaces.ts";
import { conditionRecords } from "./clinical/upper-limb/humeral-shaft-fracture.ts";
import { upperLimbStubs } from "./entities/stubs/upper-limb.ts";

export { references } from "./references/index.ts";
export { regions, systems } from "./taxonomy/index.ts";

export const entities: Entity[] = [
  ...humerusRecords,
  ...armMuscleRecords,
  ...nerveRecords,
  ...arteryRecords,
  ...spaceRecords,
  ...conditionRecords,
  ...upperLimbStubs,
];
