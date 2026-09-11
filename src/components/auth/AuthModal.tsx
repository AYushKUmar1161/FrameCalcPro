import { useState, useEffect } from 'react'
import {
  Building2,
  Check,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useProjectContext } from '../../context/ProjectContext'
import { useToast } from '../../context/ToastContext'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { BrandLogo } from '../ui/BrandLogo'
import { evaluatePasswordStrength, validateEmail } from '../../services/authSecurity'

export function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    setAuthModalOpen,
    isConfigured,
    user,
    signInWithEmail,
    signUpWithDetails,
    signInAsGuest,
    signOut,
  } = useAuth()
  const { projects } = useProjectContext()
  const { showToast } = useToast()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  // Sync mode with context trigger
  useEffect(() => {
    if (authModalOpen) {
      setMode(authModalMode)
      setErrorMsg('')
      setConfirmSignOut(false)
    }
  }, [authModalOpen, authModalMode])

  const handleClose = () => {
    setAuthModalOpen(false)
    setErrorMsg('')
    setConfirmSignOut(false)
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

  const handleFillDemo = () => {
    setEmail('demo@framecalcpro.com')
    setPassword('FrameCalc2026!')
    setErrorMsg('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const cleanEmail = email.trim()

    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.')
      return
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid email address (e.g. estimator@builder.com).')
      return
    }

    if (!password) {
      setErrorMsg('Please enter your password.')
      return
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.')
        return
      }

      if (password.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.')
        return
      }

      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.')
        return
      }

      if (!agreeTerms) {
        setErrorMsg('Please agree to the Estimator Terms of Service to create an account.')
        return
      }

      setLoading(true)
      const { error } = await signUpWithDetails({
        email: cleanEmail,
        password,
        fullName: fullName.trim(),
        companyName: companyName.trim() || undefined,
      })
      setLoading(false)

      if (error) {
        setErrorMsg(error.message)
      } else {
        showToast(`Account created! Welcome to FrameCalcPro, ${fullName.trim()}.`, 'success')
        handleClose()
      }
    } else {
      setLoading(true)
      const { error } = await signInWithEmail(cleanEmail, password, rememberMe)
      setLoading(false)

      if (error) {
        setErrorMsg(error.message)
      } else {
        showToast('Signed in successfully! Welcome back.', 'success')
        handleClose()
      }
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setConfirmSignOut(false)
    showToast('Logged out successfully.', 'info')
    handleClose()
  }

  const strength = evaluatePasswordStrength(password)
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

  // If already logged in, show comprehensive user profile & logout management
  if (user) {
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Estimator'
    const company = user.user_metadata?.company_name || 'Independent Construction Estimator'
    const initials = displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()

    return (
      <Modal open={authModalOpen} onClose={handleClose} title="Account & Workspace">
        <div className="space-y-4 py-1">
          {/* User Profile Card */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-stone-50 via-white to-orange-50/20 p-4 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white font-bold text-base shadow-sm shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 truncate">{displayName}</h3>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-600 truncate">{company}</p>
              <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Account Metrics & Security Info */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-zinc-200 bg-stone-50/50 p-3">
              <p className="text-[11px] font-medium text-zinc-500">Saved Projects</p>
              <p className="text-base font-bold text-zinc-900 mt-0.5">{projects.length} Projects</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-stone-50/50 p-3">
              <p className="text-[11px] font-medium text-zinc-500">Security Standard</p>
              <p className="text-xs font-bold text-zinc-900 mt-1 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>SHA-256 Vault</span>
              </p>
            </div>
          </div>

          {/* Connection Status Badge */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-900 flex items-start gap-2.5">
            <UserCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">
                {isConfigured ? 'Supabase Cloud Synced' : 'Private Local Workspace Active'}
              </p>
              <p className="text-[11px] text-emerald-800/80 mt-0.5">
                {isConfigured
                  ? 'Your framing estimates and BOM line overrides are synced to your remote PostgreSQL database.'
                  : 'Your account credentials and estimates are stored in your encrypted local browser storage.'}
              </p>
            </div>
          </div>

          {/* Logout Confirmation Prompt or Action Buttons */}
          {confirmSignOut ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 space-y-3">
              <p className="text-xs font-semibold text-rose-900">
                Are you sure you want to log out of FrameCalcPro?
              </p>
              <div className="flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setConfirmSignOut(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={handleSignOut}>
                  Confirm Log Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={handleClose}>
                  Close
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    handleSignOut()
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-2 cursor-pointer ml-1"
                >
                  Switch Account
                </button>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmSignOut(true)}
                className="flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </Button>
            </div>
          )}
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

        {/* Informative Workspace Header */}
        <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/70 p-3 text-xs text-emerald-950 flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">
              {isConfigured ? 'Live Cloud Connected: ' : 'Secured Local Workspace: '}
            </span>
            <span>
              {isConfigured
                ? 'Sign in to access your cloud-synced projects.'
                : 'Protected with salted SHA-256 password cryptography. Create a free account or sign in below.'}
            </span>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex rounded-lg border border-zinc-200 bg-zinc-100/80 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setErrorMsg('')
            }}
            className={`flex-1 rounded-md py-1.5 transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
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
            className={`flex-1 rounded-md py-1.5 transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1-Click Guest & Demo Shortcuts for Sign In */}
        {mode === 'signin' && (
          <div className="space-y-2 pt-0.5">
            <button
              type="button"
              onClick={handleGuestSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-stone-50 hover:bg-zinc-100/90 px-4 py-2.5 text-xs font-semibold text-zinc-800 transition-all cursor-pointer shadow-2xs group"
            >
              <UserIcon className="h-4 w-4 text-brand-500 transition-transform group-hover:scale-110" />
              <span>Quick 1-Click Guest Access (No Password Required)</span>
            </button>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
              <span>Testing credentials?</span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="font-semibold text-brand-600 hover:text-brand-700 underline cursor-pointer"
              >
                Auto-fill Demo Estimator Login
              </button>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-zinc-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-zinc-400 shrink-0">
                or sign in with email
              </span>
              <div className="border-t border-zinc-200 w-full" />
            </div>
          </div>
        )}

        {/* Main Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-0.5">
          {mode === 'signup' && (
            <>
              <Input
                label="Full Name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Ayush Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<UserIcon className="h-4 w-4 text-zinc-400" />}
                required
              />

              <Input
                label="Company / Firm (Optional)"
                type="text"
                autoComplete="organization"
                placeholder="e.g. Apex Framing Contractors"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                leftIcon={<Building2 className="h-4 w-4 text-zinc-400" />}
              />
            </>
          )}

          <Input
            label={mode === 'signup' ? 'Work Email Address' : 'Email Address'}
            type="email"
            autoComplete="email"
            placeholder="estimator@construction.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4 text-zinc-400" />}
            required
          />

          {/* Password Field with Show/Hide Toggle */}
          <Input
            label={mode === 'signup' ? 'Create Password (min. 8 chars)' : 'Password'}
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4 text-zinc-400" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            required
          />

          {/* Dynamic Password Strength Indicator (Signup Mode) */}
          {mode === 'signup' && password.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-stone-50/60 p-2.5 space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-zinc-600">Password Security:</span>
                <span className="font-bold text-zinc-800">{strength.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`rounded-full transition-all duration-300 ${
                      step <= strength.score ? strength.color : 'bg-zinc-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-zinc-500">{strength.feedback}</p>
            </div>
          )}

          {/* Confirm Password Field (Signup Mode) */}
          {mode === 'signup' && (
            <div className="space-y-1">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4 text-zinc-400" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer transition-colors"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
              />
              {passwordsMatch && (
                <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 pt-0.5">
                  <Check className="h-3 w-3" />
                  <span>Passwords match</span>
                </p>
              )}
              {passwordsMismatch && (
                <p className="text-[11px] font-semibold text-rose-600 pt-0.5">
                  Passwords do not match
                </p>
              )}
            </div>
          )}

          {/* Checkboxes & Preferences */}
          {mode === 'signin' ? (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-zinc-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span>Remember me on this device</span>
              </label>
            </div>
          ) : (
            <div className="pt-1">
              <label className="flex items-start gap-2 text-xs text-zinc-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-zinc-300 text-brand-600 focus:ring-brand-500 mt-0.5 cursor-pointer shrink-0"
                />
                <span className="text-[11px] text-zinc-500 leading-tight">
                  I agree to the FrameCalcPro Terms of Service and understand estimates are for material takeoff calculation purposes.
                </span>
              </label>
            </div>
          )}

          {/* Error Message Display */}
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200 animate-fade-in">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={loading} className="min-w-[140px]">
              {loading
                ? 'Processing...'
                : mode === 'signin'
                ? 'Sign In to Workspace'
                : 'Create Free Account'}
            </Button>
          </div>
        </form>

        {/* Quick Link between Sign In and Sign Up */}
        <div className="pt-2 text-center text-xs text-zinc-500">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setErrorMsg('')
                }}
                className="font-bold text-brand-600 hover:text-brand-700 underline cursor-pointer"
              >
                Create Account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setErrorMsg('')
                }}
                className="font-bold text-brand-600 hover:text-brand-700 underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

        <p className="text-center text-[10px] text-zinc-400 pt-1">
          {isConfigured
            ? 'Encrypted with Supabase PostgreSQL & Row Level Security.'
            : 'Protected with SHA-256 Salted Cryptographic Storage.'}
        </p>
      </div>
    </Modal>
  )
}
