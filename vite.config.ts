/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  test: {
    include: ['tests/**/*'],
    exclude: ['dist/*', 'src/*']
  },
  build: {
    minify: true,
    reportCompressedSize: true,
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'ODataServer',
      // the proper extensions will be added
      fileName: 'ODataServer',
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [],
      // Provide global variables to use in the UMD build
      // for externalized deps
      output: {
        globals: {}
      }
    }
  }
})
