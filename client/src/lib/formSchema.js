import { countries } from '../fixtures/countries.js'
import { localize } from './format.js'

/**
 * Evaluates a step's schema.
 *
 * `showIf` is the small documented subset: one field compared to one value.
 * Conditional fields are hidden from the accessibility tree entirely rather
 * than disabled, so a screen reader never lands on an irrelevant question —
 * and their values are dropped on submit for the same reason.
 */
export function visibleFields(step, answers) {
  if (!step.fields?.length) return []

  return step.fields.filter((field) => {
    if (!field.showIf) return true

    const actual = answers?.[field.showIf.field]
    const expected = field.showIf.equals

    if (typeof expected === 'boolean') return Boolean(actual) === expected
    return actual === expected
  })
}

/**
 * Field-level validation (§6.5: on blur first, then on change after an error;
 * never validate an untouched required field).
 *
 * Returns a map of fieldKey → message, or an empty object when valid.
 */
export function validateStep(step, answers, { locale = 'en', labels = {} } = {}) {
  const errors = {}

  for (const field of visibleFields(step, answers)) {
    const value = answers?.[field.key]

    if (field.type === 'checkbox') {
      if (field.required && value !== true) {
        errors[field.key] = labels.required ?? 'This is required.'
      }
      continue
    }

    const isEmpty = value === undefined || value === null || String(value).trim() === ''

    if (field.required && isEmpty) {
      errors[field.key] = labels.required ?? 'This is required.'
      continue
    }

    if (isEmpty) continue

    switch (field.type) {
      case 'email': {
        /* Deliberately permissive: a strict RFC pattern rejects valid addresses,
           and the server is the authority (TRD §3, Zod on both sides). */
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          errors[field.key] = labels.invalidEmail ?? 'Enter an email address in the format name@example.com.'
        }
        break
      }

      case 'date': {
        if (Number.isNaN(new Date(value).getTime())) {
          errors[field.key] = labels.invalidDate ?? 'Enter a valid date.'
        }
        break
      }

      case 'phone': {
        const digits = String(value?.number ?? value ?? '').replace(/\D/g, '')
        if (digits.length < 7) {
          errors[field.key] = labels.invalidPhone ?? 'Enter a complete phone number.'
        }
        break
      }

      case 'nationality': {
        if (!countries.some((country) => country.code === value)) {
          errors[field.key] = labels.invalidOption ?? 'Choose one of the options.'
        }
        break
      }

      default:
        break
    }
  }

  /* Departure must be after arrival — caught here so the applicant is told
     before the step advances rather than after submit. */
  if (step.key === 'travel' && answers?.arrivalDate && answers?.departureDate) {
    if (new Date(answers.departureDate) <= new Date(answers.arrivalDate)) {
      errors.departureDate = labels.departureAfterArrival ?? 'Your departure date must be after your arrival date.'
    }
  }

  void locale
  return errors
}

/** Drops values for fields that are currently hidden, so stale answers from a
 *  previously-selected branch are never submitted (FR-APP-06). */
export function pruneHiddenAnswers(step, answers) {
  const visible = new Set(visibleFields(step, answers).map((field) => field.key))

  return Object.fromEntries(
    Object.entries(answers ?? {}).filter(([key]) => visible.has(key)),
  )
}

export function optionsFor(field, locale = 'en') {
  if (field.type === 'nationality') {
    return countries.map((country) => ({
      value: country.code,
      label: `${country.flag} ${localize(country.names, locale)}`,
    }))
  }

  return field.options ?? []
}

/** Progress for the stepper: a step counts as complete when saved. */
export function completionPercent(completedStepKeys = [], totalSteps = 0) {
  if (totalSteps === 0) return 0
  return Math.round((completedStepKeys.length / totalSteps) * 100)
}