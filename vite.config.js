import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // Standard absolute paths for web hosting (Vercel)
  server: {
    port: 3000,
    open: true
  }
});
