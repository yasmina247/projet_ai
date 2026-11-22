import { useState } from 'react'
import { toast } from 'sonner'
import { Edit2, Check, Clock3, MoreHorizontal, Trash2, Package, Plus,X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card } from '../../components/ui/card'
import { Badge, PageHeader, StatCard, Toolbar, Field } from '../../components/shared/CommonUI'
import { ordersData } from '../../data/mockData'

export function OrdersTab() {
  const [q, setQ] = useState('')
  const [orders, setOrders] = useState(ordersData)
  const rows = orders.filter((o) =>
    `${o.id} ${o.c}`.toLowerCase().includes(q.toLowerCase())
  )
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const EMPTY_ORDER_FORM = {
    id: '',
    client: '',
    date: '',
    montant: '',
    statut: 'En attente',
  }
  const [orderForm, setOrderForm] = useState(EMPTY_ORDER_FORM)

  const handleSaveOrder = (e) => {
    e.preventDefault()
    if (
      !orderForm.id.trim() ||
      !orderForm.client.trim() ||
      !orderForm.date.trim() ||
      !orderForm.montant
    ) {
      toast.error('Tous les champs sont obligatoires.')
      return
    }

    if (
      !orderForm.id.trim() ||
      !orderForm.client.trim() ||
      !orderForm.date ||
      !orderForm.montant
    ) {
      return toast.error('Veuillez remplir tous les champs.')
    }

    const orderPayload = {
      id: orderForm.id.trim(),
      c: orderForm.client.trim(),
      p: 'Commande manuelle',
      date: orderForm.date,
      total: Number(orderForm.montant),
      status: orderForm.statut,
    }

    if (editingOrderId) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === editingOrderId
            ? orderPayload
            : order
        )
      )
      toast.success('Commande mise à jour.')
    } else {
      if (orders.some((o) => o.id === orderPayload.id)) {
        return toast.error('Cet ID existe déjà.')
      }

      setOrders((prev) => [
        orderPayload,
        ...prev,
      ])

      toast.success('Commande ajoutée.')
    }

    setEditingOrderId(null)
    setIsOrderFormOpen(false)
  }

  const openCreateOrderForm = () => {
    setEditingOrderId(null)
    setOrderForm(EMPTY_ORDER_FORM)
    setIsOrderFormOpen(true)
  }

  const openEditOrderForm = (order) => {
    setOpenMenuId(null)

    setEditingOrderId(order.id)

    setOrderForm({
      id: order.id,
      client: order.c,
      date: order.date,
      montant: String(order.total),
      statut: order.status,
    })

    setIsOrderFormOpen(true)
  }

  const handleDeleteOrder = (id) => {
    setOpenMenuId(null)

    setOrders((prev) =>
      prev.filter((order) => order.id !== id)
    )

    toast.success(`Commande ${id} supprimée`)
  }

  return (
    <>
      <PageHeader
        title="Commandes"
        copy="Le centre de contrôle de toutes vos ventes, y compris WhatsApp."
        action={
          <Button onClick={openCreateOrderForm}>
            <Plus className="size-4" /> Nouvelle commande
          </Button>
        }
      />
      {/* Formulaire complet d'ajout commande */}
      {isOrderFormOpen && (
        <Card className="mb-6 border-primary/30 bg-card p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold">
                {editingOrderId
                  ? `Modifier la commande (${editingOrderId})`
                  : 'Nouvelle commande'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Renseignez les informations de la commande.
              </p>
            </div>

            <button
              onClick={() => setIsOrderFormOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          <form
            onSubmit={handleSaveOrder}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <Field label="ID Commande *">
              <Input
                placeholder="Ex: CMD-001"
                value={orderForm.id}
                onChange={(e) =>
                  setOrderForm({
                    ...orderForm,
                    id: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Client *">
              <Input
                placeholder="Ex: Ahmed Benali"
                value={orderForm.client}
                onChange={(e) =>
                  setOrderForm({
                    ...orderForm,
                    client: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Date *">
              <Input
                type="date"
                value={orderForm.date}
                onChange={(e) =>
                  setOrderForm({
                    ...orderForm,
                    date: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Montant (DH) *">
              <Input
                type="number"
                min="0"
                placeholder="Ex: 850"
                value={orderForm.montant}
                onChange={(e) =>
                  setOrderForm({
                    ...orderForm,
                    montant: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Statut *">
              <select
                value={orderForm.statut}
                onChange={(e) =>
                  setOrderForm({
                    ...orderForm,
                    statut: e.target.value,
                  })
                }
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="En attente">En attente</option>
                <option value="Confirmée">Confirmée</option>
                <option value="Expédiée">Expédiée</option>
                <option value="Livrée">Livrée</option>
                <option value="Annulée">Annulée</option>
              </select>
            </Field>

            <div className="flex justify-end gap-2 pt-2 sm:col-span-2 lg:col-span-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOrderFormOpen(false)}
              >
                Annuler
              </Button>

              <Button type="submit">
                {editingOrderId
                  ? 'Enregistrer les modifications'
                  : 'Ajouter la commande'}
              </Button>
            </div>
          </form>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="À traiter" value="18" delta="Aujourd’hui" icon={Clock3} />
        <StatCard label="En livraison" value="32" delta="+6 cette semaine" icon={Package} />
        <StatCard label="Livrées ce mois" value="234" delta="+14,2%" icon={Check} />
      </div>
      <div className="mt-5">
        <Toolbar q={q} set={setQ} />
        <Card className="overflow-hidden border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-muted/50 text-[10px] uppercase text-muted-foreground">
                <tr>
                  {['Commande', 'Client', 'Date', 'Montant', 'Statut', 'Actions'].map((x) => (
                    <th key={x} className="px-5 py-4">{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="px-5 py-4 font-bold">
                      {o.id}
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        {o.p}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {o.c}
                    </td>

                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {o.date}
                    </td>

                    <td className="px-5 py-4 font-bold">
                      {o.total} DH
                    </td>

                    <td className="px-5 py-4">
                      <Badge
                        tone={
                          o.status === 'Livrée'
                            ? 'green'
                            : o.status === 'En attente'
                            ? 'amber'
                            : 'blue'
                        }
                      >
                        {o.status}
                      </Badge>
                    </td>

                    <td className="relative px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === o.id
                              ? null
                              : o.id
                          )
                        }
                        className="rounded-lg p-1.5 hover:bg-muted"
                      >
                        <MoreHorizontal className="size-4 text-muted-foreground" />
                      </button>

                      {openMenuId === o.id && (
                        <div className="absolute right-4 top-12 z-30 w-36 rounded-xl border border-border bg-card p-1.5 shadow-lg">

                          <button
                            type="button"
                            onClick={() => openEditOrderForm(o)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium hover:bg-muted"
                          >
                            <Edit2 className="size-3.5 text-primary" />
                            Modifier
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(o.id)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="size-3.5" />
                            Supprimer
                          </button>

                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}