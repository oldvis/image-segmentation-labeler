/// <reference types="vitest" />

import path from 'node:path'
import process from 'node:process'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import Pages from 'vite-plugin-pages'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/image-segmentation-labeler/' : '/',
  resolve: {
    alias: {
      '~/': `${path.resolve(import.meta.dirname, 'src')}/`,
      // Konva's package.json points "main" at lib/index-node.js (requires the native
      // `canvas` package) and "browser" at lib/index.js (DOM). Vite's app build usually
      // honors "browser"; Vitest resolves in Node and often picks "main", so unit tests
      // that import Konva fail without the `canvas` native addon. Pin the browser entry
      // so jsdom tests can load Konva without installing `canvas`.
      'konva': path.resolve(import.meta.dirname, 'node_modules/konva/lib/index.js'),
    },
  },
  plugins: [
    VueMacros({
      defineOptions: false,
      defineModels: false,
      plugins: {
        vue: Vue({
          script: {
            propsDestructure: true,
            defineModel: true,
          },
        }),
      },
    }),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages(),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
      ],
      dts: true,
      dirs: [
        './src/composables',
      ],
      vueTemplate: true,
    }),

    // https://github.com/antfu/vite-plugin-components
    Components({
      dts: true,
    }),

    // https://github.com/antfu/unocss
    // see uno.config.ts for config
    UnoCSS(),
  ],

  // https://github.com/vitest-dev/vitest
  test: {
    environment: 'jsdom',
    setupFiles: [
      './test/polyfill-localstorage.ts',
      './test/polyfill-canvas.ts',
      './test/setup.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
})
