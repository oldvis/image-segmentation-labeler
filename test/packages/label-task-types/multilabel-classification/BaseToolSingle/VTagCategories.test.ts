import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VTagCategories from '~/packages/label-task-types/multilabel-classification/BaseToolSingle/VTagCategories.vue'

describe('vTagCategories', () => {
  it('exposes aria-pressed for selected categories', () => {
    const wrapper = mount(VTagCategories, {
      props: {
        value: ['Vis'],
        categories: ['Vis', 'Not Vis'],
        categoryToColor: (c: string) => (c === 'Vis' ? '#00f' : '#f80'),
      },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    expect(buttons[1].attributes('aria-pressed')).toBe('false')
  })
})
