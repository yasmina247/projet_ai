import { toast } from 'sonner'
import { AlertTriangle, Boxes, Clock3, Package, WalletCards } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge, PageHeader, StatCard } from '../../components/shared/CommonUI'
import { productsData } from '../../data/mockData'

export function InventoryTab() {
  return (
    <>
      <PageHeader
        title="Inventaire"
        copy="Surveillez vos niveaux de stock et évitez les ruptures."
        action={
          <Button onClick={() => toast.success('Mouvement de stock enregistré en démo')}>
            <Clock3 className="size-4" /> Mouvement de stock
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Valeur du stock" value="186 420 DH" delta="+6,2%" icon={WalletCards} />
        <StatCard label="Produits en stock" value="86" delta="+4" icon={Boxes} />
        <StatCard label="Stock faible" value="7" delta="À surveiller" icon={AlertTriangle} />
        <StatCard label="En rupture" value="3" delta="-2 cette semaine" icon={Package} />
      </div>
      <Card className="mt-5 border-border">
        <CardHeader>
          <CardTitle className="text-base">Niveaux de stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {productsData.map((p) => (
            <div key={p.sku} className="grid gap-2 sm:grid-cols-[1.3fr_.6fr_.6fr_1.3fr_.5fr] sm:items-center">
              <div className="flex items-center gap-3">
                <img src={p.img} alt="" className="size-9 rounded-lg object-cover" />
                <b className="text-sm">{p.n}</b>
              </div>
              <span className="text-xs text-muted-foreground">
                Actuel <b className="text-foreground">{p.stock}</b>
              </span>
              <span className="text-xs text-muted-foreground">
                Seuil <b className="text-foreground">12</b>
              </span>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${p.stock === 0 ? 'bg-red-500' : p.stock < 12 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, p.stock * 1.5)}%` }}
                />
              </div>
              <Badge tone={p.stock === 0 ? 'red' : p.stock < 12 ? 'amber' : 'green'}>
                {p.stock === 0 ? 'Rupture' : p.stock < 12 ? 'Faible' : 'Sain'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}