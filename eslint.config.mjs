import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Intentional sync/reset effects (hydration-safe year, close-menu-on-route
    // change, banner sync) are flagged by the stricter rule added in
    // eslint-config-next 16.2.7. They are valid patterns; keep them as warnings
    // (to revisit in a dedicated hooks refactor) rather than failing lint.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
