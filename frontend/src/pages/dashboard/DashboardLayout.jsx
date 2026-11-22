import { useState } from 'react'
import {
  BarChart3,
  Bell,
  Boxes,
  BrainCircuit,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { Logo } from '../../components/shared/CommonUI'
import { OverviewTab } from './OverviewTab'
import { ProductsTab } from './ProductsTab'
import { InventoryTab } from './InventoryTab'
import { OrdersTab } from './OrdersTab'
import { CustomersTab } from './CustomersTab'
import { WhatsAppTab } from './WhatsAppTab'
import { AnalyticsTab } from './AnalyticsTab'
import { InsightsTab } from './InsightsTab'
import { SettingsTab } from './SettingsTab'

const navItems = [
  { id: 'overview', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { id: 'products', label: 'Produits', icon: Package },
  { id: 'inventory', label: 'Inventaire', icon: Boxes },
  { id: 'orders', label: 'Commandes', icon: ClipboardList },
  { id: 'customers', label: 'Clients', icon: Users },
  { id: 'whatsapp', label: 'Assistant WhatsApp', icon: MessageCircle },
  { id: 'analytics', label: 'Ventes & analytics', icon: BarChart3 },
  { id: 'insights', label: 'Insights IA', icon: BrainCircuit },
  { id: 'settings', label: 'Paramètres', icon: Settings },
]

function NavButton({ item, active, onClick }) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${
        active ? 'bg-secondary font-bold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <Icon className="size-[17px]" />
      {item.label}
      {item.id === 'insights' && (
        <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[9px] text-primary-foreground">IA</span>
      )}
    </button>
  )
}

export function DashboardLayout({ onLogout }) {
  const [mod, setMod] = useState('overview')
  const [settingsSection, setSettingsSection] = useState('merchant')
  const [open, setOpen] = useState(false)
  const openWhatsAppConfig = () => {
    setSettingsSection('whatsapp')
    setMod('settings')
  }
  const current = navItems.find((x) => x.id === mod) || navItems[0]

  return (
    <div className="flex min-h-dvh">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-border px-5">
          <Logo />
          <button onClick={() => setOpen(false)} className="md:hidden">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">
            Espace marchand
          </p>
          {navItems.slice(0, 6).map((n) => (
            <NavButton
              key={n.id}
              item={n}
              active={mod === n.id}
              onClick={() => {
                setMod(n.id)
                setOpen(false)
              }}
            />
          ))}

          <p className="px-3 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">
            Pilotage
          </p>
          {navItems.slice(6).map((n) => (
            <NavButton
              key={n.id}
              item={n}
              active={mod === n.id}
              onClick={() => {
                setMod(n.id)
                setOpen(false)
              }}
            />
          ))}
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
              NE
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">Nadia El Idrissi</p>
              <p className="truncate text-[10px] text-muted-foreground">Atelier Noura</p>
            </div>
            <button onClick={onLogout} title="Se déconnecter">
              <LogOut className="size-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </aside>

      {open && <button onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-foreground/20 md:hidden" />}

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-lg p-2 md:hidden">
              <Menu className="size-5" />
            </button>
            <span className="text-sm font-semibold">
              Atelier Noura <ChevronRight className="mx-1 inline size-3 text-muted-foreground" /> {current.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-muted-foreground">
              <Bell className="size-4" />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-red-500" />
            </button>
            <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
              NE
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {mod === 'overview' && <OverviewTab onSelectModule={setMod} />}
          {mod === 'products' && <ProductsTab />}
          {mod === 'inventory' && <InventoryTab />}
          {mod === 'orders' && <OrdersTab />}
          {mod === 'customers' && <CustomersTab />}
          {mod === 'whatsapp' && <WhatsAppTab onOpenWhatsAppSettings={openWhatsAppConfig} />}
          {mod === 'analytics' && <AnalyticsTab />}
          {mod === 'insights' && <InsightsTab />}
          {mod === 'settings' && <SettingsTab initialSection={settingsSection} />}
        </div>
      </main>
    </div>
  )
}