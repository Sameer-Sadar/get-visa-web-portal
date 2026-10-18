import * as AccordionPrimitive from '@radix-ui/react-accordion'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { ChevronDown, X } from 'lucide-react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../lib/cx.js'
import { Button, IconButton } from './Button.jsx'

const OVERLAY =
  'bg-surface border-neutral-300 z-50 rounded-card border shadow-3'
const OVERLAY_SURFACE =
  'bg-neutral-900/40 fixed inset-0 z-40 backdrop-blur-[2px]'

/* ── Dialog ─────────────────────────────────────────────────────────────── */

export const Modal = forwardRef(function Modal(
  { open, onOpenChange, title, description, children, footer, size = 'md', className },
  ref,
) {
  const { t } = useTranslation('ui')
  const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl' }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={OVERLAY_SURFACE} />
        <DialogPrimitive.Content
          ref={ref}
          className={cx(
            OVERLAY,
            'fixed inset-x-4 top-1/2 max-h-[85vh] -translate-y-1/2 overflow-y-auto p-6',
            'sm:inset-x-auto sm:w-full',
            widths[size],
            className,
          )}
        >
          <DialogPrimitive.Title className="text-h3 text-neutral-900 pe-8 font-semibold">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="text-neutral-700 mt-1">
              {description}
            </DialogPrimitive.Description>
          ) : null}

          <DialogPrimitive.Close asChild>
            <IconButton label={t('close')} className="absolute end-4 top-4">
              <X aria-hidden="true" className="size-5" />
            </IconButton>
          </DialogPrimitive.Close>

          <div className="mt-4">{children}</div>
          {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
})

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  loading = false,
}) {
  const { t } = useTranslation('ui')

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {cancelLabel ?? t('cancel')}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel ?? t('confirm')}
          </Button>
        </>
      }
    />
  )
}

/* ── Drawer (mobile navigation, §3.3) ──────────────────────────────────── */

export const Drawer = forwardRef(function Drawer(
  { open, onOpenChange, title, side = 'end', children, className },
  ref,
) {
  const { t } = useTranslation('ui')
  const inline = side === 'inline' ? 'inset-y-0 start-0 h-full w-80' : 'inset-y-0 end-0 h-full w-80 max-w-[85vw]'

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={OVERLAY_SURFACE} />
        <DialogPrimitive.Content
          ref={ref}
          className={cx(OVERLAY, 'fixed flex flex-col rounded-none p-6', inline, className)}
        >
          <div className="flex items-center justify-between gap-4">
            <DialogPrimitive.Title className="text-h3 font-semibold">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <IconButton label={t('close')}>
                <X aria-hidden="true" className="size-5" />
              </IconButton>
            </DialogPrimitive.Close>
          </div>
          <div className="scrollbar-thin mt-4 flex-1 overflow-y-auto">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
})

/* ── Tabs (APG tabs pattern) ────────────────────────────────────────────── */

export function Tabs({ defaultValue, value, onValueChange, className, children }) {
  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cx('flex flex-col', className)}
    >
      {children}
    </TabsPrimitive.Root>
  )
}

export function TabsList({ label, className, children }) {
  return (
    <TabsPrimitive.List
      aria-label={label}
      className={cx(
        'border-neutral-300 scrollbar-none flex gap-1 overflow-x-auto border-b',
        className,
      )}
    >
      {children}
    </TabsPrimitive.List>
  )
}

export function TabsTrigger({ value, className, children }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cx(
        'text-neutral-700 hover:text-neutral-900 -mb-px shrink-0 border-b-2 border-transparent',
        'px-4 py-3 text-body font-medium transition-colors duration-200',
        'data-[state=active]:border-primary-700 data-[state=active]:text-primary-700',
        'whitespace-nowrap',
        className,
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
}

export const TabsContent = TabsPrimitive.Content

/* ── Accordion ─────────────────────────────────────────────────────────── */

export function Accordion({ type = 'single', collapsible = true, className, children }) {
  return (
    <AccordionPrimitive.Root
      type={type}
      collapsible={collapsible}
      className={cx('divide-neutral-300 divide-y', className)}
    >
      {children}
    </AccordionPrimitive.Root>
  )
}

export function AccordionItem({ value, children }) {
  return (
    <AccordionPrimitive.Item value={value} className="py-1">
      {children}
    </AccordionPrimitive.Item>
  )
}

export function AccordionTrigger({ className, children }) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        className={cx(
          'group text-neutral-900 flex w-full items-center justify-between gap-4 py-4 text-start text-body font-medium',
          'transition-colors duration-200 hover:text-primary-700',
          className,
        )}
      >
        {children}
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

const AccordionContent = forwardRef(function AccordionContent({ className, children }, ref) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="data-[state=closed]:animate-none overflow-hidden"
    >
      <div className={cx('text-neutral-700 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
})

/* ── Tooltip (non-essential info only, per §5.2) ────────────────────────── */

export function TooltipProvider({ children }) {
  return <TooltipPrimitive.Provider delayDuration={300}>{children}</TooltipPrimitive.Provider>
}

export function Tooltip({ content, children }) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className="bg-neutral-900 text-neutral-50 z-50 max-w-64 rounded-input px-3 py-2 text-small shadow-3"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

/* ── Popover ───────────────────────────────────────────────────────────── */

export function Popover({ trigger, children, align = 'start', className, ...props }) {
  return (
    <PopoverPrimitive.Root {...props}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          sideOffset={6}
          className={cx(OVERLAY, 'p-4', className)}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

/* ── Dropdown menu ─────────────────────────────────────────────────────── */

export function DropdownMenu({ trigger, children, align = 'end', ...props }) {
  return (
    <DropdownMenuPrimitive.Root {...props}>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={6}
          className={cx(OVERLAY, 'p-1')
          }
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

const MENU_ITEM =
  'flex w-full cursor-pointer items-center gap-2 rounded-input px-3 py-2 text-start text-body ' +
  'text-neutral-900 select-none outline-none transition-colors duration-150 ' +
  'data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-700 ' +
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'

export function DropdownMenuItem({ className, ...props }) {
  return <DropdownMenuPrimitive.Item className={cx(MENU_ITEM, className)} {...props} />
}

export function DropdownMenuLabel({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.Label
      className={cx('text-neutral-700 px-3 py-1.5 text-small font-semibold', className)}
      {...props}
    />
  )
}

export function DropdownMenuSeparator() {
  return <DropdownMenuPrimitive.Separator className="bg-neutral-300 my-1 h-px" />
}

export { AccordionContent }