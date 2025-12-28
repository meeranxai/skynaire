import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: undefined,
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return '[name].css';
                    }
                    return '[name].[ext]';
                }
            }
        },
        sourcemap: false,
        minify: false,
        target: 'es2020',
        assetsDir: 'assets'
    },
    esbuild: {
        target: 'es2020'
    }
})
