import next from "eslint-config-next";

/**
 * Flat ESLint config.
 *
 * eslint-config-next (v16+) exports a ready-made *flat* config array — Next.js,
 * React, and TypeScript rules plus sensible ignores (.next, out, build,
 * next-env.d.ts). We just spread it. (No @eslint/eslintrc / FlatCompat shim —
 * that approach is incompatible with ESLint 10 + these plugins.)
 *
 * Add project-specific overrides as extra config objects after the spread.
 */
const eslintConfig = [
  ...next,
];

export default eslintConfig;
