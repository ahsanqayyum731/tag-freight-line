import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative assets loading in production builds
  server: {
    port: 3000,
    open: true
  }
});
