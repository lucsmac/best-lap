import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["cjs"],
  target: "node18",
  clean: true,
  dts: true,
  sourcemap: false,
  minify: false,
  splitting: false,
  skipNodeModulesBundle: true,
});