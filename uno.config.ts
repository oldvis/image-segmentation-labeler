import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    ['base-btn', 'text-sm inline-block cursor-pointer disabled:pointer-events-none'],
    ['btn', 'base-btn px-2 py-1 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-600 disabled:opacity-50 '],
    ['icon-btn', 'base-btn select-none opacity-75 transition hover:opacity-100 hover:text-teal-600 !outline-none'],
    ['view-container', 'border border-gray-200 flex flex-col overflow-auto'],
    ['view-header', 'border-b border-gray-200 p-1 flex gap-1 text-sm'],
    ['input-area', 'px-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded'],
    ['fixed-value-container', 'rounded px-1 self-center bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'],
    ['selected', 'border-black dark:border-gray-600'],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
})
