import { useEffect, useState } from 'react'
import { Boxes, Clock3, Package, RefreshCw, Wallet } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge, PageHeader, StatCard } from '../../components/shared/CommonUI'
import { useInventoryProducts, useSettings } from '../../lib/queries'
import { formatMoney } from '../../lib/format'

const FILTERS = [
  ['all', 'Tous'],
  ['Rupture', 'Rupture'],
  ['Critique', 'Critique'],
  ['OK', 'OK'],
]
const TONE = { Rupture: 'red', Critique: 'amber', OK: 'green' }

export function InventoryTab() {
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  // On attend 350 ms après la dernière frappe avant d'interroger l'API
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, isError, error, refetch, isFetching } = useInventoryProducts({ search: debounced, status, page })
  const { data: settings } = useSettings()

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Chargement du stock…</p>
  if (isError) return <p className="p-6 text-sm text-red-500">Impossible de charger l’inventaire : {error.message}</p>

  const pages = Math.max(1, Math.ceil(data.total_filtered / data.page_size))
  const fmt = (n) => n.toLocaleString('fr-FR')

  return (
    <>
      <PageHeader
        title="Inventaire"
        copy="Stock réel de tous les produits, avec jours de couverture et risque de rupture prédit."
        action={
          <Button onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className="size-4" /> Actualiser
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Références en stock" value={fmt(data.counts.total)} delta="" icon={Boxes} />
        <StatCard label="Valeur du stock" value={formatMoney(data.stock_value, settings?.currency ?? 'EUR')} delta="" icon={Wallet} />
        <StatCard label="Stock critique" value={fmt(data.counts.critique)} delta="Sous le seuil d’alerte" icon={Clock3} />
        <StatCard label="En rupture" value={fmt(data.counts.rupture)} delta="" icon={Package} />
      </div>

      <Card className="mt-5 border-border">
        <CardHeader className="gap-3">
          <CardTitle className="text-base">Produits</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              className="max-w-xs"
              placeholder="Rechercher un produit…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {FILTERS.map(([value, label]) => (
              <Button
                key={value}
                size="sm"
                variant={status === value ? 'default' : 'outline'}
                onClick={() => {
                  setStatus(value)
                  setPage(1)
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.items.length === 0 && <p className="text-sm text-muted-foreground">Aucun produit ne correspond.</p>}
          {data.items.map((p) => (
            <div key={p.product_id} className="grid gap-2 rounded-xl bg-muted/40 p-3 text-xs sm:grid-cols-[1.8fr_.5fr_.6fr_.7fr_.9fr_.6fr] sm:items-center">
              <div>
                <b className="text-sm">{p.product_name}</b>
                <span className="block text-muted-foreground">{p.category ?? '—'}</span>
              </div>
              <span>
                Stock <b>{p.stock_actuel}</b>
              </span>
              <span>{p.ventes_30j} ventes/30 j</span>
              <span>{p.jours_de_couverture == null ? 'Pas de vente récente' : `${p.jours_de_couverture} j de couverture`}</span>
              <span>{p.probabilite_rupture == null ? '—' : `Risque ${Math.round(p.probabilite_rupture * 100)}%`}</span>
              <Badge tone={TONE[p.statut]}>{p.statut}</Badge>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span>
              {fmt(data.total_filtered)} produits · page {page} / {pages}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Précédent
              </Button>
              <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}