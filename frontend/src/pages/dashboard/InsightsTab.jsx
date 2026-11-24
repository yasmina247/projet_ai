// import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
// import { BrainCircuit, Sparkles } from 'lucide-react'
// import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
// import { Badge, PageHeader } from '../../components/shared/CommonUI'
// import { chartData } from '../../data/mockData'

// export function InsightsTab() {
//   const forecastData = [...chartData, { n: 'J+14', r: 8200 }, { n: 'J+21', r: 8900 }, { n: 'J+30', r: 9700 }]

//   return (
//     <>
//       <PageHeader
//         title="Insights IA"
//         copy="Des signaux prédictifs simulés pour vous aider à agir avant le marché."
//         action={
//           <Badge>
//             <Sparkles className="mr-1 size-3" /> Données de démonstration
//           </Badge>
//         }
//       />
//       <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
//         <Card className="border-0 bg-foreground text-primary-foreground">
//           <CardHeader>
//             <CardTitle className="text-base">
//               <BrainCircuit className="mr-2 inline size-5 text-primary" />
//               Prévision des ventes · 30 jours
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-60">
//               <ResponsiveContainer>
//                 <AreaChart data={forecastData}>
//                   <defs>
//                     <linearGradient id="pred" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="0" stopColor="#36b98a" stopOpacity=".25" />
//                       <stop offset="1" stopColor="#36b98a" stopOpacity="0" />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid vertical={false} stroke="rgba(255,255,255,.1)" />
//                   <XAxis dataKey="n" tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
//                   <YAxis hide />
//                   <Area dataKey="r" type="monotone" stroke="#36b98a" strokeWidth="3" fill="url(#pred)" />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div className="rounded-xl bg-primary-foreground/10 p-3">
//                 <p className="text-[10px] text-primary-foreground/50">Revenu prédit · 7 jours</p>
//                 <p className="mt-1 text-xl font-bold">56 840 DH</p>
//                 <span className="text-[11px] text-emerald-300">+17,7%</span>
//               </div>
//               <div className="rounded-xl bg-primary-foreground/10 p-3">
//                 <p className="text-[10px] text-primary-foreground/50">Revenu prédit · 30 jours</p>
//                 <p className="mt-1 text-xl font-bold">211 300 DH</p>
//                 <span className="text-[11px] text-emerald-300">+18,6%</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="border-border">
//           <CardHeader>
//             <CardTitle className="text-base">Recommandations prioritaires</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {[
//               ['Restocker', 'Le sac Noura risque la rupture sous 4 jours.', 'red'],
//               ['Opportunité', 'Les robes satinées progressent de 22%.', 'green'],
//               ['Promotion', 'La catégorie Maison ralentit depuis 10 jours.', 'amber'],
//             ].map(([a, b, t]) => (
//               <div key={a} className="flex gap-3 rounded-xl bg-muted/50 p-3">
//                 <Sparkles
//                   className={`mt-1 size-4 ${
//                     t === 'red' ? 'text-red-500' : t === 'green' ? 'text-emerald-500' : 'text-amber-500'
//                   }`}
//                 />
//                 <div>
//                   <b className="text-xs">{a}</b>
//                   <p className="mt-1 text-xs leading-5 text-muted-foreground">{b}</p>
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       </div>

//       <Card className="mt-5 border-border">
//         <CardHeader>
//           <CardTitle className="text-base">Risque de rupture prédit</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           {[
//             ['Sac bandoulière Noura', '8', '24', 'Élevé', '+24 unités'],
//             ['Robe satinée Aïcha', '42', '54', 'Moyen', '+18 unités'],
//             ['Bougie Ambre Atlas', '0', '16', 'Élevé', '+30 unités'],
//           ].map((x) => (
//             <div key={x[0]} className="grid gap-2 rounded-xl bg-muted/40 p-3 text-xs sm:grid-cols-[1.4fr_.5fr_.7fr_.7fr_1fr]">
//               <b>{x[0]}</b>
//               <span>Stock {x[1]}</span>
//               <span>Demande {x[2]}</span>
//               <Badge tone={x[3] === 'Élevé' ? 'red' : 'amber'}>{x[3]}</Badge>
//               <strong className="text-primary">{x[4]}</strong>
//             </div>
//           ))}
//         </CardContent>
//       </Card>
//     </>
//   )
// }
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BrainCircuit, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge, PageHeader } from '../../components/shared/CommonUI'
import { useForecast, useInventoryAlerts, useOverview, useRecommendations, useSegments } from '../../lib/queries'
import { formatDate, formatDelta, formatMoney, shortDate } from '../../lib/format'

const sum = (arr) => arr.reduce((s, x) => s + x.predicted_revenue, 0)
const pct = (a, b) => (b ? ((a - b) / b) * 100 : null)
const kpi = (ov, key) => ov?.kpis.find((k) => k.key === key)?.value
const TONE_CLASS = { red: 'text-red-500', green: 'text-emerald-500', amber: 'text-amber-500' }

export function InsightsTab() {
  const forecast = useForecast(30)
  const ov7 = useOverview(7)
  const ov30 = useOverview(30)
  const stock = useInventoryAlerts(50)
  const seg = useSegments()
  const alerts = stock.data?.alertes ?? []
  const topAlert = alerts[0]
  const reco = useRecommendations(topAlert?.product_id)

  const currency = ov7.data?.currency ?? 'EUR'
  const money = (v) => formatMoney(v, currency)
  const points = forecast.data?.forecast ?? []
  const ready = points.length > 0
  const pred7 = sum(points.slice(0, 7))
  const pred30 = sum(points)
  const delta7 = ready ? pct(pred7, kpi(ov7.data, 'revenue')) : null
  const delta30 = ready ? pct(pred30, kpi(ov30.data, 'revenue')) : null
  const chartData = points.map((p) => ({ n: shortDate(p.date), r: p.predicted_revenue }))

  const dormant = seg.data?.segments.find((s) => s.segment_name === 'Dormant')
  const priorities = []
  if (topAlert) {
    priorities.push({
      title: 'Restocker',
      tone: 'red',
      text: `${topAlert.product_name} : ${topAlert.stock_actuel} en stock pour ${topAlert.ventes_30j} ventes sur 30 jours (${topAlert.jours_de_couverture} j de couverture).`,
    })
  }
  if (ready) {
    priorities.push({
      title: 'Prévision',
      tone: delta7 >= 0 ? 'green' : 'amber',
      text: `Revenu prévu sur 7 jours : ${money(pred7)} (${formatDelta(delta7)} par rapport aux 7 derniers jours).`,
    })
  }
  if (dormant) {
    priorities.push({
      title: 'Réactiver',
      tone: 'amber',
      text: `${dormant.count.toLocaleString('fr-FR')} clients dormants (${dormant.percentage}%) à relancer.`,
    })
  }

  return (
    <>
      <PageHeader
        title="Insights IA"
        copy="Signaux prédictifs calculés par vos modèles pour agir avant la rupture."
        action={
          ov7.data && (
            <Badge>
              <Sparkles className="mr-1 size-3" /> Données au {formatDate(ov7.data.reference_date)}
            </Badge>
          )
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Card className="border-0 bg-foreground text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-base">
              <BrainCircuit className="mr-2 inline size-5 text-primary" />
              Prévision des ventes · 30 jours {forecast.data?.model_name ? `· ${forecast.data.model_name}` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="pred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#36b98a" stopOpacity=".25" />
                      <stop offset="1" stopColor="#36b98a" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,.1)" />
                  <XAxis dataKey="n" tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v) => money(v)} contentStyle={{ borderRadius: 10 }} />
                  <Area dataKey="r" type="monotone" stroke="#36b98a" strokeWidth={3} fill="url(#pred)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-primary-foreground/10 p-3">
                <p className="text-[10px] text-primary-foreground/50">Revenu prédit · 7 jours</p>
                <p className="mt-1 text-xl font-bold">{ready ? money(pred7) : '…'}</p>
                <span className="text-[11px] text-emerald-300">{ready ? formatDelta(delta7) : ''}</span>
              </div>
              <div className="rounded-xl bg-primary-foreground/10 p-3">
                <p className="text-[10px] text-primary-foreground/50">Revenu prédit · 30 jours</p>
                <p className="mt-1 text-xl font-bold">{ready ? money(pred30) : '…'}</p>
                <span className="text-[11px] text-emerald-300">{ready ? formatDelta(delta30) : ''}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Recommandations prioritaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {priorities.length === 0 && <p className="text-xs text-muted-foreground">Chargement…</p>}
            {priorities.map((p) => (
              <div key={p.title} className="flex gap-3 rounded-xl bg-muted/50 p-3">
                <Sparkles className={`mt-1 size-4 ${TONE_CLASS[p.tone]}`} />
                <div>
                  <b className="text-xs">{p.title}</b>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{p.text}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Risque de rupture prédit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 && <p className="text-xs text-muted-foreground">Aucune alerte.</p>}
            {alerts.slice(0, 5).map((a) => (
              <div key={a.product_id} className="grid gap-2 rounded-xl bg-muted/40 p-3 text-xs sm:grid-cols-[1.4fr_.5fr_.7fr_.7fr]">
                <b>{a.product_name}</b>
                <span>Stock {a.stock_actuel}</span>
                <span>{a.ventes_30j} ventes/30 j</span>
                <Badge tone={a.statut === 'Rupture' ? 'red' : 'amber'}>{Math.round(a.probabilite_rupture * 100)}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Produits similaires suggérés</CardTitle>
            {topAlert && (
              <p className="text-xs text-muted-foreground">À proposer à la place de « {topAlert.product_name} » (modèle TF-IDF).</p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {reco.isLoading && <p className="text-xs text-muted-foreground">Chargement…</p>}
            {reco.data?.recommendations.length === 0 && <p className="text-xs text-muted-foreground">Aucune suggestion pour ce produit.</p>}
            {reco.data?.recommendations.map((r) => (
              <div key={r.product_id} className="grid gap-2 rounded-xl bg-muted/40 p-3 text-xs sm:grid-cols-[1.6fr_.8fr_.6fr]">
                <b>{r.product_name}</b>
                <span className="text-muted-foreground">{r.brand} · {r.category}</span>
                <strong className="text-primary">{money(r.price)}</strong>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}