import {defineConfig} from 'vite';
import build from '@hono/vite-build';
import devServer from '@hono/vite-dev-server';

export default defineConfig({
    plugins: [
        devServer({
            entry: './src/index.ts',
        }),
        build({
            entry: './src/index.ts',
        }),
    ],
});