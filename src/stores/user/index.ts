import type { User } from './types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { v5 as uuidv5 } from 'uuid'
import { UserType } from './types'

const UUID_NAMESPACE = '00000000-0000-0000-0000-000000000000'

export const useStore = defineStore('user', {
  state: () => ({
    type: UserType.Reviewer,
    name: null as string | null,
    uuid: null as string | null,
  }),
  getters: {
    isSignedIn(): boolean {
      return this.name !== null
    },
    user(): User | null {
      const { type, name, uuid } = this
      if (name === null || uuid === null) return null
      return { type, name, uuid }
    },
  },
  actions: {
    trySignIn(name: string): boolean {
      this.name = name
      // Generate a uuid that is reproducible given the name.
      this.uuid = uuidv5(name, UUID_NAMESPACE)
      return true
    },
    signOut(): void {
      this.$reset()
    },
  },
  persist: true,
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}
