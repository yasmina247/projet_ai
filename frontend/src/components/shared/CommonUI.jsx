import { Search, Filter, Zap } from 'lucide-react'
import { ResponsiveContainer } from 'recharts'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '@/lib/auth'

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
        <Zap className="size-4 fill-current" />
      </span>
      <span className="text-[17px] font-bold tracking-tight">
        SmartSales <span className="text-primary">AI</span>
      </span>
    </div>
  )
}

export function Badge({ children, tone = 'blue' }) {
  const styles =
    tone === 'green'
      ? 'bg-emerald-50 text-emerald-700'
      : tone === 'amber'
      ? 'bg-amber-50 text-amber-700'
      : tone === 'red'
      ? 'bg-red-50 text-red-700'
      : tone === 'slate'
      ? 'bg-slate-100 text-slate-600'
      : 'bg-blue-50 text-blue-700'

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-bold ${styles}`}>
      {children}
    </span>
  )
}

export function SectionTitle({ eyebrow, title, copy }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</span>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-muted-foreground">{copy}</p>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold">{label}</span>
      {children}
    </label>
  )
}

export function PageHeader({ title, copy, action }) {
  const { user } = useAuth()
  const shopName = user?.shop_name || 'Ma boutique'
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">{shopName}</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
      </div>
      {action}
    </div>
  )
}

export function StatCard({ label, value, delta, icon: Icon }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
            <Icon className="size-5" />
          </span>
          <span className="text-[11px] font-bold text-emerald-600">{delta}</span>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

export function Toolbar({ q, set, button }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => set(e.target.value)}
          placeholder="Rechercher..."
          className="h-10 bg-card pl-9"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="bg-card">
          <Filter className="size-4" /> Filtrer
        </Button>
        {button}
      </div>
    </div>
  )
}

export function ChartCard({ title, children }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer>{children}</ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}