<script setup lang="ts">
import type { Encode, Mark, MarkType, SchemaType, Value } from '../types'
import VCollapseSection from '~/components/VCollapseSection.vue'
import VFormField from '~/components/VFormField.vue'
import VMenu from '~/packages/VMenu/index.vue'
import { encodeChannels, MeasurementType, measurementTypes, schemaTypes } from '../types'
import VMenuMultiSelect from './VMenuMultiSelect.vue'

const props = defineProps({
  mark: {
    type: Object as PropType<Mark>,
    required: true,
  },
  categories: {
    type: Array as PropType<string[]>,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'update:markEncode', value: Encode): void
  (e: 'update:markSchema', value: SchemaType): void
  (e: 'update:markType', value: MarkType): void
  (e: 'remove'): void
}>()

const encodeOpen = ref(Object.keys(props.mark.encode).length > 0)
watch(
  () => Object.keys(props.mark.encode).length,
  (n) => {
    if (n > 0) encodeOpen.value = true
  },
)

const updateChannel = (channels: string[]): void => {
  const { encode } = props.mark
  const newValue: Encode = {}
  channels.forEach((channel) => {
    const value: Value = channel in encode
      ? (encode[channel] as Value)
      : { field: '', type: MeasurementType.Quantitative }
    newValue[channel] = value
  })
  emit('update:markEncode', JSON.parse(JSON.stringify(newValue)))
}

const updateChannelType = (channel: string, type: MeasurementType): void => {
  const newValue: Encode = JSON.parse(JSON.stringify(props.mark.encode))
  if (newValue[channel] === undefined) {
    throw new Error('channel undefined')
  }
  newValue[channel].type = type
  emit('update:markEncode', newValue)
}

const updateChannelField = (channel: string, field: string): void => {
  const newValue: Encode = JSON.parse(JSON.stringify(props.mark.encode))
  if (newValue[channel] === undefined) {
    throw new Error('channel undefined')
  }
  (newValue[channel] as Value).field = field
  emit('update:markEncode', newValue)
}
</script>

<template>
  <div class="p-2 border rounded bg-gray-50/60 flex flex-col gap-2 dark:bg-gray-800/40">
    <div class="flex gap-2 items-center">
      <VFormField
        v-slot="{ id }"
        label="Schema"
        label-class="w-16"
      >
        <VMenu
          :id="id"
          :value="mark.schema"
          :options="schemaTypes"
          @update:value="$emit('update:markSchema', $event)"
        />
      </VFormField>
      <div class="grow" />
      <button
        type="button"
        title="Remove mark"
        aria-label="Remove mark"
        class="icon-btn"
        @click.stop="$emit('remove')"
      >
        <div class="i-fa6-solid:trash" />
      </button>
    </div>
    <VFormField
      v-slot="{ id }"
      label="Mark type"
      label-class="w-20"
    >
      <VMenu
        :id="id"
        :value="mark.type"
        :options="categories"
        @update:value="$emit('update:markType', $event as MarkType)"
      />
    </VFormField>
    <VCollapseSection
      title="Encode"
      :open="encodeOpen"
      @update:open="encodeOpen = $event"
    >
      <div class="flex flex-col gap-2">
        <VFormField
          v-slot="{ id }"
          label="Channels"
          label-class="w-20"
        >
          <VMenuMultiSelect
            :id="id"
            :value="Object.keys(mark.encode)"
            :options="encodeChannels"
            @update:value="updateChannel"
          />
        </VFormField>
        <div
          v-if="Object.entries(mark.encode).length !== 0"
          class="p-2 border rounded gap-2"
          flex="~ col"
        >
          <div
            v-for="([key, d], i) in Object.entries(mark.encode)"
            :key="i"
            flex="~ col gap-1"
          >
            <div
              v-if="i !== 0"
              class="border-t"
            />
            <div class="text-sm flex gap-1 items-center">
              <span class="text-gray-500">Channel</span>
              <div fixed-value-container>
                {{ key }}
              </div>
            </div>
            <VFormField
              v-slot="{ id }"
              label="Field"
              label-class="w-16"
            >
              <input
                :id="id"
                :value="d?.field"

                class="w-full"
                placeholder="field"
                required input-area
                @input="updateChannelField(key as string, ($event.target as HTMLInputElement).value)"
              >
            </VFormField>
            <VFormField
              v-slot="{ id }"
              label="Measure"
              label-class="w-16"
            >
              <VMenu
                :id="id"
                :value="d?.type ?? MeasurementType.Quantitative"
                :options="measurementTypes"
                @update:value="updateChannelType(key as string, $event)"
              />
            </VFormField>
          </div>
        </div>
      </div>
    </VCollapseSection>
  </div>
</template>
