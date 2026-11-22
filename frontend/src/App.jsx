import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TooltipProvider } from './components/ui/tooltip'
import { Toaster } from './components/ui/sonner'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { DashboardLayout } from './pages/dashboard/DashboardLayout'

const queryClient = new QueryClient()

export default function App() {
  const [screen, setScreen] = useState('landing')

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <Toaster />
        {screen === 'landing' && <LandingPage onNavigateAuth={() => setScreen('auth')} />}
        {screen === 'auth' && (
          <AuthPage
            onSuccess={() => setScreen('dashboard')}
            onBack={() => setScreen('landing')}
          />
        )}
        {screen === 'dashboard' && (
          <DashboardLayout
            onLogout={() => {
              setScreen('auth')
              toast('Vous êtes déconnectée.')
            }}
          />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  )
}