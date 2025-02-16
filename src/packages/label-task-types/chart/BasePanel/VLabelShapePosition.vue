<script setup lang="ts">
import { computed } from 'vue'
import { ShapeType } from '../../shape'

const props = defineProps<{
  points: [number, number][]
  shape: ShapeType
}>()

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

const bbox = computed(() => getBBox(props.points))
</script>

<template>
  <div class="flex">
    <template v-if="shape === ShapeType.Point">
      <div class="grow flex items-center gap-1">
        <b>x</b>
        <div fixed-value-container>
          {{ points[0][0] }}
        </div>
      </div>
      <div class="grow flex items-center gap-1">
        <b>y</b>
        <div fixed-value-container>
          {{ points[0][1] }}
        </div>
      </div>
    </template>
    <template v-if="shape === ShapeType.Rect">
      <div class="grow flex gap-2">
        <b>x range</b>
        <div fixed-value-container>
          [{{ bbox.xMin }}, {{ bbox.xMax }}]
        </div>
      </div>
      <div class="grow flex gap-2">
        <b>y range</b>
        <div fixed-value-container>
          [{{ bbox.yMin }}, {{ bbox.yMax }}]
        </div>
      </div>
    </template>
    <template v-if="shape === ShapeType.Polygon">
      <div class="grow flex gap-2">
        <b>nPts</b>
        <div fixed-value-container>
          {{ points.length }}
        </div>
      </div>
      <div class="grow flex gap-2">
        <b>x range</b>
        <div fixed-value-container>
          [{{ bbox.xMin }}, {{ bbox.xMax }}]
        </div>
      </div>
      <div class="grow flex gap-2">
        <b>y range</b>
        <div fixed-value-container>
          [{{ bbox.yMin }}, {{ bbox.yMax }}]
        </div>
      </div>
    </template>
  </div>
</template>
