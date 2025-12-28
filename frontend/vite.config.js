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
                assetFileNames: '[name].[ext]'
            }
        },
        assetsDir: '',
        sourcemap: false,
        minify: 'esbuild',
        target: 'es2015'
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5000',
                changeOrigin: true,
                secure: false,
            },
            '/uploads': {
                target: 'http://127.0.0.1:5000',
                changeOrigin: true,
                secure: false,
            },
            '/socket.io': {
                target: 'http://127.0.0.1:5000',
                ws: true,
                changeOrigin: true
            }
        }
    }
})
