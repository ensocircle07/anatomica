// Regions and systems (ARCHITECTURE §8). Curated data; entity records refer to these IDs.
// Only the upper limb has subregions so far (ADR-0001); others are added region by region.

export const regions = [
  { id: "head", name: "Head" },
  { id: "neck", name: "Neck" },
  { id: "back", name: "Back" },
  { id: "thorax", name: "Thorax" },
  { id: "abdomen", name: "Abdomen" },
  { id: "pelvis-perineum", name: "Pelvis and perineum" },
  { id: "upper-limb", name: "Upper limb" },
  { id: "upper-limb.shoulder", name: "Shoulder" },
  { id: "upper-limb.axilla", name: "Axilla" },
  { id: "upper-limb.arm", name: "Arm" },
  { id: "upper-limb.cubital-fossa", name: "Cubital fossa" },
  { id: "upper-limb.forearm", name: "Forearm" },
  { id: "upper-limb.wrist", name: "Wrist" },
  { id: "upper-limb.hand", name: "Hand" },
  { id: "lower-limb", name: "Lower limb" },
] as const;

export type RegionId = (typeof regions)[number]["id"];

export const systems = [
  { id: "osteology", name: "Osteology" },
  { id: "arthrology", name: "Arthrology (joints and ligaments)" }, // ADR-0002
  { id: "myology", name: "Myology" },
  { id: "neurology", name: "Neurology" },
  { id: "angiology", name: "Angiology" },
  { id: "lymphatics", name: "Lymphatics" },
  { id: "splanchnology", name: "Splanchnology" },
  { id: "topography", name: "Topographical anatomy" },
  { id: "landmarks", name: "Surface anatomy and landmarks" },
  { id: "clinical", name: "Clinical anatomy" },
] as const;

export type SystemId = (typeof systems)[number]["id"];
