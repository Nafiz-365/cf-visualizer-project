import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            },
        },
        server: {
            // HMR is disabled in AI Studio via DISABLE_HMR env var.
            // Do not modify—file watching is disabled to prevent flickering during agent edits.
            hmr: process.env.DISABLE_HMR !== 'true',
        },
        build: {
            target: 'esnext',
            minify: 'esbuild' as const,
            rollupOptions: {
                output: {
                    manualChunks: {
                        // React core — smallest, most cached chunk
                        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                        // Animation library
                        'vendor-motion': ['motion'],
                        // Charting library (largest vendor — 363 KB)
                        'vendor-recharts': ['recharts'],
                        // Icon library — tree-shaken per component, still worth isolating
                        'vendor-lucide': ['lucide-react'],
                        // Utility libs
                        'vendor-utils': ['clsx', 'tailwind-merge', 'date-fns'],
                    },
                },
            },
        },
        // Pre-bundle heavy deps for faster dev server cold start
        optimizeDeps: {
            include: ['react', 'react-dom', 'motion', 'recharts', 'date-fns'],
        },
    };
});
