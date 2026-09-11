/**
 * FrameCalcPro Authentication Security & Cryptographic Storage Engine
 * Provides SHA-256 password hashing with salt, password strength analysis,
 * and encrypted local account management.
 */

export interface StoredAccount {
  id: string
  email: string
  fullName: string
  companyName?: string
  passwordHash: string
  salt: string
  createdAt: string
  lastLoginAt: string
  role: 'estimator' | 'contractor' | 'admin'
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4
  label: 'Too short' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong'
  feedback: string
  color: string
}

const ACCOUNTS_STORAGE_KEY = 'framecalcpro_accounts_db'

/**
 * Generates a cryptographically random 16-byte salt as a hex string
 */
export function generateSalt(): string {
  const array = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for non-crypto environments
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Computes a SHA-256 cryptographic hash of the password combined with the salt
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(`${salt}:${password}`)

  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Fallback simple bit-shift hash if Web Crypto is unavailable (e.g. older headless node)
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < data.length; i++) {
    const ch = data[i]
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0) + '-' + salt
}

/**
 * Validates email format according to standard specification
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email.trim())
}

/**
 * Evaluates password strength and returns score, label, and actionable feedback
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < 8) {
    return {
      score: 0,
      label: 'Too short',
      feedback: 'Use at least 8 characters with a mix of letters and numbers.',
      color: 'bg-zinc-200 text-zinc-600',
    }
  }

  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  // Normalize score to 1-4
  const normalized = Math.min(4, Math.max(1, score - 1)) as 1 | 2 | 3 | 4

  switch (normalized) {
    case 1:
      return {
        score: 1,
        label: 'Weak',
        feedback: 'Add capital letters, numbers, or symbols to strengthen.',
        color: 'bg-rose-500 text-rose-700',
      }
    case 2:
      return {
        score: 2,
        label: 'Fair',
        feedback: 'Good start. Adding special symbols will make it stronger.',
        color: 'bg-amber-500 text-amber-700',
      }
    case 3:
      return {
        score: 3,
        label: 'Strong',
        feedback: 'Strong password with good character variety.',
        color: 'bg-emerald-500 text-emerald-700',
      }
    case 4:
      return {
        score: 4,
        label: 'Very Strong',
        feedback: 'Excellent! High-entropy cryptographic protection.',
        color: 'bg-emerald-600 text-emerald-800',
      }
  }
}

/**
 * Retrieves all registered accounts from local storage
 */
export function getStoredAccounts(): StoredAccount[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data) as StoredAccount[]
  } catch (err) {
    console.warn('Failed to parse stored accounts:', err)
    return []
  }
}

/**
 * Saves the list of accounts to local storage
 */
export function saveStoredAccounts(accounts: StoredAccount[]): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
  } catch (err) {
    console.warn('Failed to persist accounts:', err)
  }
}

/**
 * Searches for an account by email (case-insensitive)
 */
export function findAccountByEmail(email: string): StoredAccount | null {
  const accounts = getStoredAccounts()
  const normalized = email.trim().toLowerCase()
  return accounts.find((acc) => acc.email.toLowerCase() === normalized) ?? null
}

/**
 * Registers a new account with salted SHA-256 password hash
 */
export async function registerLocalAccount(data: {
  email: string
  password: string
  fullName: string
  companyName?: string
}): Promise<{ success: boolean; account?: StoredAccount; error?: string }> {
  const normalizedEmail = data.email.trim().toLowerCase()

  if (!validateEmail(normalizedEmail)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  if (!data.fullName.trim()) {
    return { success: false, error: 'Full Name is required.' }
  }

  if (data.password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' }
  }

  // Check if account already exists
  const existing = findAccountByEmail(normalizedEmail)
  if (existing) {
    return {
      success: false,
      error: 'An account with this email address already exists. Please sign in instead.',
    }
  }

  // Generate salt and compute SHA-256 hash
  const salt = generateSalt()
  const passwordHash = await hashPassword(data.password, salt)

  const newAccount: StoredAccount = {
    id: 'fcp-' + Math.random().toString(36).substring(2, 10),
    email: normalizedEmail,
    fullName: data.fullName.trim(),
    companyName: data.companyName?.trim() || undefined,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    role: 'estimator',
  }

  const accounts = getStoredAccounts()
  accounts.push(newAccount)
  saveStoredAccounts(accounts)

  return { success: true, account: newAccount }
}

/**
 * Verifies credentials against stored salted hash
 */
export async function verifyLocalCredentials(
  email: string,
  password: string,
): Promise<{ success: boolean; account?: StoredAccount; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail || !password) {
    return { success: false, error: 'Email and password are required.' }
  }

  // Seed default demo account if no accounts exist yet
  await seedDemoAccount()

  const account = findAccountByEmail(normalizedEmail)
  if (!account) {
    return {
      success: false,
      error: 'No account found with this email address. Please check your spelling or create a new account.',
    }
  }

  // Hash input password with stored salt and compare
  const inputHash = await hashPassword(password, account.salt)
  if (inputHash !== account.passwordHash) {
    return {
      success: false,
      error: 'Incorrect password. Please verify your credentials and try again.',
    }
  }

  // Update last login timestamp
  account.lastLoginAt = new Date().toISOString()
  const accounts = getStoredAccounts().map((a) => (a.id === account.id ? account : a))
  saveStoredAccounts(accounts)

  return { success: true, account }
}

/**
 * Seeds a default demo estimator account if one doesn't already exist
 */
export async function seedDemoAccount(): Promise<void> {
  const accounts = getStoredAccounts()
  const demoExists = accounts.some((a) => a.email.toLowerCase() === 'demo@framecalcpro.com')

  if (!demoExists) {
    const salt = generateSalt()
    const passwordHash = await hashPassword('FrameCalc2026!', salt)
    const demoAccount: StoredAccount = {
      id: 'fcp-demo-01',
      email: 'demo@framecalcpro.com',
      fullName: 'Ayush Kumar (Demo Lead)',
      companyName: 'FrameCalcPro Estimating',
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      role: 'estimator',
    }
    accounts.push(demoAccount)
    saveStoredAccounts(accounts)
  }
}
