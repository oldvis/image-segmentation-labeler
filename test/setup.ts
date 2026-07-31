import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, vi } from 'vitest'

vi.mock('~/data/annotations.json', () => ({ default: [] }))
vi.mock('~/data/data-objects.json', () => ({
  default: [
    {
      uuid: 'img-1',
      downloadUrl: 'https://example.com/img-1.jpg',
      width: 200,
      height: 100,
    },
    {
      uuid: 'img-2',
      downloadUrl: 'https://example.com/img-2.jpg',
      width: 300,
      height: 150,
    },
  ],
}))

beforeEach(() => {
  setActivePinia(createPinia())
})
