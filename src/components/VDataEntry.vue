<script setup lang="ts">
import type { PropType } from 'vue'
import type { ImageDataObject } from '~/stores/annotation/types'
import { dataTypeImage } from '@onelabeler/core'
import { BaseOverlay } from '~/packages/label-task-types/chart'

const props = defineProps({
  datum: {
    type: Object as PropType<ImageDataObject>,
    required: true,
  },
  index: {
    type: Number as PropType<number | null>,
    default: null,
  },
})

const { datum } = toRefs(props)
const { BaseDisplay } = dataTypeImage

const filename = computed(() => datum.value.value.filename)
const imageLoading = ref(false)
const imageFailed = ref(false)

/** BaseDisplay uses SVG <image>; track load via a parallel HTMLImageElement. */
const resetImageState = (url: string | undefined): void => {
  imageFailed.value = false
  if (url === undefined || url === '') {
    imageLoading.value = false
    return
  }
  imageLoading.value = true
  const img = new Image()
  const finishOk = (): void => {
    imageLoading.value = false
  }
  const finishErr = (): void => {
    imageLoading.value = false
    imageFailed.value = true
  }
  img.onload = finishOk
  img.onerror = finishErr
  img.src = url
  if (img.complete) {
    if (img.naturalWidth > 0) finishOk()
    else finishErr()
  }
}

watch(() => datum.value.value.url, resetImageState, { immediate: true })
</script>

<template>
  <div
    class="text-sm p-2 flex grow flex-col min-h-0"
  >
    <div class="mb-1 flex shrink-0">
      <b>{{ filename }}</b>
    </div>
    <div class="flex flex-1 min-h-0 relative">
      <div
        v-if="imageLoading && !imageFailed"
        class="text-sm text-gray-500 flex gap-2 items-center inset-0 justify-center absolute z-1"
      >
        <div
          class="i-fa6-solid:spinner"
          animate-spin
        />
        Loading image
      </div>
      <BaseDisplay
        class="flex-1"
        :class="imageLoading ? 'opacity-0' : 'opacity-100'"
        :data-object="datum"
      >
        <template #overlay="overlayProps">
          <BaseOverlay
            v-bind="overlayProps"
            :data-object="datum"
            style="grid-area: 1 / 1 / 2 / 2"
          />
        </template>
      </BaseDisplay>
    </div>
  </div>
</template>
