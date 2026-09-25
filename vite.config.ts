import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

const apiMockPlugin = (): Plugin => ({
  name: 'medicenter-api-mock',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/districts') {
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify([
            'Jesús María',
            'Santiago de Surco',
            'San Borja',
            'Miraflores',
            'San Isidro',
            'La Molina',
            'Virtual',
          ])
        );
        return;
      }
      next();
    });
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMockPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
