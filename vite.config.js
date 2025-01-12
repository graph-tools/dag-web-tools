import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  root: './',
  resolve: {
    alias: {
      '@self/dag': path.resolve('src/index.ts'),
      '@demo/assets': path.resolve('demo/src/assets'),
      '@demo/hooks': path.resolve('demo/src/hooks/index.tsx'),
      '@demo/contexts': path.resolve('demo/src/contexts/index.tsx'),
      '@demo/components': path.resolve('demo/src/components/index.tsx'),
      '@demo/nodes': path.resolve('demo/src/nodes/index.tsx'),
      '@demo/edges': path.resolve('demo/src/edges/index.tsx'),
      '@demo/pages': path.resolve('demo/src/pages/index.tsx'),
    },
  },
  plugins: [dts({ exclude: ['./src/test/**', './demo/**'] }), react(), svgr()],
  publicDir: './public',
  server: {
    port: 3000,
    open: '/',
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
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
