import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs'],
  clean: true,
  minify: false,
  sourcemap: true,
  dts: false,
  external: ['dotenv/config'],
})