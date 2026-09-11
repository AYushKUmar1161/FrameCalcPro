import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient'
import {
  registerLocalAccount,
  verifyLocalCredentials,
  seedDemoAccount,
  findAccountByEmail,
  type StoredAccount,
} from '../services/authSecurity'

export interface SignUpDetails {
  email: string
  password: string
  fullName: string
  companyName?: string
}

export interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  authModalOpen: boolean
  authModalMode: 'signin' | 'signup'
  setAuthModalOpen: (open: boolean) => void
  openAuthModal: (mode?: 'signin' | 'signup') => void
  signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>
  signUpWithDetails: (details: SignUpDetails) => Promise<{ error: Error | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signInAsGuest: (guestEmail?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function convertStoredAccountToUser(account: StoredAccount): User {
  return {
    id: account.id,
    app_metadata: { provider: 'email', role: account.role },
    user_metadata: {
      full_name: account.fullName,
      company_name: account.companyName,
      email: account.email,
    },
    aud: 'authenticated',
    confirmation_sent_at: '',
    recovery_sent_at: '',
    email_change_sent_at: '',
    new_email: '',
    invited_at: '',
    action_link: '',
    email: account.email,
    phone: '',
    created_at: account.createdAt,
    confirmed_at: account.createdAt,
    email_confirmed_at: account.createdAt,
    phone_confirmed_at: '',
    last_sign_in_at: account.lastLoginAt,
    role: 'authenticated',
    updated_at: new Date().toISOString(),
    identities: [],
    factors: [],
  } as User
}

function createLocalSession(user: User): Session {
  return {
    access_token: 'fcp-jwt-' + Math.random().toString(36).substring(2, 15),
    token_type: 'bearer',
    expires_in: 86400,
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    refresh_token: 'fcp-refresh-' + Math.random().toString(36).substring(2, 15),
    user,
  } as Session
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')
  const isConfigured = isSupabaseConfigured()

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  useEffect(() => {
    // Seed default demo estimator account in local security store
    seedDemoAccount().catch((err) => console.warn('Demo account seed error:', err))

    if (!isConfigured) {
      // Check for locally saved user session
      try {
        let savedUserStr: string | null = null
        if (typeof localStorage !== 'undefined') {
          savedUserStr = localStorage.getItem('framecalcpro_local_user')
        }
        if (!savedUserStr && typeof sessionStorage !== 'undefined') {
          savedUserStr = sessionStorage.getItem('framecalcpro_local_user')
        }

        if (savedUserStr) {
          const parsed = JSON.parse(savedUserStr) as User
          if (parsed && parsed.email) {
            setUser(parsed)
            setSession(createLocalSession(parsed))
          }
        }
      } catch (err) {
        console.warn('Failed to parse local user session:', err)
      }
      setLoading(false)
      return
    }

    // Get current session from live Supabase
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [isConfigured])

  const signInWithEmail = async (email: string, password: string, rememberMe = true) => {
    if (!isConfigured) {
      // Authenticate against salted SHA-256 local database
      const verifyRes = await verifyLocalCredentials(email, password)
      if (!verifyRes.success || !verifyRes.account) {
        return { error: new Error(verifyRes.error || 'Authentication failed. Please check credentials.') }
      }

      const localUser = convertStoredAccountToUser(verifyRes.account)
      try {
        const serialized = JSON.stringify(localUser)
        if (rememberMe && typeof localStorage !== 'undefined') {
          localStorage.setItem('framecalcpro_local_user', serialized)
        } else if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('framecalcpro_local_user', serialized)
        }
      } catch (e) {
        console.warn('Could not save user session to storage', e)
      }

      setUser(localUser)
      setSession(createLocalSession(localUser))
      return { error: null }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? new Error(error.message) : null }
  }

  const signUpWithDetails = async (details: SignUpDetails) => {
    if (!isConfigured) {
      // Register with salted SHA-256 hash in local security store
      const regRes = await registerLocalAccount({
        email: details.email,
        password: details.password,
        fullName: details.fullName,
        companyName: details.companyName,
      })

      if (!regRes.success || !regRes.account) {
        return { error: new Error(regRes.error || 'Account registration failed.') }
      }

      const localUser = convertStoredAccountToUser(regRes.account)
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('framecalcpro_local_user', JSON.stringify(localUser))
        }
      } catch (e) {
        console.warn('Could not save user session to storage', e)
      }

      setUser(localUser)
      setSession(createLocalSession(localUser))
      return { error: null }
    }

    const { error } = await supabase.auth.signUp({
      email: details.email,
      password: details.password,
      options: {
        data: {
          full_name: details.fullName,
          company_name: details.companyName,
        },
      },
    })
    return { error: error ? new Error(error.message) : null }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    return signUpWithDetails({
      email,
      password,
      fullName: email.split('@')[0],
    })
  }

  const signInAsGuest = async (guestEmail = 'estimator@framecalcpro.com') => {
    // Check if demo/guest account exists in local store; if not, create it
    const existing = findAccountByEmail(guestEmail)
    if (!existing) {
      await registerLocalAccount({
        email: guestEmail,
        password: 'GuestPassword2026!',
        fullName: 'Guest Estimator',
        companyName: 'FrameCalcPro Field Office',
      })
    }
    return signInWithEmail(guestEmail, 'GuestPassword2026!')
  }

  const signOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut()
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('framecalcpro_local_user')
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('framecalcpro_local_user')
      }
    } catch (e) {
      console.warn('Could not remove user from storage', e)
    }
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured,
        authModalOpen,
        authModalMode,
        setAuthModalOpen,
        openAuthModal,
        signInWithEmail,
        signUpWithDetails,
        signUpWithEmail,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
