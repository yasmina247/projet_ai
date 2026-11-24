// import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
// import { ShoppingBag, TrendingUp, WalletCards } from 'lucide-react'
// import { ChartCard, PageHeader, StatCard } from '../../components/shared/CommonUI'
// import { chartData } from '../../data/mockData'

// export function AnalyticsTab() {
//   const categoryData = [
//     { n: 'Mode', v: 76 },
//     { n: 'Accessoires', v: 54 },
//     { n: 'Maison', v: 32 },
//     { n: 'Chaussures', v: 26 },
//   ]

//   return (
//     <>
//       <PageHeader
//         title="Ventes & analytics"
//         copy="Comprenez la performance réelle de votre boutique."
//         action={
//           <select className="h-10 rounded-lg border border-input bg-card px-3 text-xs">
//             <option>7 derniers jours</option>
//             <option>30 derniers jours</option>
//           </select>
//         }
//       />
//       <div className="grid gap-4 sm:grid-cols-3">
//         <StatCard label="Revenu total" value="48 295 DH" delta="+12,4%" icon={WalletCards} />
//         <StatCard label="Ventes" value="284" delta="+8,2%" icon={TrendingUp} />
//         <StatCard label="Panier moyen" value="170 DH" delta="+4,8%" icon={ShoppingBag} />
//       </div>
//       <div className="mt-5 grid gap-5 lg:grid-cols-2">
//         <ChartCard title="Ventes par jour">
//           <BarChart data={chartData}>
//             <CartesianGrid vertical={false} stroke="#e7eaf1" />
//             <XAxis dataKey="n" axisLine={false} tickLine={false} />
//             <YAxis axisLine={false} tickLine={false} />
//             <Bar dataKey="s" fill="#36b98a" radius={[5, 5, 0, 0]} />
//           </BarChart>
//         </ChartCard>
//         <ChartCard title="Performance des catégories">
//           <BarChart layout="vertical" data={categoryData}>
//             <CartesianGrid horizontal={false} stroke="#e7eaf1" />
//             <XAxis type="number" hide />
//             <YAxis type="category" dataKey="n" axisLine={false} tickLine={false} width={80} />
//             <Bar dataKey="v" fill="#5b72e8" radius={[0, 5, 5, 0]} />
//           </BarChart>
//         </ChartCard>
//       </div>
//     </>
//   )
// }
import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { ShoppingBag, TrendingUp, WalletCards } from 'lucide-react'
import { ChartCard, PageHeader, StatCard } from '../../components/shared/CommonUI'
import { useForecast, useOverview } from '../../lib/queries'
import { formatDelta, formatMoney, shortDate } from '../../lib/format'

const ICONS = { revenue: WalletCards, orders: TrendingUp, avg_basket: ShoppingBag }

export function AnalyticsTab() {
  const [days, setDays] = useState(7)
  const ov = useOverview(days)
  const fc = useForecast(14)

  if (ov.isLoading) return <p className="p-6 text-sm text-muted-foreground">Chargement…</p>
  if (ov.isError) return <p className="p-6 text-sm text-red-500">Impossible de charger les données : {ov.error.message}</p>

  const data = ov.data
  const money = (v) => formatMoney(v, data.currency)
  const kpis = data.kpis.filter((k) => ICONS[k.key])
  const fmtKpi = (k) => (k.key === 'orders' ? Math.round(k.value).toLocaleString('fr-FR') : money(k.value))

  const daily = data.daily_revenue.map((d) => ({ n: shortDate(d.date), r: d.revenue }))
  const categories = data.top_categories.map((c) => ({ n: c.category, v: c.share_pct }))
  const history = daily
  const future = (fc.data?.forecast ?? []).map((p) => ({ n: shortDate(p.date), p: p.predicted_revenue }))
  const series = [...history, ...future]

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
      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <StatCard
            key={k.key}
            label={k.key === 'orders' ? 'Ventes (commandes)' : k.label}
            value={fmtKpi(k)}
            delta={formatDelta(k.change_pct)}
            icon={ICONS[k.key]}
          />
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Revenu par jour">
          <BarChart data={daily}>
            <CartesianGrid vertical={false} stroke="#e7eaf1" />
            <XAxis dataKey="n" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => money(v)} />
            <Bar dataKey="r" fill="#36b98a" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Part du chiffre d’affaires par catégorie (%)">
          <BarChart layout="vertical" data={categories}>
            <CartesianGrid horizontal={false} stroke="#e7eaf1" />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="n" axisLine={false} tickLine={false} width={90} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="v" fill="#5b72e8" radius={[0, 5, 5, 0]} />
          </BarChart>
        </ChartCard>
        <div className="lg:col-span-2">
          <ChartCard title={`Historique et prévision (${fc.data ? fc.data.horizon + ' jours · ' + (fc.data.model_name ?? 'Ridge') : 'chargement…'})`}>
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
    </>
  )
}