// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { ProfileControl } from './ProfileControl'
afterEach(cleanup)
it('offers a visible email sign-in action and an accessible profile disclosure', () => {
  render(<ProfileControl user={null} configured status="Guest" />)
  expect(
    screen.getByRole('link', { name: 'Sign in' }).getAttribute('href'),
  ).toBe('/api/login')
  const profile = screen.getByRole('button', { name: 'Profile' })
  fireEvent.click(profile)
  expect(
    screen
      .getByRole('link', { name: 'Sign in with email' })
      .getAttribute('href'),
  ).toBe('/api/login')
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(document.activeElement).toBe(profile)
  expect(screen.queryByRole('region', { name: 'Profile details' })).toBeNull()
})
it('preserves guest study with clear feedback when login is unavailable', () => {
  render(<ProfileControl user={null} configured={false} status="Guest" />)
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
  expect(screen.getByRole('alert').textContent).toContain(
    'saved in this browser',
  )
})
it('offers sign-in again for an expired account without treating its notes as guest data', () => {
  render(
    <ProfileControl
      user={{ email: 'student@example.test' }}
      configured
      expired
      status="Session expired"
    />,
  )
  expect(screen.getByRole('link', { name: 'Sign in' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Profile' }))
  expect(screen.getByText('student@example.test')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull()
})
