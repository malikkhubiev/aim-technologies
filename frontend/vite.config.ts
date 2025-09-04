import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
    root: '.',
    build: {
        outDir: path.resolve(__dirname, '../app/static'),
        emptyOutDir: false,
        cssMinify: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom']
                }
            }
        }
    },
    server: {
        port: 5173,
        proxy: {
            '/health': 'http://localhost:8000',
            '/jaicp': 'http://localhost:8000',
            '/recommend': 'http://localhost:8000'
        }
    }
})


