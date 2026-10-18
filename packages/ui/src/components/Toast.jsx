import * as ToastPrimitive from '@radix-ui/react-toast'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../lib/cx.js'

const ToastContext = createContext(null)

const TONE = {
  info: { Icon: Info, className: 'text-info-600' },
  success: { Icon: CircleCheck, className: 'text-success-600' },
  danger: { Icon: CircleAlert, className: 'text-danger-600' },
}

/**
 * Toast host + imperative API. Mount once, near the app root:
 *   const toast = useToast(); toast.success('Saved')
 * Messages are short and non-critical by design (§5.2: tooltips and toasts
 * carry supplementary information, never the only copy of an error).
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (tone, message, options = {}) => {
      counter.current += 1
      const id = counter.current
      setToasts((current) => [...current, { id, tone, message, ...options }])
      return id
    },
    [],
  )

  const value = useMemo(
    () => ({
      info: (message, options) => push('info', message, options),
      success: (message, options) => push('success', message, options),
      danger: (message, options) => push('danger', message, options),
      dismiss,
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="end" duration={6000}>
        {children}

        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            open
            onOpenChange={(open) => !open && dismiss(toast.id)}
            className="bg-surface border-neutral-300 flex items-start gap-3 rounded-input border p-4 shadow-3"
          >
            {(() => {
              const { Icon, className: toneClass } = TONE[toast.tone] ?? TONE.info
              return <Icon aria-hidden="true" className={cx('mt-0.5 size-5 shrink-0', toneClass)} />
            })()}

            <ToastPrimitive.Description className="text-neutral-900 flex-1 text-body">
              {toast.message}
            </ToastPrimitive.Description>

            <ToastPrimitive.Close
              aria-label={toast.dismissLabel}
              className="text-neutral-700 hover:text-neutral-900"
            >
              <X aria-hidden="true" className="size-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}

        <ToastPrimitive.Viewport className="fixed bottom-4 end-4 z-50 flex w-full max-w-sm flex-col gap-2 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}

/** Convenience wrapper that injects the translated default dismiss label. */
export function useLocalizedToast() {
  const toast = useToast()
  const { t } = useTranslation('ui')

  return useMemo(
    () => ({
      info: (message, options) => toast.info(message, { dismissLabel: t('dismiss'), ...options }),
      success: (message, options) =>
        toast.success(message, { dismissLabel: t('dismiss'), ...options }),
      danger: (message, options) => toast.danger(message, { dismissLabel: t('dismiss'), ...options }),
      dismiss: toast.dismiss,
    }),
    [toast, t],
  )
}