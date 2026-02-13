import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export const base = [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
];
