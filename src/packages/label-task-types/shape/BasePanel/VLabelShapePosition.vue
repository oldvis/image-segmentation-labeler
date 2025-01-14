<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { ShapeType } from '../../shape'

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
  name: 'VLabelShapePosition',
  props: {
    points: {
      type: Array as PropType<[number, number][]>,
      required: true,
    },
    shape: {
      type: String as PropType<ShapeType>,
      required: true,
    },
  },
  data() {
    return { ShapeType }
  },
  computed: {
    bbox() {
      return getBBox(this.points)
    },
  },
})
</script>

<template>
  <div class="mx-1 flex">
    <template v-if="shape === ShapeType.Point">
      <div class="flex-1">
        x: {{ points[0][0] }}
      </div>
      <div class="flex-1">
        y: {{ points[0][1] }}
      </div>
    </template>
    <template v-if="shape === ShapeType.Rect">
      <div class="flex-1">
        xMin: {{ bbox.xMin }}
      </div>
      <div class="flex-1">
        yMin: {{ bbox.yMin }}
      </div>
      <div class="flex-1">
        xMax: {{ bbox.xMax }}
      </div>
      <div class="flex-1">
        yMax: {{ bbox.yMax }}
      </div>
    </template>
    <template v-if="shape === ShapeType.Polygon">
      <div class="flex-1">
        nPts: {{ points.length }}
      </div>
      <div class="flex-1">
        xMin: {{ bbox.xMin }}
      </div>
      <div class="flex-1">
        yMin: {{ bbox.yMin }}
      </div>
      <div class="flex-1">
        xMax: {{ bbox.xMax }}
      </div>
      <div class="flex-1">
        yMax: {{ bbox.yMax }}
      </div>
    </template>
  </div>
</template>
