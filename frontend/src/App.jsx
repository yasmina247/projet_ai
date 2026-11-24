import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TooltipProvider } from './components/ui/tooltip'
import { Toaster } from './components/ui/sonner'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { DashboardLayout } from './pages/dashboard/DashboardLayout'
import { useAuth } from './lib/auth'

const queryClient = new QueryClient()

const hasEmailLink = () => {
  const p = new URLSearchParams(window.location.search)
  return p.has('verify') || p.has('reset')
}

export default function App() {
  const { user, loading } = useAuth()
  const [screen, setScreen] = useState(() => (hasEmailLink() ? 'auth' : 'landing'))

  let content = null
  if (loading) content = null
  else if (user) {
    content = (
      <DashboardLayout
        onLogout={() => {
          queryClient.clear()
          setScreen('auth')
          toast('Vous êtes déconnecté(e).')
        }}
      />
    )
  } else if (screen === 'auth') {
    content = <AuthPage onBack={() => setScreen('landing')} />
  } else {
    content = <LandingPage onNavigateAuth={() => setScreen('auth')} />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <Toaster />
        {content}
      </TooltipProvider>
    </QueryClientProvider>
  )
}