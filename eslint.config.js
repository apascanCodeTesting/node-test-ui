import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-config-prettier/flat";
import testingLibraryPlugin from "eslint-plugin-testing-library";
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "reports/**", "**.gen.ts", "@mf-types"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      {
        ...testingLibraryPlugin.configs["flat/react"],
        files: ["**/*.spec.ts", "**/*.spec.tsx"],
      },
      prettierPlugin,
    ],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // https://vite.dev/guide/performance.html#reduce-resolve-operations
      "import/extensions": ["warn", "ignorePackages"],
      "react-refresh/only-export-components": ["warn"],
    },
  },
]);
