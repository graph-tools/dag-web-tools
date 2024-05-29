import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  root: './',
  plugins: [dts({ exclude: './src/test/**' })],
  publicDir: './public',
  server: {
    port: 3000,
    open: '/demo',
  },
  esbuild: {
    charset: 'utf8',
  },
  build: {
    target: 'es6',
    reportCompressedSize: true,
    outDir: './dist',
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`,
    },
  },
});
