<script setup lang="ts">
import type { PropType } from 'vue'
import type { AnnotationChart, Encode, Mark, MarkType, Repeat } from '../types'
import VCollapseSection from '~/components/VCollapseSection.vue'
import VFormField from '~/components/VFormField.vue'
import { SchemaType } from '../types'
import VLabelShapeMark from './VLabelShapeMark.vue'
import VLabelShapePosition from './VLabelShapePosition.vue'
import VLabelShapeRepeat from './VLabelShapeRepeat.vue'

const props = defineProps({
  annotation: {
    type: Object as PropType<AnnotationChart>,
    required: true,
  },
  categories: {
    type: Array as PropType<string[]>,
    required: true,
  },
  categoryToColor: {
    type: Function as PropType<(category: string) => string>,
    required: true,
  },
  isSelected: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'select', annotation: AnnotationChart): void
  (e: 'update', annotation: AnnotationChart): void
  (e: 'remove', annotation: AnnotationChart): void
}>()

const sections = ref({
  details: false,
  repeat: false,
  marks: false,
})

const updateTitle = (e: Event): void => {
  const { annotation } = props
  const newValue: AnnotationChart = JSON.parse(JSON.stringify(annotation))
  newValue.value.chart.title = (e.target as HTMLInputElement).value
  emit('update', newValue)
}

const updateTheme = (e: Event): void => {
  const { annotation } = props
  const newValue: AnnotationChart = JSON.parse(JSON.stringify(annotation))
  newValue.value.chart.theme = (e.target as HTMLInputElement).value
  emit('update', newValue)
}

const updateLanguage = (e: Event): void => {
  const { annotation } = props
  const newValue: AnnotationChart = JSON.parse(JSON.stringify(annotation))
  newValue.value.chart.language = (e.target as HTMLInputElement).value
  emit('update', newValue)
}

const updateMarkSchema = (i: number, value: SchemaType): void => {
  const { annotation } = props
  const newValue: AnnotationChart = JSON.parse(JSON.stringify(annotation))
  newValue.value.chart.marks[i].schema = value
  emit('update', newValue)
}

const updateMarkType = (i: number, value: MarkType): void => {
  const { annotation } = props
  const newValue: AnnotationChart = JSON.parse(JSON.stringify(annotation))
  newValue.value.chart.marks[i].type = value
  emit('update', newValue)
}

const updateMarkEncode = (i: number, value: Encode): void => {
  const { annotation } = props
  const newValue: AnnotationChart = JSON.parse(JSON.stringify(annotation))
  newValue.value.chart.marks[i].encode = value
  emit('update', newValue)
}

const updateRepeat = (repeat: Repeat): void => {
  const { annotation } = props
  const newValue: AnnotationChart = JSON.parse(JSON.stringify(annotation))
  newValue.value.chart.repeat = repeat
  emit('update', newValue)
}

const addMark = (): void => {
  const { annotation } = props
  const newValue: AnnotationChart = JSON.parse(JSON.stringify(annotation))
  const mark: Mark = {
    schema: SchemaType.Tabular,
    type: 'Others',
    encode: {},
  }
  newValue.value.chart.marks.push(mark)
  emit('update', newValue)
}

const removeMark = (i: number): void => {
  const { annotation } = props
  const newValue: AnnotationChart = JSON.parse(JSON.stringify(annotation))
  newValue.value.chart.marks.splice(i, 1)
  emit('update', newValue)
}
</script>

<template>
  <div
    data-testid="span-card"
    class="p-2 border rounded gap-2"
    flex="~ col"
    :class="{ selected: isSelected }"
    @click="$emit('select', annotation)"
  >
    <div class="flex gap-2 items-center">
      <div fixed-value-container>
        Chart
      </div>
      <div class="text-sm flex gap-1 items-center">
        <div class="text-gray-500">
          Shape
        </div>
        <div fixed-value-container>
          {{ annotation.value.shape }}
        </div>
      </div>
      <div class="grow" />
      <button
        type="button"
        title="Remove chart"
        aria-label="Remove chart"
        class="icon-btn"
        @click.stop="$emit('remove', annotation)"
      >
        <div class="i-fa6-solid:trash" />
      </button>
    </div>

    <VLabelShapePosition
      :points="annotation.value.points"
      :shape="annotation.value.shape"
    />

    <div
      v-if="annotation.user !== null"
      class="text-sm mx-0 flex flex-wrap gap-2 items-center"
    >
      <div class="text-gray-500">
        Last modified by
      </div>
      <div fixed-value-container>
        {{ annotation.user.name }}
      </div>
    </div>

    <div border="t gray-200" />

    <VCollapseSection
      title="Details"
      :open="sections.details"
      @update:open="sections.details = $event"
    >
      <div class="flex flex-col gap-2">
        <VFormField
          v-slot="{ id }"
          label="Title"
        >
          <input
            :id="id"
            :value="annotation.value.chart.title"

            class="w-full"
            placeholder="chart title"
            required input-area
            @input="updateTitle"
          >
        </VFormField>
        <VFormField
          v-slot="{ id }"
          label="Theme"
        >
          <input
            :id="id"
            :value="annotation.value.chart.theme"

            class="w-full"
            placeholder="content theme"
            required input-area
            @input="updateTheme"
          >
        </VFormField>
        <VFormField
          v-slot="{ id }"
          label="Language"
        >
          <input
            :id="id"
            :value="annotation.value.chart.language"

            class="w-full"
            placeholder="language used"
            required input-area
            @input="updateLanguage"
          >
        </VFormField>
      </div>
    </VCollapseSection>

    <div border="t gray-200" />

    <VCollapseSection
      title="Repeat"
      :open="sections.repeat"
      @update:open="sections.repeat = $event"
    >
      <VLabelShapeRepeat
        :repeat="annotation.value.chart.repeat"
        @update:repeat="updateRepeat"
      />
    </VCollapseSection>

    <div border="t gray-200" />

    <VCollapseSection
      title="Marks"
      :open="sections.marks"
      @update:open="sections.marks = $event"
    >
      <template #actions>
        <button
          type="button"
          icon-btn
          title="Add mark"
          aria-label="Add mark"
          @click.stop="addMark"
        >
          <div class="i-fa6-solid:plus m-auto" />
        </button>
      </template>
      <div
        v-if="annotation.value.chart.marks.length !== 0"
        class="gap-2"
        flex="~ col"
      >
        <VLabelShapeMark
          v-for="(mark, i) in annotation.value.chart.marks"
          :key="i"
          :mark="mark"
          :categories="categories"
          @update:mark-schema="updateMarkSchema(i, $event)"
          @update:mark-type="updateMarkType(i, $event)"
          @update:mark-encode="updateMarkEncode(i, $event)"
          @remove="removeMark(i)"
        />
      </div>
      <div
        v-else
        class="text-sm text-gray-500"
      >
        No marks yet. Use + to add one.
      </div>
    </VCollapseSection>
  </div>
</template>
