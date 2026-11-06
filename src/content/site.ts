// Site identity. Pure data: no React, no DOM (ADR-0005).

export const site = {
  name: "ANATOMICA",
  subtitle: "The Clinical Anatomy Atlas",
  tagline: "Understand the structure. Understand the consequence.",
  repositoryUrl: "https://github.com/ensocircle07/anatomica",
  licences: {
    code: "MIT",
    content: "CC BY-SA 4.0",
  },
  disclaimer:
    "ANATOMICA is an educational resource under development. It is not medical advice and does not replace professional care or certified first-aid training.",
} as const;
