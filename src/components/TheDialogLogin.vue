<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStore as useMessageStore } from '~/stores/message'
import { useStore as useUserStore } from '~/stores/user'

const dialog = ref(false)
const userStore = useUserStore()
const { isSignedIn, name: signedInName } = storeToRefs(userStore)
const { signOut, trySignIn } = userStore
const { addErrorMessage, addSuccessMessage } = useMessageStore()
const name = ref('')

const onSubmit = (): void => {
  trySignIn(name.value)
  if (isSignedIn.value) {
    addSuccessMessage('Name saved')
    dialog.value = false
    name.value = ''
  }
  else {
    addErrorMessage('Name required')
  }
}
</script>

<template>
  <VDialog :dialog="dialog">
    <template #activator>
      <button
        v-if="!isSignedIn"
        type="button"
        icon-btn
        class="mx-2 px-2 border-x border-gray-200"
        @click="dialog = !dialog"
      >
        Set name
      </button>
      <div
        v-else
        class="mx-2 my-auto px-2 border-x border-gray-200"
      >
        Hi, {{ signedInName }}
        <button
          type="button"
          icon-btn
          class="pl-2"
          @click="signOut"
        >
          Clear name
        </button>
      </div>
    </template>
    <template #default>
      <div
        class="p-4 rounded max-w-md shadow"
        bg="white dark:gray-700"
      >
        <div class="flex">
          <div class="text-xl font-bold">
            Set name
          </div>
          <button
            type="button"
            icon-btn
            class="ml-auto"
            title="Close"
            @click="dialog = false"
          >
            <div class="i-fa6-solid:xmark" />
          </button>
        </div>
        <form
          class="p-4 space-y-4"
          @submit.prevent="onSubmit"
        >
          <p class="text-sm text-gray-600 dark:text-gray-300">
            A local display name. New annotations store this name with your user id.
          </p>
          <div>
            <label
              for="user"
              class="mb-2 block"
            >
              Name
            </label>
            <input
              id="user"
              v-model="name"
              name="name"
              placeholder="Name"
              required
              autocomplete="nickname"
              class="text-sm p-2.5 rounded w-full dark:placeholder-gray-400"
              bg="gray-50 dark:gray-600"
              border="~ gray-300 dark:gray-500"
            >
          </div>
          <button
            type="submit"
            btn
          >
            Save
          </button>
        </form>
      </div>
    </template>
  </VDialog>
</template>
