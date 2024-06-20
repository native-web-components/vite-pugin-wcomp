import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { wcomp } from 'vite-plugin-wcomp'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag: any) => tag.startsWith('wc-')
        }
      }
    }),
    wcomp()
  ],
})
