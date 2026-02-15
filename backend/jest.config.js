const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  detectOpenHandles: true,
  transform: {
    ...tsJestTransformCfg,
  },
  openHandlesTimeout: 10 * 1000, // 10 seconds
  testTimeout: 10 * 1000, // 10 seconds
};
