import nkzw from "@nkzw/eslint-config";

export default [
  ...nkzw,
  {
    ignores: [
      "ClientApp/build/",
      "bin/",
      "node_modules/",
      "obj/",
      "vite.config.ts.timestamp-*",
      "webpack.config.js",
    ],
  },
  {
    rules: {
      "@nkzw/no-instanceof": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "import-x/no-namespace": "off",
      "no-console": "off",
      "perfectionist/sort-interfaces": "off",
      "perfectionist/sort-jsx-props": "off",
      "perfectionist/sort-objects": "off",
      "unicorn/catch-error-name": "off",
      "unicorn/consistent-function-scoping": "off",
      "unicorn/prefer-at": "off",
      "unicorn/prefer-dom-node-append": "off",
      "unicorn/prefer-number-properties": "off",
      "unicorn/prefer-string-replace-all": "off",
      "unicorn/prefer-ternary": "off",
    },
  },
  {
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
  },
];
