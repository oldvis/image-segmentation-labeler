import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWebFonts,
  presetWind4,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    ['base-btn', 'text-sm inline-block cursor-pointer disabled:pointer-events-none'],
    ['btn', 'base-btn px-3 py-1.5 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-600 disabled:opacity-50'],
    ['btn-secondary', 'base-btn px-3 py-1.5 rounded bg-transparent text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50'],
    ['icon-btn', 'base-btn select-none opacity-75 transition hover:opacity-100 hover:text-teal-600 !outline-none'],
    ['tool-btn', 'icon-btn flex items-center justify-center min-w-8 min-h-8 px-1.5 rounded border border-transparent'],
    ['tool-btn-active', 'tool-btn !opacity-100 border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200 dark:border-teal-500'],
    ['view-container', 'border border-gray-200 dark:border-gray-700 rounded flex flex-col overflow-auto bg-white dark:bg-gray-900'],
    ['view-header', 'border-b border-gray-200 dark:border-gray-700 px-2 py-1.5 flex gap-2 text-sm items-center'],
    ['input-area', 'px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm'],
    ['fixed-value-container', 'rounded px-1.5 py-0.5 self-center bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-mono'],
    ['selected', 'border-teal-600 ring-1 ring-teal-600/40 dark:border-teal-500 dark:ring-teal-500/40'],
    ['workspace-band', 'border border-gray-200 dark:border-gray-700 rounded'],
    ['workspace-gap', 'gap-2'],
    ['panel-stack', 'flex flex-col gap-2 p-2 overflow-auto'],
    ['toolbar-group', 'flex items-center gap-2 px-2 py-1'],
    ['toolbar-label', 'text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 my-auto'],
  ],
  presets: [
    presetWind4(),
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
