import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeBase(value: string): string {
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function microappHtmlPlugin(publicBase: string): Plugin {
  return {
    name: 'scene-library-microapp-html',
    generateBundle(_options, bundle) {
      const entry = Object.values(bundle).find(
        (item) => item.type === 'chunk' && item.isEntry,
      );
      if (!entry || entry.type !== 'chunk') {
        throw new Error('Microapp build did not emit an entry script.');
      }
      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>场景库</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="${publicBase}scene-library.css">
  </head>
  <body>
    <div data-scene-library-root></div>
    <script src="${publicBase}${entry.fileName}" entry></script>
  </body>
</html>
`,
      });
    },
  };
}

export default defineConfig(({ mode, command }) => {
    const env = loadEnv(mode, '.', '');
    const isStandalone = mode === 'standalone';
    const isMicroapp = mode === 'microapp';
    const publicBase = normalizeBase(
      process.env.VITE_PUBLIC_BASE
        || env.VITE_PUBLIC_BASE
        || (isMicroapp ? '/microapps/scene-library/' : isStandalone ? '/cockpit/' : '/'),
    );
    const apiBase = normalizeBase(
      process.env.VITE_API_BASE
        || env.VITE_API_BASE
        || (isStandalone || isMicroapp ? '/scene-library-api/' : '/api/'),
    );
    return {
      base: publicBase,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), ...(isMicroapp ? [microappHtmlPlugin(publicBase)] : [])],
      define: {
        'process.env.NODE_ENV': JSON.stringify(command === 'build' ? 'production' : 'development'),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        __SCENE_LIBRARY_API_BASE__: JSON.stringify(apiBase),
        __SCENE_LIBRARY_BUILD_MODE__: JSON.stringify(isMicroapp ? 'microapp' : 'standalone'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: isMicroapp
        ? {
            outDir: 'dist-microapp',
            emptyOutDir: true,
            cssCodeSplit: false,
            lib: {
              entry: path.resolve(__dirname, 'microapp.tsx'),
              name: 'IndustrialIntelligentCockpit',
              formats: ['umd'],
              fileName: () => 'scene-library.js',
              cssFileName: 'scene-library',
            },
          }
        : {
            outDir: isStandalone ? 'dist-standalone' : 'dist',
            emptyOutDir: true,
          },
    };
});
