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
  // Before showing next entries, mark the currently shown entries as labeled.
  statuses.value = statuses.value.map((d) => {
    const isShown = shown.value.map((d) => d.uuid).includes(d.uuid)
    return isShown ? { ...d, value: StatusType.Labeled } : d
  })

  const result = startIndex.value + n
  startIndex.value = Math.min(Math.max(0, result), dataObjects.value.length)
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
      class="overflow-auto scroll-smooth flex-1 gap-1"
      flex="~ col"
    >
      <VDataEntry
        v-for="(d, i) in shown"
        :key="d.uuid"
        :datum="d"
        :index="startIndex + i + 1"
        class="flex-1"
      />
      <div class="gap-1 flex">
        <button
          btn
          :title="`Show previous ${shownNumber} entries`"
          :disabled="startIndex === 0"
          @click="showNext(-shownNumber)"
        >
          <div>previous {{ shownNumber }} {{ shownNumber === 1 ? 'entry' : 'entries' }}</div>
        </button>
        <button
          btn
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
      class="m-auto text-xl"
    >
      No Entries Matched
    </div>
  </div>
</template>
