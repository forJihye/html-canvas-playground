import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    lib: {
      entry: 'canvas-txt/index.ts',
      name: 'canvasTxt',
      formats: ['es', 'umd'],
      fileName: 'canvas-txt'
    }
  }
})
