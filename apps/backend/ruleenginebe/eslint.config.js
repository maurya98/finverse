import nodeConfig from "@finverse/eslint-config/node";

export default [
  { ignores: ["**/generated/**", "**/dist/**"] },
  ...nodeConfig,
];
