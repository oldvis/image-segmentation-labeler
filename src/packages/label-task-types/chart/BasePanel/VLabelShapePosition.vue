<script setup lang="ts">
import { ShapeType } from '../../shape'

const props = defineProps<{
  points: [number, number][]
  shape: ShapeType
}>()

const meta = computed((): string => {
  const { shape, points } = props
  if (shape === ShapeType.Point) {
    const [x, y] = points[0] ?? [0, 0]
    return `x ${x} · y ${y}`
  }
  const xs = points.map((d) => d[0])
  const ys = points.map((d) => d[1])
  const ranges = `x [${Math.min(...xs)}, ${Math.max(...xs)}] · y [${Math.min(...ys)}, ${Math.max(...ys)}]`
  if (shape === ShapeType.Polygon) {
    return `nPts ${points.length} · ${ranges}`
  }
  return ranges
})
</script>

<template>
  <span>{{ meta }}</span>
</template>
