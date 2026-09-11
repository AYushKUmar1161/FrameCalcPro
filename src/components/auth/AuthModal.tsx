import { useState } from 'react'
import { Cloud, Lock, Mail, Sparkles, User, UserCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { BrandLogo } from '../ui/BrandLogo'

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, isConfigured, user, signInWithEmail, signUpWithEmail, signInAsGuest, signOut } = useAuth()
  const { showToast } = useToast()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleClose = () => {
    setAuthModalOpen(false)
    setErrorMsg('')
  }

  const handleGuestSignIn = async () => {
    setLoading(true)
    setErrorMsg('')
    const { error } = await signInAsGuest('estimator@framecalcpro.com')
    setLoading(false)
    if (error) {
      setErrorMsg(error.message)
    } else {
      showToast('Signed in as Guest Estimator! Local workspace active.', 'success')
      handleClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    if (mode === 'signin') {
      const { error } = await signInWithEmail(email.trim(), password)
      setLoading(false)
      if (error) {
        setErrorMsg(error.message)
      } else {
        showToast('Signed in successfully!', 'success')
        handleClose()
      }
    } else {
      const { error } = await signUpWithEmail(email.trim(), password)
      setLoading(false)
      if (error) {
        setErrorMsg(error.message)
      } else {
        showToast('Account created and signed in successfully!', 'success')
        handleClose()
      }
    }
  }

  const handleSignOut = async () => {
    await signOut()
    showToast('Signed out.', 'info')
    handleClose()
  }

  // If already logged in, show user profile details
  if (user) {
    return (
      <Modal open={authModalOpen} onClose={handleClose} title="Account & Workspace">
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-stone-50/50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-500">Signed in as</p>
              <p className="text-sm font-bold text-zinc-900 truncate">{user.email}</p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-800 flex items-start gap-2">
            <Cloud className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {isConfigured
                ? 'Cloud Sync Active: All projects and estimates are synced securely to your Supabase PostgreSQL database.'
                : 'Local Workspace Active: All project takeoffs, 3D models, and cost estimates are saved directly to your browser storage.'}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="danger" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={authModalOpen}
      onClose={handleClose}
      title={mode === 'signin' ? 'Sign In to FrameCalcPro' : 'Create FrameCalcPro Account'}
    >
      <div className="space-y-4 py-1">
        <div className="flex justify-center pb-1">
          <BrandLogo size="md" theme="light" />
        </div>

        {!isConfigured && (
          <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/70 p-3 text-xs text-emerald-950 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Instant Local Workspace: </span>
              <span>
                Enter your email or use 1-Click Guest to access all estimation features immediately. All project data is saved locally in your browser.
              </span>
            </div>
          </div>
        )}

        {/* 1-Click Guest Sign-In Shortcut */}
        <button
          type="button"
          onClick={handleGuestSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-stone-50 hover:bg-zinc-100/80 px-4 py-2.5 text-xs font-semibold text-zinc-800 transition-all cursor-pointer shadow-2xs group"
        >
          <User className="h-4 w-4 text-brand-500 transition-transform group-hover:scale-110" />
          <span>Quick 1-Click Guest Access (No Password Needed)</span>
        </button>

        <div className="relative flex items-center justify-center my-0.5">
          <div className="border-t border-zinc-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-medium text-zinc-400 shrink-0">
            or continue with email
          </span>
          <div className="border-t border-zinc-200 w-full" />
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg border border-zinc-200 bg-zinc-100/70 p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setErrorMsg('')
            }}
            className={`flex-1 rounded-md py-1.5 font-semibold transition-all cursor-pointer ${
              mode === 'signin' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setErrorMsg('')
            }}
            className={`flex-1 rounded-md py-1.5 font-semibold transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <Input
            label="Email Address"
            type="email"
            autoComplete="email"
            placeholder="estimator@construction.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4 text-zinc-400" />}
            required
          />

          <Input
            label="Password"
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4 text-zinc-400" />}
            required
          />

          {errorMsg && (
            <p className="rounded-lg bg-rose-50 p-2.5 text-xs font-semibold text-rose-700 border border-rose-200">
              {errorMsg}
            </p>
          )}

          <div className="pt-2 flex items-center justify-between gap-3">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={loading}>
              {loading ? (
                'Processing...'
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </form>

        <p className="text-center text-[11px] text-zinc-400 pt-1">
          {isConfigured
            ? 'Encrypted with Supabase PostgreSQL & Row Level Security.'
            : 'Private & Secure Local Storage Workspace.'}
        </p>
      </div>
    </Modal>
  )
}
