import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "dist",
  format: ["cjs"],
  target: "node18",
  clean: true,
  dts: false,
  sourcemap: true,
  minify: process.env.NODE_ENV === "production",
  splitting: false,
  shims: false,
  skipNodeModulesBundle: true,
});