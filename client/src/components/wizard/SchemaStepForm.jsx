import { HelpCircle } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Checkbox, RadioGroup } from '@visagate/ui/choices'
import { DateField } from '@visagate/ui/DateField'
import { Select, SelectGroup, SelectItem } from '@visagate/ui/Select'
import { TextField, Textarea } from '@visagate/ui/inputs'
import { PhoneField } from '@visagate/ui/PhoneField'
import { cx } from '@visagate/ui/lib/cx.js'
import { countries } from '../../fixtures/countries.js'
import { optionsFor, visibleFields } from '../../lib/formSchema.js'

/**
 * Renders one wizard step from its schema (FR-APP-01).
 *
 * Rules from §6.5 and §8:
 *  - one topic per step, labels above controls, "(required)" spelled out;
 *  - validation on blur first, then on change once a field has an error;
 *  - conditional fields appear inline and disappear from the accessibility
 *    tree when they do not apply;
 *  - "Why do we ask?" expanders sit under sensitive fields instead of tooltips,
 *    because a tooltip is not keyboard- or touch-friendly (§5.2).
 */
export function SchemaStepForm({ step, values, errors, onChange, onBlur }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const fields = visibleFields(step, values)

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {fields.map((field) => (
        <SchemaField
          key={field.key}
          field={field}
          value={values?.[field.key]}
          error={errors?.[field.key]}
          locale={locale}
          onChange={(value) => onChange(field.key, value)}
          onBlur={() => onBlur(field.key)}
        />
      ))}
      {fields.length === 0 ? (
        <p className="text-neutral-700 sm:col-span-2">{t('wizard.noQuestions')}</p>
      ) : null}
      <span className="sr-only">{t('wizard.stepAnnouncement', { step: t(step.labelKey) })}</span>
    </div>
  )
}

function SchemaField({ field, value, error, locale, onChange, onBlur }) {
  const { t } = useTranslation()
  const [whyOpen, setWhyOpen] = useState(false)
  const whyId = useId()

  const label = t(field.labelKey)
  const hint = field.hintKey ? t(field.hintKey) : undefined
  const options = optionsFor(field, locale)
  const width = field.width === 'full' ? 'sm:col-span-2' : undefined
  const shared = {
    label,
    hint,
    error,
    required: field.required,
    optional: field.optional,
    onBlur,
    /* Stable id so the wizard's error summary can anchor to this field. */
    id: `field-${field.key}`,
  }

  /* Radio and checkbox manage their own ids; their groups are anchored by the
     wrapper instead. */
  let control

  switch (field.type) {
    case 'textarea':
      control = <Textarea {...shared} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />
      break

    case 'date':
      control = (
        <DateField {...shared} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />
      )
      break

    case 'email':
      control = (
        <TextField
          {...shared}
          type="email"
          inputMode="email"
          autoComplete={field.autocomplete}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      )
      break

    case 'select':
    case 'nationality':
      control = (
        <Select
          {...shared}
          value={value ?? ''}
          onValueChange={onChange}
        >
          {field.type === 'nationality' ? (
            <SelectGroup label={t('wizard.groupCountries')}>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ) : (
            options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.labelKey)}
              </SelectItem>
            ))
          )}
        </Select>
      )
      break

    case 'radio':
      control = (
        <RadioGroup
          label={label}
          error={error}
          description={hint}
          value={value ?? ''}
          onValueChange={onChange}
          options={options.map((option) => ({
            value: option.value,
            label: t(option.labelKey),
          }))}
        />
      )
      break

    case 'checkbox':
      control = (
        <Checkbox
          label={label}
          description={hint}
          error={error}
          checked={value === true}
          onCheckedChange={(checked) => onChange(checked)}
        />
      )
      break

    case 'phone':
      control = (
        <PhoneField
          {...shared}
          countries={countries}
          value={value ?? { countryCode: 'SA', number: '' }}
          onChange={onChange}
        />
      )
      break

    default:
      control = (
        <TextField
          {...shared}
          autoComplete={field.autocomplete}
          dir={field.dir}
          className={field.uppercase ? 'uppercase' : undefined}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      )
  }

  return (
    <div id={`field-${field.key}`} className={cx('scroll-mt-28', width)}>
      {control}

      {field.whyWeAskKey ? (
        <div className="mt-1.5">
          <button
            type="button"
            onClick={() => setWhyOpen((open) => !open)}
            aria-expanded={whyOpen}
            aria-controls={whyId}
            className="text-primary-700 hover:text-primary-600 inline-flex min-h-9 items-center gap-1.5 text-small"
          >
            <HelpCircle aria-hidden="true" className="size-4" />
            {t('wizard.whyWeAsk')}
          </button>
          <p id={whyId} hidden={!whyOpen} className="text-neutral-700 text-small">
            {t(field.whyWeAskKey)}
          </p>
        </div>
      ) : null}
    </div>
  )
}