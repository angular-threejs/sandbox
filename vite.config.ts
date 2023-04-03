/// <reference types="vitest" />

import analog from '@analogjs/platform';
import { defineConfig } from 'vite';
import glslify from 'vite-plugin-glslify';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    publicDir: 'src/assets',
    build: {
        target: ['es2020'],
    },
    resolve: {
        mainFields: ['module'],
    },
    plugins: [glslify(), analog({ static: true })],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['src/test.ts'],
        include: ['**/*.spec.ts'],
    },
    define: {
        'import.meta.vitest': mode !== 'production',
    },
}));
