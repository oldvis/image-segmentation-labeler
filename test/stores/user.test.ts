import { createPinia, setActivePinia } from 'pinia'
import { v5 as uuidv5 } from 'uuid'
import { beforeEach, describe, expect, it } from 'vitest'
import { useStore as useUserStore } from '~/stores/user'
import { UserType } from '~/stores/user/types'

const UUID_NAMESPACE = '00000000-0000-0000-0000-000000000000'

describe('user store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts signed out', () => {
    const store = useUserStore()
    expect(store.isSignedIn).toBe(false)
    expect(store.user).toBeNull()
  })

  it('trySignIn sets name and deterministic uuid v5', () => {
    const store = useUserStore()
    expect(store.trySignIn('alice')).toBe(true)
    expect(store.isSignedIn).toBe(true)
    expect(store.user).toEqual({
      type: UserType.Reviewer,
      name: 'alice',
      uuid: uuidv5('alice', UUID_NAMESPACE),
    })
    store.signOut()
    store.trySignIn('alice')
    expect(store.uuid).toBe(uuidv5('alice', UUID_NAMESPACE))
  })

  it('trySignIn trims whitespace and rejects empty names', () => {
    const store = useUserStore()
    expect(store.trySignIn('')).toBe(false)
    expect(store.trySignIn('   ')).toBe(false)
    expect(store.isSignedIn).toBe(false)
    expect(store.trySignIn('  alice  ')).toBe(true)
    expect(store.name).toBe('alice')
    expect(store.uuid).toBe(uuidv5('alice', UUID_NAMESPACE))
  })

  it('signOut resets state', () => {
    const store = useUserStore()
    store.trySignIn('alice')
    store.signOut()
    expect(store.isSignedIn).toBe(false)
    expect(store.name).toBeNull()
    expect(store.uuid).toBeNull()
  })
})
