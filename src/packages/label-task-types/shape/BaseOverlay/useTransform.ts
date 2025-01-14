import type { Ref } from 'vue'
import { useElementSize } from '@vueuse/core'
import { computed } from 'vue'

const useTransform = (
  container: Ref<HTMLDivElement | undefined>,
  contentWidth: Ref<number | null>,
  contentHeight: Ref<number | null>,
) => {
  const { width, height } = useElementSize(container)

  const bbox = computed(() => {
    const padding = 0
    const xMin = -padding
    const xMax = (contentWidth.value ?? width.value) + padding
    const yMin = -padding
    const yMax = (contentHeight.value ?? height.value) + padding
    return { xMin, xMax, yMin, yMax }
  })

  const scale = computed(() => {
    const { xMin, xMax, yMin, yMax } = bbox.value
    const zoomToWidth = xMax - xMin
    const zoomToHeight = yMax - yMin
    const s = Math.min(
      width.value / zoomToWidth,
      height.value / zoomToHeight,
    )
    return { x: s, y: s }
  })

  const position = computed(() => {
    const { xMin, xMax, yMin, yMax } = bbox.value
    const cx = (xMax + xMin) / 2
    const cy = (yMax + yMin) / 2
    const x = width.value / 2 - cx * scale.value.x
    const y = height.value / 2 - cy * scale.value.y
    return { x, y }
  })

  return {
    /** The scale transform to fit the content into the container. */
    scale,
    /** The position transform to move the content to the container center. */
    position,
  }
}

export default useTransform
