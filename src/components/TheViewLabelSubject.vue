<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStore } from '~/stores/annotation'
import { StatusType } from '~/stores/annotation/types'

const { dataObjects, selectedDataObjects, statuses } = storeToRefs(useStore())

const content = ref<HTMLDivElement>()
/** The number of shown data objects. */
const shownNumber = ref(1)
/** The start index of shown data objects. */
const startIndex = ref(0)
/** The data objects that should be shown. */
const shown = computed(() => (
  dataObjects.value.slice(
    startIndex.value,
    startIndex.value + shownNumber.value,
  )
))

/** Show n more entries. */
const showNext = (n: number): void => {
  // Mark leaving entries as Labeled (not Viewed). In segmentation, an empty
  // annotation set can be a valid completion — nothing to segment — so navigating
  // away is treated as done. A dedicated skip/confirm-empty flow would refine this.
  const shownUuids = new Set(shown.value.map((d) => d.uuid))
  statuses.value = statuses.value.map((d) => (
    shownUuids.has(d.uuid) ? { ...d, value: StatusType.Labeled } : d
  ))

  startIndex.value = Math.min(
    Math.max(0, startIndex.value + n),
    dataObjects.value.length,
  )
  if (content.value !== undefined) {
    content.value.scrollTop = 0
  }
}

onMounted(() => {
  selectedDataObjects.value = shown.value
})
watch(shown, () => {
  selectedDataObjects.value = shown.value
})
</script>

<template>
  <div flex="~ col">
    <div
      v-if="shown.length !== 0"
      ref="content"
      class="scroll-smooth flex-1 gap-1 overflow-auto"
      flex="~ col"
    >
      <VDataEntry
        v-for="(d, i) in shown"
        :key="d.uuid"
        :datum="d"
        :index="startIndex + i + 1"
        class="flex-1"
      />
      <div class="flex gap-1">
        <button
          btn
          data-testid="nav-previous"
          :title="`Show previous ${shownNumber} entries`"
          :disabled="startIndex === 0"
          @click="showNext(-shownNumber)"
        >
          <div>previous {{ shownNumber }} {{ shownNumber === 1 ? 'entry' : 'entries' }}</div>
        </button>
        <button
          btn
          data-testid="nav-next"
          :title="`Show next ${shownNumber} entries`"
          :disabled="startIndex + shownNumber >= dataObjects.length"
          @click="showNext(shownNumber)"
        >
          <div>next {{ shownNumber }} {{ shownNumber === 1 ? 'entry' : 'entries' }}</div>
        </button>
      </div>
    </div>
    <div
      v-else
      class="text-xl m-auto"
    >
      No Entries Matched
    </div>
  </div>
</template>
