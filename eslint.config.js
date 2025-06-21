import antfu from "@antfu/eslint-config";
import perfectionist from "eslint-plugin-perfectionist";

export default antfu(
  {
    //   formatters: true,
    //    react: true,
    stylistic: {
      indent: 2,
      quotes: "double",
    },
    typescript: true,
  },
  {
    plugins: [perfectionist.configs["recommended-alphabetical"]],
    rules: {
      "no-console": "warn",
      "perfectionist/sort-objects": "error",
      "ts/consistent-type-definitions": "off",
      "unicorn/throw-new-error": "off",
      "unused-imports/no-unused-imports": "error",
    },
  },
  {
    ignores: ["build", "**/*.json", ".husky/install.mjs", "src/providers/prisma/generated"],
  }
);