<script setup lang="ts">
import type { Repeat } from '../types'
import VMenuMultiSelect from './VMenuMultiSelect.vue'

const props = defineProps<{
  repeat?: Repeat
}>()

const emit = defineEmits<{
  (e: 'update:repeat', value: Repeat): void
}>()

type RepeatField = 'row' | 'column'

const repeatMenuOptions: RepeatField[] = ['row', 'column']
const repeatMenuValue = computed(() => {
  return Object.keys(props.repeat ?? {}) as RepeatField[]
})

const updateRepeat = (fields: RepeatField[]): void => {
  const { repeat } = props
  const newValue: Repeat = {}
  fields.forEach((d) => {
    if (repeat === undefined) {
      newValue[d] = 1
      return
    }
    newValue[d] = d in repeat ? (repeat[d] as number) : 1
  })
  emit('update:repeat', JSON.parse(JSON.stringify(newValue)))
}

const updateRepeatRow = (row: number): void => {
  const newValue: Repeat = JSON.parse(JSON.stringify(props.repeat))
  newValue.row = row
  emit('update:repeat', newValue)
}

const updateRepeatColumn = (column: number): void => {
  const newValue: Repeat = JSON.parse(JSON.stringify(props.repeat))
  newValue.column = column
  emit('update:repeat', newValue)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <b>Repeat</b>
    <VMenuMultiSelect
      :value="repeatMenuValue"
      :options="repeatMenuOptions"
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
