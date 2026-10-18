import { Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@visagate/ui/Button'
import { Select, SelectItem, SelectGroup } from '@visagate/ui/Select'
import { TextField } from '@visagate/ui/inputs'
import { countries } from '../../fixtures/countries.js'
import { localePath } from '../../config/site.js'
import { localize } from '../../lib/format.js'

const PURPOSES = [
  { value: 'TOURISM', labelKey: 'purpose.tourism' },
  { value: 'BUSINESS', labelKey: 'purpose.business' },
  { value: 'FAMILY', labelKey: 'purpose.family' },
  { value: 'MEDICAL', labelKey: 'purpose.medical' },
  { value: 'TRANSIT', labelKey: 'purpose.transit' },
  { value: 'WORK', labelKey: 'purpose.work' },
  { value: 'STUDY', labelKey: 'purpose.study' },
]

/** Shown first in the combobox. Values are removed from "All countries" below
 *  so every SelectItem value stays unique, which Radix requires. */
const POPULAR_CODES = ['EG', 'SA', 'AE', 'IN', 'PK', 'PH', 'GB', 'US', 'TR', 'ID']

const EMPTY = {
  nationalityCode: '',
  purpose: '',
  arrivalDate: '',
  travelerCount: '1',
}

/** Browsers hand back `yyyy-mm-dd`; add T00:00Z so it parses as a real date. */
function toIsoDate(value) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

/**
 * Visa Finder (FR-FND-01). Above the fold on the home page (§6.1) — this is
 * the single most important control in the product, since goal G1 is finding
 * the right visa in under 60 seconds.
 *
 * Defaults come from the browser locale but are never pre-filled with a
 * nationality: guessing someone's nationality would be both wrong and
 * inappropriate.
 */
export function FinderForm({ defaultValues, onSearch, showTravelers = true, className }) {
  const { t, i18n } = useTranslation()
  const { locale } = useParams()
  const navigate = useNavigate()
  const language = i18n.resolvedLanguage
  const [values, setValues] = useState({ ...EMPTY, ...defaultValues })
  const [submitted, setSubmitted] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const update = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }))

  const nationalityError =
    submitted && !values.nationalityCode ? t('finder.errorNationality') : undefined
  const purposeError = submitted && !values.purpose ? t('finder.errorPurpose') : undefined

  const submit = (event) => {
    event.preventDefault()
    setSubmitted(true)

    if (!values.nationalityCode || !values.purpose) return

    const criteria = {
      nationalityCode: values.nationalityCode,
      purpose: values.purpose,
      arrivalDate: toIsoDate(values.arrivalDate),
      travelerCount: Number(values.travelerCount) || 1,
    }

    if (onSearch) {
      onSearch(criteria)
      return
    }

    /* No personal data in the URL (FR-FND-05): nationality and purpose only,
       and the date is a trip plan, not an identity. */
    const params = new URLSearchParams({
      nationality: criteria.nationalityCode,
      purpose: criteria.purpose,
      travelers: String(criteria.travelerCount),
    })
    if (criteria.arrivalDate) params.set('arrival', criteria.arrivalDate)

    navigate(`${localePath(locale, '/find-a-visa')}?${params}`)
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label={t('finder.formLabel')}
      className={className}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Select
            label={t('finder.nationality')}
            required
            hint={t('finder.nationalityHint')}
            error={nationalityError}
            value={values.nationalityCode}
            onValueChange={(code) =>
              setValues((current) => ({ ...current, nationalityCode: code }))
            }
          >
            <SelectGroup label={t('finder.groupCommon')}>
              {countries
                .filter((country) => POPULAR_CODES.includes(country.code))
                .map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {localize(country.names, language)}
                  </SelectItem>
                ))}
            </SelectGroup>
            <SelectGroup label={t('finder.groupAll')}>
              {countries
                .filter((country) => !POPULAR_CODES.includes(country.code))
                .map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {localize(country.names, language)}
                  </SelectItem>
                ))}
            </SelectGroup>
          </Select>
        </div>

        <div className="lg:col-span-3">
          <Select
            label={t('finder.purpose')}
            required
            error={purposeError}
            value={values.purpose}
            onValueChange={(purpose) => setValues((current) => ({ ...current, purpose }))}
          >
            {PURPOSES.map((purpose) => (
              <SelectItem key={purpose.value} value={purpose.value}>
                {t(purpose.labelKey)}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="lg:col-span-3">
          <TextField
            label={t('finder.arrivalDate')}
            type="date"
            min={today}
            optional
            value={values.arrivalDate}
            onChange={update('arrivalDate')}
          />
        </div>

        {showTravelers ? (
          <div className="lg:col-span-2">
            <TextField
              label={t('finder.travelers')}
              type="number"
              inputMode="numeric"
              min={1}
              max={10}
              value={values.travelerCount}
              onChange={update('travelerCount')}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="l">
          <Search aria-hidden="true" className="size-4" />
          {t('finder.submit')}
        </Button>
        <p className="text-neutral-700 text-small">{t('finder.disclaimer')}</p>
      </div>
    </form>
  )
}