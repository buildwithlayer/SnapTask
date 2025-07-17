import react from '@vitejs/plugin-react';
import {defineConfig, loadEnv} from 'vite';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd());
    return {
        build: {
            outDir: '../dist',
        },
        plugins: [react(), tailwindcss(), svgr()],
        server: {
            allowedHosts: env.VITE_ALLOWED_HOSTS?.split(',') || [],
            proxy: {
                '/api': {
                    changeOrigin: true,
                    target: 'http://localhost:3001',
                },
            },
        },
    };});
