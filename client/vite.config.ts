import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: '../dist',
        sourcemap: true,
    },
    css: {
        devSourcemap: true,
    },
    plugins: [react(), tailwindcss(), svgr()],
    server: {
        proxy: {
            '/api': {
                changeOrigin: true,
                target: 'http://localhost:3001',
            },
        },
        // allowedHosts: ["1b03-185-199-103-83.ngrok-free.app"],
    },
    define: {
        __DEV__: JSON.stringify(true),
    },
});
