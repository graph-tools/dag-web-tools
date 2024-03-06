import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  root: './',
  plugins: [dts()],
  publicDir: './public',
  server: {
    port: 3000,
    open: '/demo',
  },
  build: {
    target: 'es6',
    outDir: './dist/lib',
    lib: {
      entry: './src/index.js',
      name: 'dag-web-tools',
      formats: ['es', 'cjs'],
      fileName: (format) => `dag-web-tools.${format}.js`,
    },
  },
});
