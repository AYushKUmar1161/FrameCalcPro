import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  authModalOpen: boolean
  setAuthModalOpen: (open: boolean) => void
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signInAsGuest: (guestEmail?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function createMockUser(email: string): User {
  return {
    id: 'local-' + Math.random().toString(36).substring(2, 9),
    app_metadata: { provider: 'email' },
    user_metadata: { full_name: email.split('@')[0], email },
    aud: 'authenticated',
    confirmation_sent_at: '',
    recovery_sent_at: '',
    email_change_sent_at: '',
    new_email: '',
    invited_at: '',
    action_link: '',
    email,
    phone: '',
    created_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    phone_confirmed_at: '',
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
    updated_at: new Date().toISOString(),
    identities: [],
    factors: [],
  } as User
}

function createMockSession(user: User): Session {
  return {
    access_token: 'local-mock-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'local-mock-refresh',
    user,
  } as Session
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const isConfigured = isSupabaseConfigured()

  useEffect(() => {
    if (!isConfigured) {
      // Check for locally saved user session
      try {
        const savedUserStr = localStorage.getItem('framecalcpro_local_user')
        if (savedUserStr) {
          const parsed = JSON.parse(savedUserStr) as User
          if (parsed && parsed.email) {
            setUser(parsed)
            setSession(createMockSession(parsed))
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

  const signInWithEmail = async (email: string, password: string) => {
    if (!isConfigured) {
      // Seamless local-first auth: allows immediate sign in with any valid email
      const localUser = createMockUser(email)
      try {
        localStorage.setItem('framecalcpro_local_user', JSON.stringify(localUser))
      } catch (e) {
        console.warn('Could not save local user to localStorage', e)
      }
      setUser(localUser)
      setSession(createMockSession(localUser))
      return { error: null }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? new Error(error.message) : null }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    if (!isConfigured) {
      // Seamless local-first signup: creates and signs in immediately
      const localUser = createMockUser(email)
      try {
        localStorage.setItem('framecalcpro_local_user', JSON.stringify(localUser))
      } catch (e) {
        console.warn('Could not save local user to localStorage', e)
      }
      setUser(localUser)
      setSession(createMockSession(localUser))
      return { error: null }
    }
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error ? new Error(error.message) : null }
  }

  const signInAsGuest = async (guestEmail = 'estimator@framecalcpro.com') => {
    return signInWithEmail(guestEmail, 'guest-demo-mode')
  }

  const signOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut()
    }
    try {
      localStorage.removeItem('framecalcpro_local_user')
    } catch (e) {
      console.warn('Could not remove local user from localStorage', e)
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
        setAuthModalOpen,
        signInWithEmail,
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
