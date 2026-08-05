<script setup lang="ts">
import type { Repeat } from '../types'
import VFormField from '~/components/VFormField.vue'
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
  <div class="flex flex-col gap-1">
    <VFormField
      v-slot="{ id }"
      label="Axes"
      label-class="w-16"
    >
      <VMenuMultiSelect
        :id="id"
        :value="repeatMenuValue"
        :options="repeatMenuOptions"
        @update:value="updateRepeat"
      />
    </VFormField>
    <VFormField
      v-if="repeat?.row !== undefined"
      v-slot="{ id }"
      label="Row"
      label-class="w-16"
    >
      <input
        :id="id"
        :value="repeat?.row"
        class="w-16"
        type="number"
        min="1"
        required
        input-area
        @input="updateRepeatRow(+($event.target as HTMLInputElement).value)"
      >
    </VFormField>
    <VFormField
      v-if="repeat?.column !== undefined"
      v-slot="{ id }"
      label="Column"
      label-class="w-16"
    >
      <input
        :id="id"
        :value="repeat?.column"
        class="w-16"
        type="number"
        min="1"
        required
        input-area
        @input="updateRepeatColumn(+($event.target as HTMLInputElement).value)"
      >
    </VFormField>
  </div>
</template>
