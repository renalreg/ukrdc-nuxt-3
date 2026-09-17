import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt([
  js.configs.recommended,

  // Tailwind CSS v4 settings (applies to every config block below that uses the plugin)
  {
    settings: {
      "better-tailwindcss": {
        // ⚠️ point this at your actual CSS entry file — the one with `@import "tailwindcss";`
        entryPoint: "app/assets/css/main.css",
      },
    },
  },

  // Vue files
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      vue,
      "simple-import-sort": simpleImportSort,
      "@typescript-eslint": tseslint,
      "better-tailwindcss": eslintPluginBetterTailwindcss,
    },
    rules: {
      // ✅ IMPORTANT: disable base rule
      "no-unused-vars": "off",

      // Import sorting
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // Flag (and auto-fix) deprecated Tailwind utility classes, e.g. flex-grow-0 → grow-0
      "better-tailwindcss/no-deprecated-classes": "error",

      // General rules
      "no-console": "off",
      "vue/multi-word-component-names": "off",

      "import/first": "error",
      "import/no-duplicates": "error",
      "import/order": "off",

      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "always",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ],

      // TS version of unused vars
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  // TypeScript / JS files
  {
    files: ["**/*.{ts,js,mjs}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "simple-import-sort": simpleImportSort,
      "better-tailwindcss": eslintPluginBetterTailwindcss,
    },
    rules: {
      // ✅ IMPORTANT: disable base rule here too
      "no-unused-vars": "off",

      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "no-console": "off",

      // Flag (and auto-fix) deprecated Tailwind utility classes, e.g. flex-grow-0 → grow-0
      "better-tailwindcss/no-deprecated-classes": "error",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
]);
