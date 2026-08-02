import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VCollapseSection from '~/components/VCollapseSection.vue'

describe('vCollapseSection', () => {
  it('starts collapsed when open is false and exposes aria-expanded', async () => {
    const wrapper = mount(VCollapseSection, {
      props: { title: 'Marks', open: false },
      slots: { default: '<div data-test="body">body</div>' },
    })

    const button = wrapper.get('button')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-test="body"]').exists()).toBe(false)

    await button.trigger('click')
    expect(wrapper.emitted('update:open')?.[0]).toEqual([true])
  })

  it('shows body when open is true', () => {
    const wrapper = mount(VCollapseSection, {
      props: { title: 'Repeat', open: true },
      slots: { default: '<div data-test="body">body</div>' },
    })
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('[data-test="body"]').text()).toBe('body')
  })
})
