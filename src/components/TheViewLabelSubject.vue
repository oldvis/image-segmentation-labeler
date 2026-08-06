<script setup lang="ts">
import { isFocusedElementEditable, onKeyStroke, useElementVisibility } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useStore } from '~/stores/annotation'
import { StatusType } from '~/stores/annotation/types'
import { useStore as useMessageStore } from '~/stores/message'

const annotationStore = useStore()
const { dataObjects, selectedDataObjects, statuses } = storeToRefs(annotationStore)
const { addSuccessMessage } = useMessageStore()

const root = ref<HTMLDivElement | null>(null)
const content = ref<HTMLDivElement>()
const isVisible = useElementVisibility(root)

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

const maxStartIndex = computed(() => (
  Math.max(0, dataObjects.value.length - shownNumber.value)
))

const positionLabel = computed(() => {
  const total = dataObjects.value.length
  if (total === 0) return '0 / 0'
  const from = startIndex.value + 1
  const to = Math.min(startIndex.value + shownNumber.value, total)
  if (from === to) return `${from} / ${total}`
  return `${from}-${to} / ${total}`
})

/** Advance by n; mark leaving unlabeled entries Viewed (not Labeled). */
const showNext = (n: number): void => {
  const shownUuids = new Set(shown.value.map((d) => d.uuid))
  statuses.value = statuses.value.map((d) => {
    if (!shownUuids.has(d.uuid)) return d
    if (d.value === StatusType.Skipped) return d
    if (annotationStore.isLabeled(d.uuid)) {
      return { ...d, value: StatusType.Labeled }
    }
    return { ...d, value: StatusType.Viewed }
  })

  startIndex.value = Math.min(
    Math.max(0, startIndex.value + n),
    maxStartIndex.value,
  )
  if (content.value !== undefined) {
    content.value.scrollTop = 0
  }
}

/** Unlabeled = no detection/tag labels and not Skipped. */
const isUnlabeledEntry = (uuid: string): boolean => {
  if (annotationStore.isLabeled(uuid)) return false
  const status = statuses.value.find((d) => d.uuid === uuid)?.value
  return status !== StatusType.Skipped
}

const gotoUnlabeled = (): void => {
  const index = dataObjects.value.findIndex((d) => isUnlabeledEntry(d.uuid))
  if (index === -1) {
    addSuccessMessage('No unlabeled entries left')
    return
  }
  startIndex.value = index
  if (content.value !== undefined) {
    content.value.scrollTop = 0
  }
}

const shouldHandleHotkey = (event: KeyboardEvent): boolean => (
  isVisible.value
  && !event.metaKey
  && !event.ctrlKey
  && !event.altKey
  && !isFocusedElementEditable()
)

onKeyStroke('a', (event) => {
  if (!shouldHandleHotkey(event)) return
  event.preventDefault()
  showNext(-shownNumber.value)
})
onKeyStroke('d', (event) => {
  if (!shouldHandleHotkey(event)) return
  event.preventDefault()
  showNext(shownNumber.value)
})

onMounted(() => {
  selectedDataObjects.value = shown.value
})
watch(shown, () => {
  selectedDataObjects.value = shown.value
})
</script>

<template>
  <div
    ref="root"
    class="h-full min-h-0"
    flex="~ col"
  >
    <div view-header>
      <div class="i-fa6-solid:images text-gray-500 shrink-0" />
      <div strip-label>
        Entries
      </div>
    </div>
    <div
      v-if="shown.length !== 0"
      ref="content"
      class="scroll-smooth flex grow flex-col min-h-0 overflow-auto"
    >
      <VDataEntry
        v-for="(d, i) in shown"
        :key="d.uuid"
        :datum="d"
        :index="startIndex + i + 1"
        class="grow min-h-0"
      />
      <div
        class="status-strip border-t border-gray-200 shrink-0 dark:border-gray-700"
      >
        <div class="flex flex-wrap gap-1 items-center">
          <button
            type="button"
            btn-secondary
            data-testid="nav-previous"
            :title="`Show previous ${shownNumber} entries (A)`"
            :disabled="startIndex === 0"
            @click="showNext(-shownNumber)"
          >
            Previous
            <span
              kbd
              aria-hidden="true"
            >A</span>
          </button>
          <button
            type="button"
            btn-secondary
            data-testid="nav-next"
            :title="`Show next ${shownNumber} entries (D)`"
            :disabled="startIndex + shownNumber >= dataObjects.length"
            @click="showNext(shownNumber)"
          >
            Next
            <span
              kbd
              aria-hidden="true"
            >D</span>
          </button>
          <button
            type="button"
            btn-secondary
            data-testid="nav-first-unlabeled"
            title="Go to first unlabeled"
            @click="gotoUnlabeled"
          >
            Go to first unlabeled
          </button>
        </div>
        <span class="strip-meta ml-auto">
          {{ positionLabel }}
        </span>
      </div>
    </div>
    <div
      v-else
      class="text-sm text-gray-500 m-auto p-3 dark:text-gray-400"
    >
      No entries matched
    </div>
  </div>
</template>
