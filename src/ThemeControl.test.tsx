// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { ThemeControl } from './ThemeControl'

let dark = false
let mediaChange: (() => void) | undefined
beforeEach(() => {
  localStorage.clear()
  dark = false
  mediaChange = undefined
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return dark
    },
    addEventListener: (_: string, callback: () => void) => {
      mediaChange = callback
    },
    removeEventListener: vi.fn(),
  }))
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('follows system changes, persists explicit choices, and restores them after reload', () => {
  const view = render(<ThemeControl />)
  expect(
    screen
      .getByRole('button', { name: 'System theme' })
      .getAttribute('aria-pressed'),
  ).toBe('true')
  act(() => {
    dark = true
    mediaChange?.()
  })
  expect(document.documentElement.dataset.theme).toBe('dark')
  fireEvent.click(screen.getByRole('button', { name: 'Light theme' }))
  expect(document.documentElement.dataset.theme).toBe('light')
  expect(localStorage.getItem('masterprep.theme.v1')).toBe('light')
  act(() => {
    mediaChange?.()
  })
  expect(document.documentElement.dataset.theme).toBe('light')
  view.unmount()
  render(<ThemeControl />)
  expect(
    screen
      .getByRole('button', { name: 'Light theme' })
      .getAttribute('aria-pressed'),
  ).toBe('true')
  act(() =>
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'masterprep.theme.v1',
        newValue: 'dark',
      }),
    ),
  )
  expect(document.documentElement.dataset.theme).toBe('dark')
})

it('still switches themes when local storage is blocked', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Blocked')
  })
  render(<ThemeControl />)
  fireEvent.click(screen.getByRole('button', { name: 'Dark theme' }))
  expect(document.documentElement.dataset.theme).toBe('dark')
  vi.restoreAllMocks()
})

it('applies the theme before React loads, including system and blocked-storage fallbacks', () => {
  const script = readFileSync('public/theme-init.js', 'utf8')
  for (const scenario of [
    { saved: 'dark', system: false, expected: 'dark' },
    { saved: 'light', system: true, expected: 'light' },
    { saved: null, system: true, expected: 'dark' },
    { saved: 'invalid', system: false, expected: 'light' },
  ]) {
    const root = { dataset: {} as Record<string, string> }
    runInNewContext(script, {
      localStorage: { getItem: () => scenario.saved },
      window: { matchMedia: () => ({ matches: scenario.system }) },
      document: { documentElement: root, querySelector: () => null },
    })
    expect(root.dataset.theme).toBe(scenario.expected)
  }
  const root = { dataset: {} as Record<string, string> }
  runInNewContext(script, {
    localStorage: {
      getItem: () => {
        throw new Error('Blocked')
      },
    },
    window: { matchMedia: () => ({ matches: true }) },
    document: { documentElement: root, querySelector: () => null },
  })
  expect(root.dataset.theme).toBe('dark')
})
