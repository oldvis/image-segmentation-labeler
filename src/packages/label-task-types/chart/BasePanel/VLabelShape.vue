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

/** Mark type(s) drive color + primary title when present; shape is geometry only. */
const markTypes = computed(() => (
  [...new Set(props.annotation.value.chart.marks.map((d) => d.type))]
))

/** Show this many mark classes before collapsing the rest to +N. */
const MAX_HEADER_MARK_TYPES = 3

const headerMarkTypesShown = computed(() => (
  markTypes.value.slice(0, MAX_HEADER_MARK_TYPES)
))

const headerMarkOverflow = computed(() => (
  Math.max(0, markTypes.value.length - MAX_HEADER_MARK_TYPES)
))

const headerTitleHint = computed(() => (
  markTypes.value.length === 0
    ? `Shape ${props.annotation.value.shape} (no mark class yet)`
    : `Mark class ${markTypes.value.join(', ')} · shape ${props.annotation.value.shape}`
))

const shapeMetaPrefix = computed(() => `Shape ${props.annotation.value.shape}`)

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
    class="p-2 border rounded gap-1"
    flex="~ col"
    :class="{ selected: isSelected }"
    @click="$emit('select', annotation)"
  >
    <div class="flex gap-1.5 min-h-6 items-center">
      <div
        class="text-sm font-semibold flex flex-wrap gap-x-1.5 gap-y-0.5 min-w-0 items-center"
        :title="headerTitleHint"
      >
        <template v-if="markTypes.length === 0">
          <span
            class="rounded-sm shrink-0 h-2.5 w-2.5"
            :style="{ backgroundColor: categoryToColor(annotation.value.shape) }"
            aria-hidden="true"
          />
          <span class="truncate">{{ annotation.value.shape }}</span>
        </template>
        <template v-else>
          <template
            v-for="(markType, i) in headerMarkTypesShown"
            :key="markType"
          >
            <span
              v-if="i > 0"
              class="text-gray-300 font-normal select-none dark:text-gray-600"
              aria-hidden="true"
            >·</span>
            <span class="flex gap-1 min-w-0 items-center">
              <span
                class="rounded-sm shrink-0 h-2.5 w-2.5"
                :style="{ backgroundColor: categoryToColor(markType) }"
                aria-hidden="true"
              />
              <span class="truncate">{{ markType }}</span>
            </span>
          </template>
          <template v-if="headerMarkOverflow > 0">
            <span
              class="text-gray-300 font-normal select-none dark:text-gray-600"
              aria-hidden="true"
            >·</span>
            <span class="text-gray-500 font-medium dark:text-gray-400">
              +{{ headerMarkOverflow }}
            </span>
          </template>
        </template>
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

    <div class="text-sm text-gray-500 dark:text-gray-400">
      <span>{{ shapeMetaPrefix }}</span>
      <span aria-hidden="true"> · </span>
      <VLabelShapePosition
        class="inline"
        :points="annotation.value.points"
        :shape="annotation.value.shape"
      />
    </div>

    <div
      v-if="annotation.user !== null"
      class="text-sm text-gray-500 dark:text-gray-400"
    >
      Last modified by {{ annotation.user.name }}
    </div>

    <div class="pt-0.5 border-t border-gray-200 flex flex-col dark:border-gray-700">
      <VCollapseSection
        title="Details"
        :open="sections.details"
        @update:open="sections.details = $event"
      >
        <VFormField
          v-slot="{ id }"
          label="Title"
          label-class="w-16"
        >
          <input
            :id="id"
            :value="annotation.value.chart.title"
            class="w-40"
            placeholder="chart title"
            required
            input-area
            @input="updateTitle"
          >
        </VFormField>
        <VFormField
          v-slot="{ id }"
          label="Theme"
          label-class="w-16"
        >
          <input
            :id="id"
            :value="annotation.value.chart.theme"
            class="w-40"
            placeholder="content theme"
            required
            input-area
            @input="updateTheme"
          >
        </VFormField>
        <VFormField
          v-slot="{ id }"
          label="Language"
          label-class="w-16"
        >
          <input
            :id="id"
            :value="annotation.value.chart.language"
            class="w-40"
            placeholder="language used"
            required
            input-area
            @input="updateLanguage"
          >
        </VFormField>
      </VCollapseSection>

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

      <VCollapseSection
        title="Marks"
        :open="sections.marks"
        @update:open="sections.marks = $event"
      >
        <template #actions>
          <button
            type="button"
            tool-btn
            class="!min-w-6"
            title="Add mark"
            aria-label="Add mark"
            @click.stop="addMark"
          >
            <div class="i-fa6-solid:plus text-xs" />
          </button>
        </template>
        <div
          v-if="annotation.value.chart.marks.length !== 0"
          class="flex flex-col gap-1.5"
        >
          <VLabelShapeMark
            v-for="(mark, i) in annotation.value.chart.marks"
            :key="i"
            :index="i + 1"
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
  </div>
</template>
