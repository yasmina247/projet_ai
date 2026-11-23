import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, ClipboardList, ShoppingBag, Sparkles, Users, WalletCards } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge, PageHeader, StatCard } from '../../components/shared/CommonUI'
import { chartData, ordersData } from '../../data/mockData'
import { useAuth } from '@/lib/auth'


export function OverviewTab({ onSelectModule }) {
  const { user } = useAuth()
  const firstName = user?.full_name?.split(' ')[0] ?? ''
  return (
    <>
      <PageHeader
        title={`Bonjour ${firstName} 👋`}
        copy={user?.shop_name || "Voici ce qui se passe dans votre boutique aujourd’hui."}
        action={
          <select className="h-10 rounded-lg border border-input bg-card px-3 text-xs font-semibold">
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
          </select>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Chiffre d’affaires" value="48 295 DH" delta="+12,4%" icon={WalletCards} />
        <StatCard label="Commandes" value="284" delta="+8,2%" icon={ClipboardList} />
        <StatCard label="Panier moyen" value="170 DH" delta="+4,8%" icon={ShoppingBag} />
        <StatCard label="Clients actifs" value="1 248" delta="+16,7%" icon={Users} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_.8fr]">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">Évolution du revenu</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Comparaison avec la période précédente</p>
            </div>
            <Badge tone="green">+12,4%</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#5b72e8" stopOpacity=".25" />
                      <stop offset="1" stopColor="#5b72e8" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e7eaf1" />
                  <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e7eaf1' }} />
                  <Area type="monotone" dataKey="r" stroke="#5b72e8" strokeWidth="3" fill="url(#area)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Catégories performantes</CardTitle>
            <p className="text-xs text-muted-foreground">Part du chiffre d’affaires</p>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={[{ v: 48 }, { v: 27 }, { v: 15 }, { v: 10 }]} dataKey="v" innerRadius={45} outerRadius={65}>
                    <Cell fill="#5b72e8" />
                    <Cell fill="#36b98a" />
                    <Cell fill="#f2bd46" />
                    <Cell fill="#9da8c8" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['Mode 48%', 'Accessoires 27%', 'Maison 15%', 'Chaussures 10%'].map((x, i) => (
                <span key={x} className="text-muted-foreground">
                  <i className={`mr-1 inline-block size-2 rounded-full ${['bg-primary', 'bg-emerald-400', 'bg-amber-400', 'bg-slate-400'][i]}`} />
                  {x}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex-row justify-between">
            <CardTitle className="text-base">Commandes récentes</CardTitle>
            <button onClick={() => onSelectModule('orders')} className="text-xs font-bold text-primary">
              Voir tout <ArrowRight className="inline size-3" />
            </button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="border-b border-border text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="pb-3">Commande</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Montant</th>
                  <th className="pb-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ordersData.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 font-bold">
                      {o.id}
                      <span className="mt-1 block font-normal text-muted-foreground">{o.date}</span>
                    </td>
                    <td className="py-3">{o.c}</td>
                    <td className="py-3 font-bold">{o.total} DH</td>
                    <td className="py-3">
                      <Badge tone={o.status === 'Livrée' ? 'green' : o.status === 'En attente' ? 'amber' : 'blue'}>
                        {o.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-0 bg-foreground text-primary-foreground">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <CardTitle className="text-base">Le signal IA du jour</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-primary-foreground/80">
              La demande pour les <b className="text-primary-foreground">robes en satin</b> devrait augmenter de 22% la semaine prochaine.
            </p>
            <button onClick={() => onSelectModule('insights')} className="mt-5 text-xs font-bold text-primary">
              Explorer les insights <ArrowRight className="inline size-3" />
            </button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}