import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
    },
    define: {
      'import.meta.env.VITE_DATABASE_URL': JSON.stringify(env.DATABASE_URL),
    },
  };
});