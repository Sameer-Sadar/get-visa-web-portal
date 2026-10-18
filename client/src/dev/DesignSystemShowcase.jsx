import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Check, FileSearch, Hourglass } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Modal, Tabs, TabsContent, TabsList, TabsTrigger } from '@visagate/ui/overlays'
import { Alert, EmptyState, ProgressBar, Skeleton } from '@visagate/ui/feedback'
import { Badge } from '@visagate/ui/Badge'
import { Breadcrumbs, Pagination, Stepper } from '@visagate/ui/navigation'
import { Button } from '@visagate/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@visagate/ui/Card'
import { Checkbox, RadioGroup, Switch } from '@visagate/ui/choices'
import { Container, Divider, Section } from '@visagate/ui/Container'
import { DateField } from '@visagate/ui/DateField'
import { DescriptionList, KpiTile, Table } from '@visagate/ui/data'
import { DocumentUploadRow, FileUploader } from '@visagate/ui/FileUploader'
import { OtpInput } from '@visagate/ui/OtpInput'
import { PhoneField } from '@visagate/ui/PhoneField'
import { Select, SelectItem } from '@visagate/ui/Select'
import { StatusPill, ELIGIBILITY } from '@visagate/ui/StatusPill'
import { Textarea, TextField, PasswordField } from '@visagate/ui/inputs'
import { Timeline } from '@visagate/ui/Timeline'

const COUNTRIES = [
  { code: 'SA', dialCode: '+966', label: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'EG', dialCode: '+20', label: 'Egypt', flag: '🇪🇬' },
  { code: 'GB', dialCode: '+44', label: 'United Kingdom', flag: '🇬🇧' },
]

const PHONE = { countryCode: 'SA', number: '' }

/** PRD §8.1 lifecycle order, paired with the i18n keys from §5.3. */
const STATUS_ORDER = [
  ['DRAFT', 'status.draft'],
  ['PENDING_PAYMENT', 'status.pendingPayment'],
  ['SUBMITTED', 'status.submitted'],
  ['UNDER_REVIEW', 'status.underReview'],
  ['INFO_REQUESTED', 'status.infoRequested'],
  ['APPROVED', 'status.approved'],
  ['ISSUED', 'status.issued'],
  ['REJECTED', 'status.rejected'],
  ['WITHDRAWN', 'status.withdrawn'],
  ['CANCELLED', 'status.cancelled'],
  ['EXPIRED', 'status.expired'],
]

const TIMELINE = [
  { key: 'submitted', label: 'Submitted', date: '12 Oct 2026', state: 'done' },
  { key: 'paid', label: 'Payment received', date: '12 Oct 2026', state: 'done' },
  {
    key: 'review',
    label: 'Under review',
    description: 'Most decisions take about 3 days.',
    state: 'current',
  },
  { key: 'decision', label: 'Decision', state: 'todo' },
  { key: 'issued', label: 'Visa issued', state: 'todo' },
]

const STEPS = [
  { key: 'applicant', label: 'Applicant' },
  { key: 'passport', label: 'Passport' },
  { key: 'travel', label: 'Travel' },
  { key: 'stay', label: 'Stay' },
  { key: 'documents', label: 'Documents' },
  { key: 'declarations', label: 'Declarations' },
  { key: 'review', label: 'Review' },
]

/**
 * Dev-only reference page for the design system. Excluded from production
 * builds by the `import.meta.env.DEV` guard in App.jsx. Useful until the
 * Storybook parity work in §17 of the UI/UX spec lands.
 */
export default function DesignSystemShowcase() {
  const { t } = useTranslation()
  const { t: tu } = useTranslation('ui')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState('sa')
  const [phone, setPhone] = useState(PHONE)
  const [otp, setOtp] = useState('12')
  const [page, setPage] = useState(1)
  const [switchOn, setSwitchOn] = useState(true)

  return (
    <Container size="wide" className="space-y-12 py-10">
      <header>
        <h1 className="text-display font-bold">Design system</h1>
        <p className="text-neutral-700">Dev-only reference for {t('brand.name')}.</p>
      </header>

      {/* ── Actions ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">Actions</h2>
        <Divider />
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button size="l">Large</Button>
          <Button size="s">Small</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Button asChild variant="tertiary">
            <a href="#showcase">Anchor as button</a>
          </Button>
        </div>
      </section>

      {/* ── Status ──────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">Status pills</h2>
        <Divider />
        <div className="flex flex-wrap gap-2">
          {STATUS_ORDER.map(([status, labelKey]) => (
            <StatusPill key={status} status={status} label={t(labelKey)} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {['eligible', 'conditional', 'notEligible'].map((key) => {
            const status = key === 'notEligible' ? 'NOT_ELIGIBLE' : key.toUpperCase()
            return <StatusPill key={status} status={status} map={ELIGIBILITY} label={t(`eligibility.${key}`)} />
          })}
          <Badge tone="primary">Primary badge</Badge>
          <Badge tone="accent">Accent</Badge>
        </div>
      </section>

      {/* ── Inputs ──────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">Inputs</h2>
        <Divider />
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label="Full name as in passport"
            required
            hint="Exactly as printed in the machine-readable zone."
          />
          <TextField
            label="Email address"
            type="email"
            autoComplete="email"
            optional
            error="Enter an email address in the format name@example.com."
          />
          <PasswordField label="Password" required autoComplete="new-password" />
          <TextField label="Passport number" inputMode="numeric" dir="ltr" />
          <DateField label="Date of birth" />
          <PhoneField
            label="Mobile number"
            countries={COUNTRIES}
            value={phone}
            onChange={setPhone}
            hint="We send one-time codes to this number."
          />
          <Textarea label="Purpose of travel" hint="A short description is fine." />
          <OtpInput label="Verification code" value={otp} onChange={setOtp} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Select label="Nationality" required hint="As listed in your passport.">
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.flag} {country.label}
              </SelectItem>
            ))}
          </Select>

          <RadioGroup
            label="Purpose of visit"
            value={selected}
            onValueChange={setSelected}
            options={[
              { value: 'tourism', label: 'Tourism', description: 'Visiting as a visitor.' },
              { value: 'business', label: 'Business' },
              { value: 'family', label: 'Family or friends' },
            ]}
          />

          <Checkbox
            label="I confirm the details are correct"
            description="Required before you can submit."
          />
          <Checkbox label="Send me updates by SMS" />
          <Switch
            label="Two-factor authentication"
            description="Required for staff accounts."
            checked={switchOn}
            onCheckedChange={setSwitchOn}
          />
        </div>
      </section>

      {/* ── Documents ───────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">Documents</h2>
        <Divider />
        <FileUploader label="Passport bio page" onSelect={() => {}} />
        <ul className="space-y-3">
          <DocumentUploadRow label="Passport bio page" state="done" fileName="passport.jpg" fileSize={1258291} />
          <DocumentUploadRow label="Personal photo" state="uploading" progress={64} />
          <DocumentUploadRow label="Hotel booking" state="checking" />
          <DocumentUploadRow
            label="Return ticket"
            state="rejected"
            reason="The image is too blurry to read. Upload a sharper photo of the full page."
          />
          <DocumentUploadRow label="Bank statement" state="pending" fileKey="Bank statement (optional)" />
        </ul>
      </section>

      {/* ── Feedback ────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">Feedback</h2>
        <Divider />
        <div className="space-y-3">
          <Alert tone="info" title="Application received">
            We have your application and will email you when the status changes.
          </Alert>
          <Alert tone="success">Payment received. Your receipt is ready to download.</Alert>
          <Alert tone="warning" title="Uploads are paused">
            Your answers are saved — please come back in a few minutes.
          </Alert>
          <Alert tone="danger">We could not accept this file. Upload a clearer copy.</Alert>
          <ProgressBar value={40} label="Application completion" />
          <div className="flex gap-3">
            <Skeleton className="h-24 flex-1" />
            <Skeleton className="h-24 flex-1" />
          </div>
          <EmptyState
            icon={FileSearch}
            title="You haven't started any applications"
            description="Find the visa that fits your trip."
            action={<Button>Find a visa</Button>}
          />
        </div>
      </section>

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">Navigation &amp; progress</h2>
        <Divider />
        <Breadcrumbs items={[{ label: 'Home', to: '#' }, { label: 'Visas', to: '#' }, { label: 'Tourism' }]} />
        <Stepper steps={STEPS} currentKey="travel" />
        <Timeline items={TIMELINE} />
        <Pagination page={page} pageCount={6} onPageChange={setPage} />
      </section>

      {/* ── Data display ────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold">Data display</h2>
        <Divider />
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiTile label="Applications today" value="128" delta="+12% vs yesterday" icon={Calendar} />
          <KpiTile label="Under review" value="41" icon={Hourglass} />
          <KpiTile label="Issued" value="86" icon={Check} />
        </div>

        <Tabs defaultValue="overview">
          <TabsList label="Visa detail sections">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
            <TabsTrigger value="fees">Fees &amp; timing</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-4">
            <p className="text-neutral-700">
              A single-entry visit visa for tourism, valid for the stay shown on your visa.
            </p>
          </TabsContent>
          <TabsContent value="eligibility" className="pt-4">
            <p className="text-neutral-700">Passport holders from eligible countries.</p>
          </TabsContent>
          <TabsContent value="fees" className="pt-4">
            <p className="text-neutral-700">Visa fee, service fee and VAT are listed separately.</p>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Tourist visit visa</CardTitle>
          </CardHeader>
          <CardBody>
            <DescriptionList
              columns={3}
              items={[
                { label: 'Validity', value: '30 days' },
                { label: 'Max stay', value: '30 days' },
                { label: 'Fee', value: 'SAR 300' },
                { label: 'Processing', value: '3 business days' },
                { label: 'Entries', value: 'Single' },
                { label: 'Reference', value: 'VG-ABCD-1234-XYZ' },
              ]}
            />
          </CardBody>
        </Card>

        <Table
          caption="Applications"
          empty="No applications match these filters."
          columns={[
            { key: 'ref', label: 'Reference' },
            { key: 'visa', label: 'Visa' },
            { key: 'status', label: 'Status' },
          ]}
          rows={[
            { key: '1', ref: 'VG-ABCD-1234-XYZ', visa: 'Tourism', status: 'Under review' },
            { key: '2', ref: 'VG-EFGH-5678-UVW', visa: 'Business', status: 'Visa issued' },
          ]}
        />

        <Accordion type="single" defaultValue="q1">
          <AccordionItem value="q1">
            <AccordionTrigger>How long does an e-visa take to process?</AccordionTrigger>
            <AccordionContent>
              Most standard visit visas are decided within three business days of payment.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger>What if my passport expires soon?</AccordionTrigger>
            <AccordionContent>
              Your passport must be valid for at least six months beyond the end of your stay.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <Section>
        <p className="text-neutral-700 text-small">
          UI strings shown above resolve from the <code>ui</code> namespace — for example “
          {tu('acceptedFilesHint')}”.
        </p>
      </Section>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Pay visa fee"
        description="Visa fee, service fee and VAT are listed separately before you pay."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Pay SAR 440</Button>
          </>
        }
      >
        <DescriptionList
          items={[
            { label: 'Visa fee', value: 'SAR 300' },
            { label: 'Service fee', value: 'SAR 100' },
            { label: 'VAT (15%)', value: 'SAR 40' },
          ]}
        />
      </Modal>
    </Container>
  )
}