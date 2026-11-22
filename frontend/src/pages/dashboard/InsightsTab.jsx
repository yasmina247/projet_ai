import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { BrainCircuit, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge, PageHeader } from '../../components/shared/CommonUI'
import { chartData } from '../../data/mockData'

export function InsightsTab() {
  const forecastData = [...chartData, { n: 'J+14', r: 8200 }, { n: 'J+21', r: 8900 }, { n: 'J+30', r: 9700 }]

  return (
    <>
      <PageHeader
        title="Insights IA"
        copy="Des signaux prédictifs simulés pour vous aider à agir avant le marché."
        action={
          <Badge>
            <Sparkles className="mr-1 size-3" /> Données de démonstration
          </Badge>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Card className="border-0 bg-foreground text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-base">
              <BrainCircuit className="mr-2 inline size-5 text-primary" />
              Prévision des ventes · 30 jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer>
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="pred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#36b98a" stopOpacity=".25" />
                      <stop offset="1" stopColor="#36b98a" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,.1)" />
                  <XAxis dataKey="n" tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Area dataKey="r" type="monotone" stroke="#36b98a" strokeWidth="3" fill="url(#pred)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-primary-foreground/10 p-3">
                <p className="text-[10px] text-primary-foreground/50">Revenu prédit · 7 jours</p>
                <p className="mt-1 text-xl font-bold">56 840 DH</p>
                <span className="text-[11px] text-emerald-300">+17,7%</span>
              </div>
              <div className="rounded-xl bg-primary-foreground/10 p-3">
                <p className="text-[10px] text-primary-foreground/50">Revenu prédit · 30 jours</p>
                <p className="mt-1 text-xl font-bold">211 300 DH</p>
                <span className="text-[11px] text-emerald-300">+18,6%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Recommandations prioritaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ['Restocker', 'Le sac Noura risque la rupture sous 4 jours.', 'red'],
              ['Opportunité', 'Les robes satinées progressent de 22%.', 'green'],
              ['Promotion', 'La catégorie Maison ralentit depuis 10 jours.', 'amber'],
            ].map(([a, b, t]) => (
              <div key={a} className="flex gap-3 rounded-xl bg-muted/50 p-3">
                <Sparkles
                  className={`mt-1 size-4 ${
                    t === 'red' ? 'text-red-500' : t === 'green' ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                />
                <div>
                  <b className="text-xs">{a}</b>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{b}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5 border-border">
        <CardHeader>
          <CardTitle className="text-base">Risque de rupture prédit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ['Sac bandoulière Noura', '8', '24', 'Élevé', '+24 unités'],
            ['Robe satinée Aïcha', '42', '54', 'Moyen', '+18 unités'],
            ['Bougie Ambre Atlas', '0', '16', 'Élevé', '+30 unités'],
          ].map((x) => (
            <div key={x[0]} className="grid gap-2 rounded-xl bg-muted/40 p-3 text-xs sm:grid-cols-[1.4fr_.5fr_.7fr_.7fr_1fr]">
              <b>{x[0]}</b>
              <span>Stock {x[1]}</span>
              <span>Demande {x[2]}</span>
              <Badge tone={x[3] === 'Élevé' ? 'red' : 'amber'}>{x[3]}</Badge>
              <strong className="text-primary">{x[4]}</strong>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}