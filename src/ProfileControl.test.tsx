// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ProfileControl } from './ProfileControl'
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
it('sends a configured guest to the account page from the header and the profile disclosure', () => {
  const onSignIn = vi.fn()
  render(
    <ProfileControl
      user={null}
      configured
      status="Guest"
      onSignIn={onSignIn}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
  expect(onSignIn).toHaveBeenCalledTimes(1)
  const profile = screen.getByRole('button', { name: 'Profile' })
  fireEvent.click(profile)
  fireEvent.click(
    screen.getByRole('button', { name: 'Sign in or create account' }),
  )
  expect(onSignIn).toHaveBeenCalledTimes(2)
  fireEvent.keyDown(document, { key: 'Escape' })
})
it('preserves guest study with clear feedback when sign-in is unavailable', () => {
  render(<ProfileControl user={null} configured={false} status="Guest" />)
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
  expect(screen.getByRole('alert').textContent).toContain(
    'saved in this browser',
  )
})
it('offers sign-in again for an expired account without treating its notes as guest data', () => {
  render(
    <ProfileControl
      user={{ username: 'Kari' }}
      configured
      expired
      status="Session expired"
    />,
  )
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Profile' }))
  expect(screen.getByText('Kari')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull()
})
