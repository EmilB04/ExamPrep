// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { AccountPage } from './AccountPage'
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
const guest = { user: null, expired: false, configured: true, status: 'Guest' }
it('shows a username + PIN sign-in form on a dedicated page', () => {
  render(<AccountPage {...guest} />)
  expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
    'Sign in or create an account',
  )
  expect(screen.getByLabelText('Username')).toBeTruthy()
  const pin = screen.getByLabelText('PIN') as HTMLInputElement
  expect(pin.type).toBe('password')
  expect(pin.getAttribute('inputmode')).toBe('numeric')
  expect(screen.queryByLabelText('Repeat PIN')).toBeNull()
})
it('asks to repeat the PIN when creating an account and refuses a mismatch without calling the server', () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch')
  render(<AccountPage {...guest} />)
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
  fireEvent.change(screen.getByLabelText('Username'), {
    target: { value: 'Kari' },
  })
  fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '4821' } })
  fireEvent.change(screen.getByLabelText('Repeat PIN'), {
    target: { value: '4822' },
  })
  fireEvent.submit(screen.getByLabelText('Username').closest('form')!)
  expect(screen.getByRole('alert').textContent).toContain('do not match')
  expect(fetchMock).not.toHaveBeenCalled()
})
it('shows the recovery code once after registering', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    Response.json({
      user: { id: 'Kari', username: 'Kari' },
      csrfToken: 'c'.repeat(64),
      recoveryCode: 'K7QM-2XRP-9FHD',
    }),
  )
  render(<AccountPage {...guest} />)
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
  fireEvent.change(screen.getByLabelText('Username'), {
    target: { value: 'Kari' },
  })
  fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '4821' } })
  fireEvent.change(screen.getByLabelText('Repeat PIN'), {
    target: { value: '4821' },
  })
  fireEvent.submit(screen.getByLabelText('Username').closest('form')!)
  expect((await screen.findByLabelText('Recovery code')).textContent).toBe(
    'K7QM-2XRP-9FHD',
  )
})
it('explains when sign-in is unavailable and keeps guest study', () => {
  render(<AccountPage {...guest} configured={false} />)
  expect(screen.getByRole('alert').textContent).toContain(
    'saved in this browser',
  )
  expect(screen.queryByLabelText('Username')).toBeNull()
})
it('offers a recovery-code reset for a forgotten PIN', () => {
  render(<AccountPage {...guest} />)
  fireEvent.click(screen.getByRole('button', { name: 'Forgot PIN?' }))
  expect(screen.getByLabelText('Recovery code')).toBeTruthy()
  expect(screen.getByLabelText('New PIN')).toBeTruthy()
})
