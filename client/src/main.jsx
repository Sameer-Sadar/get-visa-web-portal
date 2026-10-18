import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider, TooltipProvider } from '@visagate/ui'
import { applyDocumentLocale, createI18n } from '@visagate/i18n'
import App from './App.jsx'
import { ErrorBoundary } from './app/ErrorBoundary.jsx'
import { initTheme } from './app/theme.js'
import './index.css'

/**
 * Seed the locale from the URL before first paint so `<html lang>`/`dir` are
 * correct for the very first screen reader announcement, not just after the
 * router mounts (§11.1).
 */
const initialLocale = window.location.pathname.split('/').filter(Boolean)[0]
applyDocumentLocale(initialLocale)
createI18n(initialLocale)
initTheme()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)