<script setup lang="ts">
import type { PropType } from 'vue'
import type { DataObject } from '~/stores/annotation/types'
import { dataTypeImage } from '@onelabeler/core'
import { BaseOverlay } from '~/packages/label-task-types/chart'

const props = defineProps({
  datum: {
    type: Object as PropType<DataObject>,
    required: true,
  },
  index: {
    type: Number as PropType<number | null>,
    default: null,
  },
})

const { datum } = toRefs(props)
const { BaseDisplay } = dataTypeImage

const filename = computed(() => (
  (datum.value as { filename?: string })?.filename
))
</script>

<template>
  <div
    class="p-1 text-sm"
    bg="slate-100 dark:slate-900"
    border="~ gray-200"
    flex="~ col"
  >
    <div class="flex">
      <div v-if="index !== null" class="text-gray">
        {{ index }}. &nbsp;
      </div>
      <b>{{ filename }}</b>
    </div>
    <div class="flex-1 flex">
      <BaseDisplay
        class="flex-1"
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
