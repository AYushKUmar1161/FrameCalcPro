// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

describe('AuthContext Local-First Fallback', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('allows user to sign in with email and password in local mode without error', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    expect(result.current.user).toBeNull()

    let res: { error: Error | null } | undefined
    await act(async () => {
      res = await result.current.signInWithEmail('ayushkumar1161.ak@gmail.com', 'mypassword')
    })

    expect(res?.error).toBeNull()
    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.email).toBe('ayushkumar1161.ak@gmail.com')
    expect(localStorage.getItem('framecalcpro_local_user')).toContain('ayushkumar1161.ak@gmail.com')
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

  it('allows signing out and clearing session', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    await act(async () => {
      await result.current.signInWithEmail('test@builder.com', 'secret123')
    })

    expect(result.current.user?.email).toBe('test@builder.com')

    await act(async () => {
      await result.current.signOut()
    })

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('framecalcpro_local_user')).toBeNull()
  })
})
