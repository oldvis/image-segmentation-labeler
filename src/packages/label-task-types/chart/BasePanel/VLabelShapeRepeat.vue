<script lang="ts">
import type { PropType } from 'vue'
import type { Repeat } from '../types'
import { defineComponent } from 'vue'
import VMenuMultiSelect from './VMenuMultiSelect.vue'

export default defineComponent({
  name: 'VLabelShapeRepeat',
  components: { VMenuMultiSelect },
  props: {
    repeat: {
      type: Object as PropType<Repeat | undefined>,
      default: undefined,
    },
  },
  emits: {
    'update:repeat': null,
  },
  methods: {
    updateRepeat(fields: ('row' | 'column')[]): void {
      const { repeat } = this
      const newValue: Repeat = {}
      fields.forEach((d) => {
        if (repeat === undefined) {
          newValue[d] = 1
          return
        }
        newValue[d] = d in repeat ? (repeat[d] as number) : 1
      })
      this.$emit('update:repeat', JSON.parse(JSON.stringify(newValue)))
    },
    updateRepeatRow(row: number): void {
      const newValue: Repeat = JSON.parse(JSON.stringify(this.repeat))
      newValue.row = row
      this.$emit('update:repeat', newValue)
    },
    updateRepeatColumn(column: number): void {
      const newValue: Repeat = JSON.parse(JSON.stringify(this.repeat))
      newValue.column = column
      this.$emit('update:repeat', newValue)
    },
  },
})
</script>

<template>
  <div class="flex items-center gap-2">
    <b>Repeat</b>
    <VMenuMultiSelect
      :value="Object.keys(repeat ?? {})"
      :options="['row', 'column']"
      @update:value="updateRepeat"
    />
    <div
      v-if="repeat?.row !== undefined"
      class="flex items-center gap-2"
    >
      <b>Row</b>
      <input
        :value="repeat?.row"
        input-area
        class="w-12"
        type="number"
        min="1"
        required
        @input="updateRepeatRow(+($event.target as HTMLInputElement).value)"
      >
    </div>
    <div
      v-if="repeat?.column !== undefined"
      class="flex items-center gap-2"
    >
      <b>Column</b>
      <input
        :value="repeat?.column"
        input-area
        class="w-12"
        type="number"
        min="1"
        required
        @input="updateRepeatColumn(+($event.target as HTMLInputElement).value)"
      >
    </div>
  </div>
</template>
