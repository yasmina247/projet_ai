import { useState } from 'react'
import { MessageCircle, Settings, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge, PageHeader } from '../../components/shared/CommonUI'

function Bubble({ text, mine = false }) {
  return (
    <div
      className={`max-w-[78%] rounded-2xl p-3 text-xs leading-5 shadow-sm ${
        mine ? 'self-end rounded-br-sm bg-primary text-primary-foreground' : 'self-start rounded-bl-sm bg-card'
      }`}
    >
      {text}
    </div>
  )
}

export function WhatsAppTab({ onOpenWhatsAppSettings }) {
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState([])

  const handleSend = () => {
    if (!msg.trim()) return
    setSent([...sent, msg])
    setMsg('')
  }

  return (
    <>
      <PageHeader
        title="Assistant WhatsApp"
        copy="Supervisez les conversations. Les commandes confirmées restent gérées dans Commandes."
        action={
          <Button variant="outline" className="bg-card" onClick={onOpenWhatsAppSettings}>
            <Settings className="size-4" /> Configurer
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[.75fr_1.5fr_.75fr]">
        <Card className="min-h-[570px] border-border">
          <CardHeader>
            <CardTitle className="text-sm">
              Conversations <Badge tone="green">3 actives</Badge>
            </CardTitle>
            <Input className="mt-3 h-9 bg-muted/50 text-xs" placeholder="Rechercher..." />
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {['Salma Benali', 'Nadia El Idrissi', 'Youssef Amrani', 'Imane Tazi'].map((x, i) => (
              <button
                key={x}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ${
                  i === 0 ? 'bg-secondary' : 'hover:bg-muted'
                }`}
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-card text-xs font-bold text-primary">
                  {x.split(' ').map((n) => n[0]).join('')}
                </span>
                <span className="flex-1">
                  <b className="block text-xs">{x}</b>
                  <small className="text-[11px] text-muted-foreground">
                    {i === 0 ? 'Parfait, je voudrais la...' : 'Merci pour votre aide !'}
                  </small>
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="flex min-h-[570px] flex-col border-border">
          <CardHeader className="flex-row items-center gap-3 border-b border-border">
            <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <MessageCircle className="size-4" />
            </span>
            <div>
              <CardTitle className="text-sm">Salma Benali</CardTitle>
              <p className="text-[11px] text-emerald-600">En ligne · Conversation IA</p>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-end gap-4 bg-muted/30 p-5">
            <Bubble text="Bonjour, est-ce que vous avez cette robe en taille M ?" />
            <Bubble text="Bonjour Salma ! Oui, cette robe est disponible en taille M. Son prix est de 690 DH." mine />
            <Bubble text="Parfait, je voudrais la commander." />
            {sent.map((x, idx) => (
              <Bubble key={idx} text={x} mine />
            ))}
            <div className="flex gap-2">
              <Input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Tester une réponse..."
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button size="icon" onClick={handleSend}>
                ↑
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[570px] border-border">
          <CardHeader>
            <CardTitle className="text-sm">Fiche client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-lg font-bold text-primary">
                SB
              </span>
              <p className="mt-3 text-sm font-bold">Salma Benali</p>
              <p className="text-xs text-muted-foreground">Cliente depuis juin 2025</p>
            </div>
            {[
              ['Téléphone', '+212 6 70 42 18 21'],
              ['Segment', 'Occasionnelle'],
              ['Achats cumulés', '820 DH'],
              ['Préférence', 'Robes & accessoires'],
            ].map(([a, b]) => (
              <div key={a}>
                <p className="text-[10px] uppercase text-muted-foreground">{a}</p>
                <p className="mt-1 text-xs font-semibold">{b}</p>
              </div>
            ))}
            <div className="rounded-xl bg-secondary p-3 text-xs leading-5 text-secondary-foreground">
              <Sparkles className="mr-1 inline size-3.5 text-primary" /> Suggérer le sac Noura en complément.
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}