import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import VFormField from '~/components/VFormField.vue'

describe('vFormField', () => {
  it('associates the label with the control via for/id', () => {
    const wrapper = mount(VFormField, {
      props: { label: 'Title' },
      slots: {
        default: ({ id }: { id: string }) => h('input', {
          id,
          'data-test': 'control',
        }),
      },
    })

    const label = wrapper.get('label')
    const control = wrapper.get('[data-test="control"]')
    expect(label.text()).toBe('Title')
    expect(label.attributes('for')).toBeTruthy()
    expect(control.attributes('id')).toBe(label.attributes('for'))
  })

  it('uses a compact horizontal layout by default', () => {
    const wrapper = mount(VFormField, {
      props: { label: 'Theme' },
      slots: { default: '<input />' },
    })
    expect(wrapper.classes().join(' ')).toContain('items-center')
  })
})
