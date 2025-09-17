import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts'],
  outDir: 'dist',
  format: ['cjs'],
  clean: true,
  minify: false,
  sourcemap: true,
  dts: false,
  bundle: false,
  target: 'node16',
  external: ['dotenv/config'],
})