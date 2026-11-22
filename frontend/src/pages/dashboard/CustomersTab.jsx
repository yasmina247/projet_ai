import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, TrendingUp, Users, MoreHorizontal, Edit2, Trash2, X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Field, Badge, PageHeader, StatCard, Toolbar } from '../../components/shared/CommonUI'

export function CustomersTab() {
  const INITIAL_CUSTOMERS = [
    {
      id: 1,
      nom: 'Nadia El Idrissi',
      tel: '+212 661248890',
      email: 'nadia@exemple.ma',
      prix: 4280,
      commandes: 8,
      statut: 'Fidèle',
    },
    {
      id: 2,
      nom: 'Youssef Amrani',
      tel: '+212 662248890',
      email: 'youssef@exemple.ma',
      prix: 1950,
      commandes: 4,
      statut: 'Régulier',
    },
  ]

  const [q, setQ] = useState('')
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const EMPTY_FORM = {
    nom: '',
    tel: '',
    email: '',
    prix: '',
    commandes: '',
    statut: 'Occasionnel',
  }
  const [form, setForm] = useState(EMPTY_FORM)
    const openCreateForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setIsFormOpen(true)
  }
  const openEditForm = (customer) => {
    setOpenMenuId(null)

    setEditingId(customer.id)

    setForm({
      nom: customer.nom,
      tel: customer.tel,
      email: customer.email,
      prix: String(customer.prix),
      commandes: String(customer.commandes),
      statut: customer.statut,
    })

    setIsFormOpen(true)
  }
  const handleDelete = (id) => {
    setOpenMenuId(null)

    setCustomers((prev) =>
      prev.filter((customer) => customer.id !== id)
    )

    toast.success('Client supprimé.')
  }
  const handleSaveCustomer = (e) => {
    e.preventDefault()

    if (
      !form.nom.trim() ||
      !form.tel.trim() ||
      !form.email.trim() ||
      !form.prix ||
      !form.commandes
    ) {
      toast.error('Veuillez remplir tous les champs obligatoires.')
      return
    }

    const customerPayload = {
      id: editingId || Date.now(),
      nom: form.nom.trim(),
      tel: form.tel.trim(),
      email: form.email.trim(),
      prix: Number(form.prix),
      commandes: Number(form.commandes),
      statut: form.statut,
    }

    if (editingId) {
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === editingId
            ? customerPayload
            : customer
        )
      )

      toast.success('Client modifié.')
    } else {
      setCustomers((prev) => [
        customerPayload,
        ...prev,
      ])

      toast.success('Client ajouté.')
    }

    setEditingId(null)
    setIsFormOpen(false)
  }
  const rows = customers.filter((customer) =>
    `${customer.nom} ${customer.email}`
      .toLowerCase()
      .includes(q.toLowerCase())
  )

  return (
    <>
      <PageHeader
        title="Clients"
        copy="Comprenez vos clients et développez les relations qui comptent."
        action={
          <Button onClick={openCreateForm}>
            <Plus className="size-4" /> Ajouter un client
          </Button>
        }
      />
      {isFormOpen && (
        <Card className="mb-6 border-primary/30 bg-card p-6 shadow-md">

          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold">
                {editingId
                  ? 'Modifier le client'
                  : 'Nouveau client'}
              </h2>

              <p className="text-xs text-muted-foreground">
                Informations du client.
              </p>
            </div>

            <button
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg p-1.5 hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          <form
            onSubmit={handleSaveCustomer}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >

            <Field label="Nom complet *">
              <Input
                value={form.nom}
                onChange={(e) =>
                  setForm({ ...form, nom: e.target.value })
                }
              />
            </Field>

            <Field label="Téléphone *">
              <Input
                value={form.tel}
                onChange={(e) =>
                  setForm({ ...form, tel: e.target.value })
                }
              />
            </Field>

            <Field label="Email *">
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </Field>

            <Field label="Montant total (DH) *">
              <Input
                type="number"
                value={form.prix}
                onChange={(e) =>
                  setForm({ ...form, prix: e.target.value })
                }
              />
            </Field>

            <Field label="Nombre de commandes *">
              <Input
                type="number"
                value={form.commandes}
                onChange={(e) =>
                  setForm({ ...form, commandes: e.target.value })
                }
              />
            </Field>

            <Field label="Statut">
              <select
                value={form.statut}
                onChange={(e) =>
                  setForm({
                    ...form,
                    statut: e.target.value,
                  })
                }
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
              >
                <option>Fidèle</option>
                <option>Régulier</option>
                <option>Occasionnel</option>
              </select>
            </Field>

            <div className="flex justify-end gap-2 pt-2 sm:col-span-2 lg:col-span-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsFormOpen(false)}
              >
                Annuler
              </Button>

              <Button type="submit">
                {editingId
                  ? 'Enregistrer les modifications'
                  : 'Ajouter le client'}
              </Button>
            </div>
          </form>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Clients actifs" value="1 248" delta="+16,7%" icon={Users} />
        <StatCard label="Nouveaux ce mois" value="86" delta="+12,1%" icon={Users} />
        <StatCard label="Taux de retour" value="42,8%" delta="+5,4%" icon={TrendingUp} />
      </div>
      <div className="mt-5">
        <Toolbar q={q} set={setQ} />
        <Card className="border-border p-5">
          <div className="space-y-4">

            {rows.map((customer) => (

              <div
                key={customer.id}
                className="flex items-center gap-3 border-b border-border pb-4 last:border-0"
              >

                <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                  {customer.nom
                    .split(' ')
                    .map((x) => x[0])
                    .join('')}
                </span>

                <div className="flex-1">
                  <b className="text-sm">
                    {customer.nom}
                  </b>

                  <p className="text-xs text-muted-foreground">
                    {customer.tel} · {customer.email}
                  </p>
                </div>

                <span className="hidden text-right sm:block">
                  <b className="block text-sm">
                    {customer.prix} DH
                  </b>

                  <small className="text-xs text-muted-foreground">
                    {customer.commandes} commandes
                  </small>
                </span>

                <Badge
                  tone={
                    customer.statut === 'Fidèle'
                      ? 'green'
                      : customer.statut === 'Régulier'
                      ? 'blue'
                      : 'slate'
                  }
                >
                  {customer.statut}
                </Badge>

                <div className="relative">

                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === customer.id
                          ? null
                          : customer.id
                      )
                    }
                    className="rounded-lg p-1.5 hover:bg-muted"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>

                  {openMenuId === customer.id && (
                    <div className="absolute right-0 top-8 z-20 w-36 rounded-xl border border-border bg-card p-1.5 shadow-lg">

                      <button
                        type="button"
                        onClick={() => openEditForm(customer)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-muted"
                      >
                        <Edit2 className="size-3.5 text-blue-500" />
                        Modifier
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(customer.id)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" />
                        Supprimer
                      </button>

                    </div>
                  )}

                </div>

              </div>

            ))}

          </div>
        </Card>
      </div>
    </>
  )
}