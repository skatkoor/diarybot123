import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
    },
    define: {
      'process.env.VITE_DATABASE_URL': JSON.stringify(env.VITE_DATABASE_URL),
      'process.env.VITE_CLOUDFLARE_ACCOUNT_ID': JSON.stringify(env.VITE_CLOUDFLARE_ACCOUNT_ID),
      'process.env.VITE_R2_ACCESS_KEY_ID': JSON.stringify(env.VITE_R2_ACCESS_KEY_ID),
      'process.env.VITE_R2_SECRET_ACCESS_KEY': JSON.stringify(env.VITE_R2_SECRET_ACCESS_KEY),
      'process.env.VITE_R2_BUCKET_NAME': JSON.stringify(env.VITE_R2_BUCKET_NAME),
    },
  };
});