import { defineConfig } from 'vite';

export default defineConfig({
  // https://sunnytruck.github.io/keito-survivor/
  // For another repository or a custom domain: npm run build -- --base=/other-path/
  base: '/keito-survivor/',
  build: {
    target: 'es2022',
    modulePreload: { polyfill: false },
  },
});
