import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt ([
  // Base JS config
  js.configs.recommended,

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
    },
    rules: {
      // Import sorting
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // General rules
      "no-console": "off",
      "vue/multi-word-component-names": "off",

      // Let Nuxt/Vue handle this better in modern setup
      "import/first": "error",
      "import/no-duplicates": "error",
      "import/order": "off",
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
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "no-console": "off",
    },
  },
]);
