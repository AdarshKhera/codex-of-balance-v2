import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/codex-of-balance-v2/',
  plugins: [react()],
  server: { port: 3040 }
});
