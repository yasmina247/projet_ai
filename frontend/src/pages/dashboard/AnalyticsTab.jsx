import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ShoppingBag, TrendingUp, WalletCards } from 'lucide-react'
import { ChartCard, PageHeader, StatCard } from '../../components/shared/CommonUI'
import { chartData } from '../../data/mockData'

export function AnalyticsTab() {
  const categoryData = [
    { n: 'Mode', v: 76 },
    { n: 'Accessoires', v: 54 },
    { n: 'Maison', v: 32 },
    { n: 'Chaussures', v: 26 },
  ]

  return (
    <>
      <PageHeader
        title="Ventes & analytics"
        copy="Comprenez la performance réelle de votre boutique."
        action={
          <select className="h-10 rounded-lg border border-input bg-card px-3 text-xs">
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
          </select>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Revenu total" value="48 295 DH" delta="+12,4%" icon={WalletCards} />
        <StatCard label="Ventes" value="284" delta="+8,2%" icon={TrendingUp} />
        <StatCard label="Panier moyen" value="170 DH" delta="+4,8%" icon={ShoppingBag} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Ventes par jour">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} stroke="#e7eaf1" />
            <XAxis dataKey="n" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Bar dataKey="s" fill="#36b98a" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Performance des catégories">
          <BarChart layout="vertical" data={categoryData}>
            <CartesianGrid horizontal={false} stroke="#e7eaf1" />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="n" axisLine={false} tickLine={false} width={80} />
            <Bar dataKey="v" fill="#5b72e8" radius={[0, 5, 5, 0]} />
          </BarChart>
        </ChartCard>
      </div>
    </>
  )
}