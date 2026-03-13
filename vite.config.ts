import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'fix-fetch-assignment',
      enforce: 'pre',
      transform(code, id) {
        if (id.includes('node_modules')) {
          const patterns = [
            /global\.fetch\s*=\s*/g,
            /window\.fetch\s*=\s*/g,
            /globalThis\.fetch\s*=\s*/g,
            /self\.fetch\s*=\s*/g,
            /global\['fetch'\]\s*=\s*/g,
            /global\["fetch"\]\s*=\s*/g,
            /Object\.defineProperty\s*\(\s*(global|window|globalThis|self)\s*,\s*['"]fetch['"]\s*,/g,
            /\.fetch\s*=\s*function/g,
            /\.fetch\s*=\s*async\s*function/g,
            /\w\.fetch\s*=\s*\w/g, // Minified assignments
            /fetch\s*=\s*function/g,
          ];
          let newCode = code;
          let changed = false;
          for (const pattern of patterns) {
            if (pattern.test(newCode)) {
              newCode = newCode.replace(pattern, (match) => `/* ${match} */ (function(){}) `);
              changed = true;
            }
          }
          if (changed) return newCode;
        }
      }
    }
  ],
  base: './',
  define: {
    'process.env': {},
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
});
