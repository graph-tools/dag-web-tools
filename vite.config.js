import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  root: './',
  resolve: {
    alias: {
      'dag-web-tools': path.resolve('src/index.ts'),
      assets: path.resolve('demo/src/assets'),
      hooks: path.resolve('demo/src/hooks/index.tsx'),
      contexts: path.resolve('demo/src/contexts/index.tsx'),
      components: path.resolve('demo/src/components/index.tsx'),
      nodes: path.resolve('demo/src/nodes/index.tsx'),
      edges: path.resolve('demo/src/edges/index.tsx'),
      pages: path.resolve('demo/src/pages/index.tsx'),
    },
  },
  plugins: [dts({ exclude: './src/test/**' }), react(), svgr()],
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
