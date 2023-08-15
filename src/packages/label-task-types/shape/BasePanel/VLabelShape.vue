<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { ShapeType } from '../types'
import type { AnnotationShape } from '../types'
import VMenuCategory from '../components/VMenuCategory.vue'
import VLabelShapePosition from './VLabelShapePosition.vue'

const getBBox = (points: [number, number][]): {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
} => {
  const xMin = Math.min(...points.map((d) => d[0]))
  const xMax = Math.max(...points.map((d) => d[0]))
  const yMin = Math.min(...points.map((d) => d[1]))
  const yMax = Math.max(...points.map((d) => d[1]))
  return { xMin, xMax, yMin, yMax }
}

export default defineComponent({
  name: 'VLabelShape',
  components: { VLabelShapePosition, VMenuCategory },
  props: {
    annotation: {
      type: Object as PropType<AnnotationShape>,
      required: true,
    },
    categories: {
      type: Array as PropType<string[]>,
      required: true,
    },
    categoryToColor: {
      type: Function as PropType<((category: string) => string)>,
      required: true,
    },
    isSelected: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  emits: {
    select: null,
    update: null,
    remove: null,
  },
  data() {
    return { ShapeType }
  },
  computed: {
    bbox() {
      return getBBox(this.annotation.value.points)
    },
  },
  methods: {
    update(category: string): void {
      const { annotation } = this
      this.$emit('update', {
        ...annotation,
        value: { ...annotation.value, category },
      })
    },
  },
})
</script>

<template>
  <div
    class="border border-gray-200 p-1 rounded"
    :class="{ '!selected': isSelected }"
    @click="$emit('select', annotation)"
  >
    <div class="flex">
      <!-- The category legend. -->
      <VMenuCategory
        class="btn"
        :value="annotation.value.category"
        :categories="categories"
        :category-to-color="categoryToColor"
        @update:value="update"
      />
      <div class="grow" />
      <div class="px-1 border border-gray-200 rounded">
        shape: {{ annotation.value.shape }}
      </div>

      <!-- The remove button. -->
      <button
        title="remove"
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
      class="flex gap-1 mx-1"
    >
      <b>last modified by</b>
      <div fixed-value-container>
        {{ annotation.user.name }}
      </div>
    </div>
  </div>
</template>
