// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

describe('AuthContext - Secured Local-First Authentication Engine', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('allows registering a new user account with full details and signing in', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    expect(result.current.user).toBeNull()

    let res: { error: Error | null } | undefined
    await act(async () => {
      res = await result.current.signUpWithDetails({
        fullName: 'Ayush Kumar',
        companyName: 'AK Framing & Takeoffs',
        email: 'ayushkumar1161.ak@gmail.com',
        password: 'SecurePassword2026!',
      })
    })

    expect(res?.error).toBeNull()
    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.email).toBe('ayushkumar1161.ak@gmail.com')
    expect(result.current.user?.user_metadata?.full_name).toBe('Ayush Kumar')
    expect(result.current.user?.user_metadata?.company_name).toBe('AK Framing & Takeoffs')
    expect(localStorage.getItem('framecalcpro_local_user')).toContain('ayushkumar1161.ak@gmail.com')
  })

  it('verifies passwords correctly on sign in and rejects invalid passwords', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    // Register first
    await act(async () => {
      await result.current.signUpWithDetails({
        fullName: 'Test Estimator',
        email: 'test@construction.com',
        password: 'ValidPass123!',
      })
      await result.current.signOut()
    })

    expect(result.current.user).toBeNull()

    // Try signing in with WRONG password
    let wrongRes: { error: Error | null } | undefined
    await act(async () => {
      wrongRes = await result.current.signInWithEmail('test@construction.com', 'WrongPassword999')
    })
    expect(wrongRes?.error).not.toBeNull()
    expect(wrongRes?.error?.message).toContain('Incorrect password')
    expect(result.current.user).toBeNull()

    // Try signing in with CORRECT password
    let correctRes: { error: Error | null } | undefined
    await act(async () => {
      correctRes = await result.current.signInWithEmail('test@construction.com', 'ValidPass123!')
    })
    expect(correctRes?.error).toBeNull()
    expect(result.current.user?.email).toBe('test@construction.com')
  })

  it('allows 1-click guest sign in', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    let res: { error: Error | null } | undefined
    await act(async () => {
      res = await result.current.signInAsGuest()
    })

    expect(res?.error).toBeNull()
    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.email).toBe('estimator@framecalcpro.com')
  })

  it('allows signing out and clearing session completely', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    await act(async () => {
      await result.current.signUpWithDetails({
        fullName: 'Dave Builder',
        email: 'dave@builder.com',
        password: 'SecretPassword88!',
      })
    })

    expect(result.current.user?.email).toBe('dave@builder.com')

    await act(async () => {
      await result.current.signOut()
    })

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('framecalcpro_local_user')).toBeNull()
  })
})
