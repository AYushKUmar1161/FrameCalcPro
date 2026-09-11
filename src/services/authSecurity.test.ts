// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateSalt,
  hashPassword,
  validateEmail,
  evaluatePasswordStrength,
  registerLocalAccount,
  verifyLocalCredentials,
  seedDemoAccount,
  findAccountByEmail,
} from './authSecurity'

describe('authSecurity - Cryptographic Authentication & Account Engine', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('generates unique salts of 32 hex characters (16 bytes)', () => {
    const salt1 = generateSalt()
    const salt2 = generateSalt()
    expect(salt1).toHaveLength(32)
    expect(salt2).toHaveLength(32)
    expect(salt1).not.toEqual(salt2)
  })

  it('computes deterministic SHA-256 hash with salt', async () => {
    const salt = 'a1b2c3d4e5f67890123456789abcdef0'
    const hash1 = await hashPassword('SecretPass123!', salt)
    const hash2 = await hashPassword('SecretPass123!', salt)
    const hashDiff = await hashPassword('DifferentPass!', salt)

    expect(hash1).toEqual(hash2)
    expect(hash1).not.toEqual(hashDiff)
    expect(hash1).toHaveLength(64) // SHA-256 hex length
  })

  it('validates email formats correctly', () => {
    expect(validateEmail('estimator@framecalcpro.com')).toBe(true)
    expect(validateEmail('ayushkumar1161.ak@gmail.com')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
  })

  it('evaluates password strength dynamically', () => {
    const short = evaluatePasswordStrength('short')
    expect(short.score).toBe(0)
    expect(short.label).toBe('Too short')

    const weak = evaluatePasswordStrength('alllowercase')
    expect(weak.score).toBeGreaterThanOrEqual(1)

    const strong = evaluatePasswordStrength('StR0ngP@ssw0rd!2026')
    expect(strong.score).toBeGreaterThanOrEqual(3)
  })

  it('registers a new account and rejects duplicate registrations', async () => {
    const reg1 = await registerLocalAccount({
      email: 'ayush@builder.com',
      password: 'StrongPassword123!',
      fullName: 'Ayush Kumar',
      companyName: 'AK Framing LLC',
    })

    expect(reg1.success).toBe(true)
    expect(reg1.account?.email).toBe('ayush@builder.com')
    expect(reg1.account?.passwordHash).not.toBe('StrongPassword123!') // Not stored in plaintext!

    // Attempt to register again with same email
    const reg2 = await registerLocalAccount({
      email: 'ayush@builder.com',
      password: 'AnotherPassword456!',
      fullName: 'Ayush Duplicate',
    })

    expect(reg2.success).toBe(false)
    expect(reg2.error).toContain('already exists')
  })

  it('verifies credentials against stored salted hash', async () => {
    await registerLocalAccount({
      email: 'contractor@construction.com',
      password: 'MyValidPassword99#',
      fullName: 'John Contractor',
    })

    // Correct credentials
    const valid = await verifyLocalCredentials('contractor@construction.com', 'MyValidPassword99#')
    expect(valid.success).toBe(true)
    expect(valid.account?.fullName).toBe('John Contractor')

    // Incorrect password
    const invalidPass = await verifyLocalCredentials('contractor@construction.com', 'WrongPassword123')
    expect(invalidPass.success).toBe(false)
    expect(invalidPass.error).toContain('Incorrect password')

    // Non-existent email
    const invalidEmail = await verifyLocalCredentials('unknown@nonexistent.com', 'AnyPassword123')
    expect(invalidEmail.success).toBe(false)
    expect(invalidEmail.error).toContain('No account found')
  })

  it('seeds default demo account', async () => {
    await seedDemoAccount()
    const demo = findAccountByEmail('demo@framecalcpro.com')
    expect(demo).not.toBeNull()
    expect(demo?.fullName).toContain('Ayush Kumar')

    // Verifying demo account login
    const verifyDemo = await verifyLocalCredentials('demo@framecalcpro.com', 'FrameCalc2026!')
    expect(verifyDemo.success).toBe(true)
  })
})
