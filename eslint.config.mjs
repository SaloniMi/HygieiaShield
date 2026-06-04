import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default tseslint.config(
  // 1. Core global setups and recommended JS rules
  js.configs.recommended,

  // 2. Spread the recommended TS configuration arrays
  ...tseslint.configs.recommended,

  // 3. React plugin flat config object
  pluginReact.configs.flat.recommended,

  // 4. Custom overrides, specific targets, and shared settings
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    // Add shared settings to clear the warning
    settings: {
      react: {
        version: "detect" // Automatically picks the version from your package.json
      }
    },
    rules: {
      "react/react-in-jsx-scope": "off", // Uncomment this if you are using React 17+
      "react/prop-types": "off"
    }
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",      // Ignores all Next.js build output across apps
      "**/dist/**",
      "**/build/**"
    ]
  }
);
