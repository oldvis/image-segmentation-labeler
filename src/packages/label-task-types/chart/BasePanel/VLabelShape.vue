<script setup lang="ts">
import type { PropType } from 'vue'
import type { AnnotationChart, Encode, Mark, MarkType, Repeat } from '../types'
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
    class="p-1 border rounded gap-1"
    flex="~ col"
    :class="{ '!selected': isSelected }"
    @click="$emit('select', annotation)"
  >
    <div class="flex">
      <div fixed-value-container>
        Chart
      </div>
      <div class="grow" />
      <div class="flex gap-1 px-1">
        <b>Shape</b>
        <div fixed-value-container>
          {{ annotation.value.shape }}
        </div>
      </div>
      <button
        title="remove"
        class="icon-btn"
        @click.stop="$emit('remove', annotation)"
      >
        <div class="i-fa6-solid:trash" />
      </button>
    </div>
    <VLabelShapePosition
      class="mx-1"
      :points="annotation.value.points"
      :shape="annotation.value.shape"
    />
    <div
      v-if="annotation.user !== null"
      class="flex gap-1 mx-1"
    >
      <b>last modified by</b>
      <div fixed-value-container>
        {{ annotation.user.name }}
      </div>
    </div>

    <div border="t" />

    <div class="flex items-center gap-2 mx-1">
      <b>Title</b>
      <input
        :value="annotation.value.chart.title"
        input-area
        class="grow"
        placeholder="chart title"
        required
        @input="updateTitle"
      >
    </div>

    <div class="flex items-center gap-2 mx-1">
      <b>Theme</b>
      <input
        :value="annotation.value.chart.theme"
        input-area
        class="grow"
        placeholder="content theme"
        required
        @input="updateTheme"
      >
    </div>

    <div class="flex items-center gap-2 mx-1">
      <b>Language</b>
      <input
        :value="annotation.value.chart.language"
        input-area
        class="grow"
        placeholder="language used"
        required
        @input="updateLanguage"
      >
    </div>

    <div border="t" />

    <VLabelShapeRepeat
      class="mx-1"
      :repeat="annotation.value.chart.repeat"
      @update:repeat="updateRepeat"
    />

    <div border="t" />

    <div>
      <div class="flex gap-2 px-1">
        <b>Marks</b>
        <button
          icon-btn
          title="add"
          @click="addMark"
        >
          <div class="i-fa6-solid:plus m-auto" />
        </button>
      </div>
      <div
        v-if="annotation.value.chart.marks.length !== 0"
        class="gap-1"
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
    </div>
  </div>
</template>
