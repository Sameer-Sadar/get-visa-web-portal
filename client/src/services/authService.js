import { ApiError, apiFetch, isMockMode, mockLatency } from './apiClient.js'
import { DEMO_ACCOUNT, session } from '../app/session.js'

/**
 * Authentication and account services (TRD §5.2, Auth + Profile endpoints).
 *
 * FR-ACC-08/§6.4: error copy must never reveal whether an account exists. The
 * mock enforces that at the *error* level, not just in the UI, so a future
 * component cannot accidentally leak it — `ACCOUNT_NOT_FOUND` is never
 * returned from `signIn` or `requestPasswordReset`.
 */

const GENERIC_CREDENTIALS_ERROR = {
  status: 401,
  code: 'INVALID_CREDENTIALS',
  title: 'Email, password or code is not correct',
}

const GENERIC_RESET_ERROR = {
  status: 202,
  code: 'RESET_SENT',
  title: 'If that account exists, a reset link is on its way',
}

/** Demo password gate. Any password ≥ 8 chars with a digit works, so the
 *  prototype does not become a guessing game. */
function passwordLooksValid(password) {
  return typeof password === 'string' && password.length >= 8 && /\d/.test(password)
}

export async function signIn({ email, password, mfaCode }) {
  if (isMockMode) {
    await mockLatency()

    if (!passwordLooksValid(password)) {
      throw new ApiError(GENERIC_CREDENTIALS_ERROR)
    }

    if (mfaCode !== undefined && mfaCode !== '123456') {
      throw new ApiError({ status: 401, code: 'MFA_INVALID', title: 'That code is not correct' })
    }

    session.setUser({ ...DEMO_ACCOUNT, email })
    return DEMO_ACCOUNT
  }

  const user = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password, mfaCode },
  })
  session.setUser(user)
  return user
}

export async function register({ email, password }) {
  if (isMockMode) {
    await mockLatency()

    if (!passwordLooksValid(password)) {
      throw new ApiError({
        status: 422,
        code: 'WEAK_PASSWORD',
        title: 'Password does not meet the requirements',
        errors: [
          {
            field: 'password',
            code: 'WEAK_PASSWORD',
            message: 'Use at least 8 characters, including a number.',
          },
        ],
      })
    }

    return { id: 'usr_new', email, emailVerified: false, displayName: null }
  }

  return apiFetch('/auth/register', { method: 'POST', body: { email, password } })
}

/**
 * FR-ACC-02: phone verification by SMS. Sending is idempotent from the
 * caller's point of view — the response is identical whether or not the
 * destination exists (FR-TRK-04 applies to auth for the same reason).
 */
export async function requestOtp({ email, purpose }) {
  if (isMockMode) {
    await mockLatency()
    return { sent: true, expiresInSeconds: 300, resendAfterSeconds: 30 }
  }

  return apiFetch('/auth/otp/send', { method: 'POST', body: { email, purpose } })
}

export async function verifyOtp({ email, code, purpose }) {
  if (isMockMode) {
    await mockLatency()

    if (code !== '123456') {
      throw new ApiError({ status: 401, code: 'OTP_INVALID', title: 'That code is not correct' })
    }

    const user = { ...DEMO_ACCOUNT, email, emailVerified: true, phoneVerified: true }
    session.setUser(user)
    return user
  }

  const user = await apiFetch('/auth/otp/verify', {
    method: 'POST',
    body: { email, code, purpose },
  })
  session.setUser(user)
  return user
}

export async function requestPasswordReset({ email }) {
  if (isMockMode) {
    await mockLatency()
    return { sent: true }
  }

  return apiFetch('/auth/password/forgot', { method: 'POST', body: { email } })
}

export async function resetPassword({ token, password }) {
  if (isMockMode) {
    await mockLatency()

    if (!passwordLooksValid(password)) {
      throw new ApiError({
        status: 422,
        code: 'WEAK_PASSWORD',
        title: 'Password does not meet the requirements',
        errors: [
          {
            field: 'password',
            code: 'WEAK_PASSWORD',
            message: 'Use at least 8 characters, including a number.',
          },
        ],
      })
    }

    return { reset: true }
  }

  return apiFetch('/auth/password/reset', { method: 'POST', body: { token, password } })
}

/** FR-ACC-03: session list and revoke. */
export async function getSessions() {
  if (isMockMode) {
    await mockLatency()
    return [
      {
        id: 'sess_current',
        device: 'This browser',
        location: 'Riyadh, SA',
        lastUsedAt: '2026-10-18T08:12:00.000Z',
        current: true,
      },
      {
        id: 'sess_old_phone',
        device: 'iPhone 14 · Safari',
        location: 'Riyadh, SA',
        lastUsedAt: '2026-10-02T19:40:00.000Z',
        current: false,
      },
    ]
  }

  return apiFetch('/me/sessions')
}

export async function revokeSession(sessionId) {
  if (isMockMode) {
    await mockLatency()
    return { revoked: sessionId }
  }

  return apiFetch(`/me/sessions/${sessionId}`, { method: 'DELETE' })
}

export async function signOut() {
  if (!isMockMode) {
    await apiFetch('/auth/logout', { method: 'POST' })
  }
  session.clear()
}

/** FR-ACC-05/06: profile, with the wizard prefilling from it. */
export async function getProfile() {
  if (isMockMode) {
    await mockLatency()
    return {
      fullName: 'Sara Hassan',
      fullNameAr: 'سارة حسن',
      dateOfBirth: '1994-03-12',
      gender: 'F',
      nationalityCode: 'EG',
      residenceCountryCode: 'SA',
      email: DEMO_ACCOUNT.email,
      phone: { countryCode: 'SA', number: '512345678' },
      address: {
        line1: 'King Fahd Road',
        city: 'Riyadh',
        postcode: '12211',
      },
    }
  }

  return apiFetch('/me/profile')
}

export async function updateProfile(patch) {
  if (isMockMode) {
    await mockLatency()
    return { ...patch, updated: true }
  }

  return apiFetch('/me/profile', { method: 'PATCH', body: patch })
}

export { GENERIC_CREDENTIALS_ERROR, GENERIC_RESET_ERROR }