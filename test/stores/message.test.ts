import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { MessageType, useStore as useMessageStore } from '~/stores/message'

describe('message store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('addSuccessMessage / addErrorMessage use defaults', () => {
    const store = useMessageStore()
    store.addSuccessMessage('ok')
    store.addErrorMessage('bad')
    expect(store.messages).toHaveLength(2)
    expect(store.messages[0]).toMatchObject({ content: 'ok', type: MessageType.Success, timeout: 3000 })
    expect(store.messages[1]).toMatchObject({ content: 'bad', type: MessageType.Error, timeout: 3000 })
  })

  it('removeMessage deletes by uuid', () => {
    const store = useMessageStore()
    store.addSuccessMessage('ok')
    const uuid = store.messages[0].uuid
    store.removeMessage(uuid)
    expect(store.messages).toHaveLength(0)
  })

  it('removeMessage is a no-op for unknown uuid', () => {
    const store = useMessageStore()
    store.addErrorMessage('keep me')
    expect(store.messages).toHaveLength(1)
    store.removeMessage('missing')
    expect(store.messages).toHaveLength(1)
    expect(store.messages[0].content).toBe('keep me')
  })

  it('removeByContent removes matching messages', () => {
    const store = useMessageStore()
    store.addErrorMessage('Please sign in if you want to save your name in the annotations.', Number.POSITIVE_INFINITY)
    store.addSuccessMessage('other')
    store.removeByContent('Please sign in if you want to save your name in the annotations.')
    expect(store.messages.map((d) => d.content)).toEqual(['other'])
  })
})
