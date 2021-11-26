import { defineConfig } from 'vite';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  base: `/${pkg.name}/`,
  server: {
    force: true,
  },
});
