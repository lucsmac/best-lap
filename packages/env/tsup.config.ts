import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  outDir: 'dist',
  format: ['cjs'],
  clean: true,
  minify: false,
  sourcemap: true,
  dts: false,
})