<script lang="ts">
import type { PropType } from 'vue'
import type { Encode, Mark, Value } from '../types'
import { defineComponent } from 'vue'
import VMenu from '~/packages/VMenu/index.vue'
import {
  encodeChannels,
  MeasurementType,
  measurementTypes,
  schemaTypes,
} from '../types'
import VMenuMultiSelect from './VMenuMultiSelect.vue'

export default defineComponent({
  name: 'VLabelShapeMark',
  components: { VMenu, VMenuMultiSelect },
  props: {
    mark: {
      type: Object as PropType<Mark>,
      required: true,
    },
    categories: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  emits: {
    'update:markEncode': null,
    'update:markSchema': null,
    'update:markType': null,
    'remove': null,
  },
  data() {
    return {
      encodeChannels,
      measurementTypes,
      schemaTypes,
    }
  },
  methods: {
    updateChannel(channels: string[]): void {
      const { encode } = this.mark
      const newValue: Encode = {}
      channels.forEach((channel) => {
        const value: Value = channel in encode
          ? (encode[channel] as Value)
          : { field: '', type: MeasurementType.Quantitative }
        newValue[channel] = value
      })
      this.$emit('update:markEncode', JSON.parse(JSON.stringify(newValue)))
    },
    updateChannelType(channel: string, type: MeasurementType): void {
      const newValue: Encode = JSON.parse(JSON.stringify(this.mark.encode))
      if (newValue[channel] === undefined) {
        throw new Error('channel undefined')
      }
      (newValue[channel] as Value).type = type
      this.$emit('update:markEncode', newValue)
    },
    updateChannelField(channel: string, field: string): void {
      const newValue: Encode = JSON.parse(JSON.stringify(this.mark.encode))
      if (newValue[channel] === undefined) {
        throw new Error('channel undefined')
      }
      (newValue[channel] as Value).field = field
      this.$emit('update:markEncode', newValue)
    },
  },
})
</script>

<template>
  <div class="border rounded flex flex-col gap-1 p-1">
    <div class="flex gap-1">
      <div class="flex gap-1">
        <b>Schema</b>
        <VMenu
          :value="mark.schema"
          :options="schemaTypes"
          @update:value="$emit('update:markSchema', $event)"
        />
      </div>
      <div class="grow" />
      <!-- The remove button. -->
      <button
        title="remove"
        class="icon-btn"
        @click.stop="$emit('remove')"
      >
        <div class="i-fa6-solid:trash" />
      </button>
    </div>
    <div class="flex gap-1">
      <b>Type</b>
      <VMenu
        :value="mark.type"
        :options="categories"
        @update:value="$emit('update:markType', $event)"
      />
    </div>
    <div flex="~ col">
      <div class="flex items-center gap-2">
        <b>Encode</b>
        <VMenuMultiSelect
          :value="Object.keys(mark.encode)"
          :options="encodeChannels"
          @update:value="updateChannel"
        />
      </div>
      <div
        v-if="Object.entries(mark.encode).length !== 0"
        class="border rounded gap-1 p-1"
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
          <div class="flex items-center gap-1">
            <b>Channel</b>
            <div fixed-value-container>
              {{ key }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <b>Field</b>
            <input
              :value="d?.field"
              input-area
              class="grow"
              placeholder="field"
              required
              @input="updateChannelField(key as string, ($event.target as HTMLInputElement).value)"
            >
          </div>
          <div class="flex gap-2">
            <b>Type</b>
            <VMenu
              :value="d?.type ?? ''"
              :options="measurementTypes"
              @update:value="updateChannelType(key as string, $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
