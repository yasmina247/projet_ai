import { useState } from 'react'
import { toast } from 'sonner'
import { Edit2, MoreHorizontal, Plus, Trash2, X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card } from '../../components/ui/card'
import { Badge, Field, PageHeader, Toolbar } from '../../components/shared/CommonUI'
import { productsData } from '../../data/mockData'

const EMPTY_FORM = {
  n: '',
  sku: '',
  cat: 'Mode',
  p: '',
  stock: '',
  statusOverride: 'auto',
  img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80',
}

export function ProductsTab() {
  const [items, setItems] = useState(productsData)
  const [q, setQ] = useState('')
  const [catFilter, setCatFilter] = useState('Toutes les catégories')
  const [openMenuSku, setOpenMenuSku] = useState(null)

  // États du formulaire d'ajout / édition
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSku, setEditingSku] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const openCreateForm = () => {
    setEditingSku(null)
    setForm(EMPTY_FORM)
    setIsFormOpen(true)
  }

  const openEditForm = (product) => {
    setOpenMenuSku(null)
    setEditingSku(product.sku)
    setForm({
      n: product.n,
      sku: product.sku,
      cat: product.cat,
      p: String(product.p),
      stock: String(product.stock),
      statusOverride: product.statusOverride || 'auto',
      img: product.img,
    })
    setIsFormOpen(true)
  }

  const handleDelete = (sku) => {
    setOpenMenuSku(null)
    setItems((prev) => prev.filter((item) => item.sku !== sku))
    toast.success(`Produit ${sku} supprimé.`)
  }

  const handleSaveProduct = (e) => {
    e.preventDefault()
    if (!form.n.trim() || !form.sku.trim() || form.p === '' || form.stock === '') {
      return toast.error('Veuillez remplir tous les champs obligatoires.')
    }

    const parsedPrice = Number(form.p)
    const parsedStock = Number(form.stock)

    const productPayload = {
      n: form.n.trim(),
      sku: form.sku.trim().toUpperCase(),
      cat: form.cat,
      p: parsedPrice,
      stock: parsedStock,
      statusOverride: form.statusOverride,
      img: form.img,
    }

    if (editingSku) {
      setItems((prev) => prev.map((item) => (item.sku === editingSku ? productPayload : item)))
      toast.success('Produit mis à jour avec succès.')
    } else {
      if (items.some((item) => item.sku === productPayload.sku)) {
        return toast.error('Cette référence SKU existe déjà.')
      }
      setItems((prev) => [productPayload, ...prev])
      toast.success('Nouveau produit ajouté au catalogue.')
    }

    setIsFormOpen(false)
    setEditingSku(null)
  }

  const getProductStatus = (product) => {
    if (product.statusOverride && product.statusOverride !== 'auto') {
      if (product.statusOverride === 'Rupture') return { label: 'Rupture', tone: 'red' }
      if (product.statusOverride === 'Stock faible') return { label: 'Stock faible', tone: 'amber' }
      return { label: 'En stock', tone: 'green' }
    }
    if (product.stock === 0) return { label: 'Rupture', tone: 'red' }
    if (product.stock < 12) return { label: 'Stock faible', tone: 'amber' }
    return { label: 'En stock', tone: 'green' }
  }

  const rows = items.filter((p) => {
    const matchesSearch =
      p.n.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())
    const matchesCat = catFilter === 'Toutes les catégories' || p.cat === catFilter
    return matchesSearch && matchesCat
  })

  return (
    <>
      <PageHeader
        title="Produits"
        copy="Gérez votre catalogue et gardez une offre toujours à jour."
        action={
          <Button onClick={openCreateForm}>
            <Plus className="size-4" /> Ajouter un produit
          </Button>
        }
      />

      {/* Formulaire complet d'ajout / modification */}
      {isFormOpen && (
        <Card className="mb-6 border-primary/30 bg-card p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold">
                {editingSku ? `Modifier le produit (${editingSku})` : 'Nouveau produit'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Renseignez toutes les caractéristiques de l’article.
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleSaveProduct} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nom du produit *">
              <Input
                placeholder="Ex: Caftan velours Fès"
                value={form.n}
                onChange={(e) => setForm({ ...form, n: e.target.value })}
              />
            </Field>

            <Field label="Référence (SKU) *">
              <Input
                placeholder="Ex: CAF-305"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </Field>

            <Field label="Catégorie *">
              <select
                value={form.cat}
                onChange={(e) => setForm({ ...form, cat: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="Mode">Mode</option>
                <option value="Accessoires">Accessoires</option>
                <option value="Maison">Maison</option>
                <option value="Chaussures">Chaussures</option>
              </select>
            </Field>

            <Field label="Photo du produit">
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-6 transition hover:border-primary hover:bg-primary/10">
              
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5.002 5.002 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>

              <div className="text-center">
                <p className="font-medium text-foreground">
                  Choisir une image
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG ou WEBP
                </p>
              </div>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]

                  if (file) {
                    setForm({
                      ...form,
                      img: URL.createObjectURL(file),
                    })
                  }
                }}
              />
            </label>

            {form.img && (
              <div className="mt-4 flex justify-center">
                <img
                  src={form.img}
                  alt="Aperçu produit"
                  className="h-32 w-32 rounded-xl border shadow-md object-cover"
                />
              </div>
            )}
          </Field>

            <Field label="Prix (DH) *">
              <Input
                type="number"
                min="0"
                placeholder="Ex: 550"
                value={form.p}
                onChange={(e) => setForm({ ...form, p: e.target.value })}
              />
            </Field>

            <Field label="Quantité en stock *">
              <Input
                type="number"
                min="0"
                placeholder="Ex: 25"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </Field>

            <Field label="Statut">
              <select
                value={form.statusOverride}
                onChange={(e) => setForm({ ...form, statusOverride: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="auto">Automatique (selon le stock)</option>
                <option value="En stock">En stock</option>
                <option value="Stock faible">Stock faible</option>
                <option value="Rupture">Rupture</option>
              </select>
            </Field>

            <div className="flex justify-end gap-2 pt-2 sm:col-span-2 lg:col-span-3">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingSku ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Toolbar
        q={q}
        set={setQ}
        button={
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-card px-3 text-xs"
          >
            <option>Toutes les catégories</option>
            <option>Mode</option>
            <option>Accessoires</option>
            <option>Maison</option>
            <option>Chaussures</option>
          </select>
        }
      />

      <Card className="overflow-visible border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/50 text-[10px] uppercase text-muted-foreground">
              <tr>
                {['Produit', 'Référence', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Actions'].map((x) => (
                  <th key={x} className="px-5 py-4">{x}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((p) => {
                const status = getProductStatus(p)
                return (
                  <tr key={p.sku} className="hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.img} alt={p.n} className="size-10 rounded-lg object-cover" />
                        <b>{p.n}</b>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{p.sku}</td>
                    <td className="px-5 py-4 text-muted-foreground">{p.cat}</td>
                    <td className="px-5 py-4 font-bold">{p.p} DH</td>
                    <td className="px-5 py-4">{p.stock}</td>
                    <td className="px-5 py-4">
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </td>
                    <td className="relative px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setOpenMenuSku(openMenuSku === p.sku ? null : p.sku)}
                        className="rounded-lg p-1.5 hover:bg-muted"
                      >
                        <MoreHorizontal className="size-4 text-muted-foreground" />
                      </button>

                      {/* Petite liste déroulante Modifier / Supprimer */}
                      {openMenuSku === p.sku && (
                        <div className="absolute right-6 top-12 z-30 w-36 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                          <button
                            type="button"
                            onClick={() => openEditForm(p)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                          >
                            <Edit2 className="size-3.5 text-primary" /> Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.sku)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="size-3.5" /> Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}