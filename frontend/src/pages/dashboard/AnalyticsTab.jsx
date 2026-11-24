import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { ClipboardList, Package, ShoppingBag, WalletCards } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { ChartCard, PageHeader, StatCard } from '../../components/shared/CommonUI'
import { useForecast, useSales } from '../../lib/queries'
import { formatDelta, formatMoney, shortDate } from '../../lib/format'

const ICONS = { revenue: WalletCards, orders: ClipboardList, units: Package, avg_basket: ShoppingBag }

export function AnalyticsTab() {
  const [days, setDays] = useState(7)
  const sales = useSales(days)
  const fc = useForecast(14)

  if (sales.isLoading) return <p className="p-6 text-sm text-muted-foreground">Chargement…</p>
  if (sales.isError) return <p className="p-6 text-sm text-red-500">Impossible de charger les données : {sales.error.message}</p>

  const data = sales.data
  const money = (v) => formatMoney(v, data.currency)
  const fmtKpi = (k) =>
    k.key === 'revenue' || k.key === 'avg_basket' ? money(k.value) : Math.round(k.value).toLocaleString('fr-FR')

  const daily = data.daily.map((d) => ({ n: shortDate(d.date), r: d.revenue, c: d.orders }))
  const categories = data.categories.map((c) => ({ n: c.category, v: c.share_pct }))
  const future = (fc.data?.forecast ?? []).map((p) => ({ n: shortDate(p.date), p: p.predicted_revenue }))
  const series = [...daily.map(({ n, r }) => ({ n, r })), ...future]

  return (
    <>
      <PageHeader
        title="Ventes & analytics"
        copy="Performance réelle de la boutique et prévision des ventes."
        action={
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-10 rounded-lg border border-input bg-card px-3 text-xs"
          >
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
          </select>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((k) => (
          <StatCard key={k.key} label={k.label} value={fmtKpi(k)} delta={formatDelta(k.change_pct)} icon={ICONS[k.key]} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Revenu par jour">
          <BarChart data={daily}>
            <CartesianGrid vertical={false} stroke="#e7eaf1" />
            <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, name) => (name === 'Commandes' ? v : money(v))} />
            <Bar dataKey="r" name="Revenu" fill="#36b98a" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Part du chiffre d’affaires par catégorie (%)">
          <BarChart layout="vertical" data={categories}>
            <CartesianGrid horizontal={false} stroke="#e7eaf1" />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="n" axisLine={false} tickLine={false} width={110} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="v" name="Part" fill="#5b72e8" radius={[0, 5, 5, 0]} />
          </BarChart>
        </ChartCard>

        <div className="lg:col-span-2">
          <ChartCard
            title={`Historique et prévision (${fc.data ? fc.data.horizon + ' jours · ' + (fc.data.model_name ?? 'Ridge') : 'chargement…'})`}
          >
            <AreaChart data={series}>
              <CartesianGrid vertical={false} stroke="#e7eaf1" />
              <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis hide />
              <Tooltip formatter={(v) => money(v)} />
              <Area dataKey="r" name="Réel" type="monotone" stroke="#5b72e8" strokeWidth={3} fill="#5b72e8" fillOpacity={0.15} />
              <Area dataKey="p" name="Prévision" type="monotone" stroke="#36b98a" strokeWidth={3} strokeDasharray="6 4" fill="#36b98a" fillOpacity={0.15} />
            </AreaChart>
          </ChartCard>
        </div>
      </div>

      <Card className="mt-5 border-border">
        <CardHeader>
          <CardTitle className="text-base">Top 5 des produits</CardTitle>
          <p className="text-xs text-muted-foreground">Classés par chiffre d’affaires sur la période.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.top_products.length === 0 && <p className="text-sm text-muted-foreground">Aucune vente sur cette période.</p>}
          {data.top_products.map((p, i) => (
            <div key={p.product_id} className="grid gap-2 rounded-xl bg-muted/40 p-3 text-xs sm:grid-cols-[.2fr_2fr_.7fr_.8fr] sm:items-center">
              <b className="text-primary">#{i + 1}</b>
              <b className="text-sm">{p.product_name}</b>
              <span>
                {p.units} vendu{p.units > 1 ? 's' : ''}
              </span>
              <strong>{money(p.revenue)}</strong>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}