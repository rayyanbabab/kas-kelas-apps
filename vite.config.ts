import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { apiRouter } from './server/routes';
import { initializeDatabase } from './server/initDb';
import { isDbConfigured } from './server/db';

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      if (isDbConfigured) {
        initializeDatabase(false).catch((err) => {
          console.warn('Neon DB init error:', err);
        });
      }

      const app = express();
      app.use(express.json({ limit: '10mb' }));
      app.use('/api', apiRouter);

      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api')) {
          return (app as any)(req, res, next);
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
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
