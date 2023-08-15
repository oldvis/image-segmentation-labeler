<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { dataTypeImage } from '@onelabeler/core'
import type { DataObject } from '~/stores/annotation/types'
import { BaseOverlay } from '~/packages/label-task-types/chart'

export default defineComponent({
  components: {
    BaseDisplay: dataTypeImage.BaseDisplay,
    BaseOverlay,
  },
  props: {
    datum: {
      type: Object as PropType<DataObject>,
      required: true,
    },
    index: {
      type: Number as PropType<number | null>,
      default: null,
    },
  },
  computed: {
    filename(): string | undefined {
      return (this.datum.value as { filename?: string })?.filename
    },
  },
})
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
        <template #overlay="props">
          <BaseOverlay
            v-bind="props"
            :data-object="datum"
            style="grid-area: 1 / 1 / 2 / 2"
          />
        </template>
      </BaseDisplay>
    </div>
  </div>
</template>
