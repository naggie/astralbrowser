import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      preprocess: vitePreprocess(),
      compilerOptions: {
        customElement: false,
      },
    })
  ],
  publicDir: false, // Don't copy public directory during build
  base: '/build/',
  build: {
    outDir: 'public/build',
    emptyOutDir: true,
    lib: {
      entry: '/src/main.ts',
      name: 'AstralBrowser',
      formats: ['umd'],
      fileName: () => 'astralbrowser.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'astralbrowser.css';
          }
          return '[name].[ext]';
        },
        chunkFileNames: '[name].js',
      },
    },
  },
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
      },
    },
  },
  server: {
    port: 5173,
  },
});
