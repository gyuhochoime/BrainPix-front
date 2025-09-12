import { defineConfig, PluginOption } from 'vite';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      treeshake: true,
      output: {
        manualChunks: {
          router: ['react-router-dom'], // React Router를 별도 번들로 분리
        },
      },
    },
    cssCodeSplit: true,
  },
  plugins: [
    svgr({
      // A minimatch pattern, or array of patterns, which specifies the files in the build the plugin should include.
      include: '**/*.svg?react',
    }),
    react(),
    [visualizer() as PluginOption],
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/mixins";
         @import "@/styles/colors";
         @import "@/styles/fonts";`,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
