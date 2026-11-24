import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Bell, Check, ChevronRight, Lock, MessageCircle, Shield, Store, User } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Field, PageHeader } from '../../components/shared/CommonUI'
import { useSettings, useUpdateSettings } from '../../lib/queries'
import { useAuth } from '@/lib/auth'

const SECTIONS = [
  { id: 'merchant', label: 'Profil marchand', icon: User },
  { id: 'store', label: 'Informations boutique', icon: Store },
  { id: 'whatsapp', label: 'Assistant WhatsApp', icon: MessageCircle },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Compte & sécurité', icon: Shield },
]

const NOTIFICATIONS = [
  { key: 'notify_stock', title: 'Alerte de stock faible ou rupture', desc: 'Recevoir une alerte dès qu’un produit passe sous le seuil d’alerte de couverture.' },
  { key: 'notify_orders', title: 'Nouvelle commande confirmée via WhatsApp', desc: 'Notification immédiate lorsqu’un client valide un panier avec l’assistant.' },
  { key: 'notify_weekly_report', title: 'Rapport hebdomadaire des prévisions IA', desc: 'Résumé chaque lundi matin des produits à forte demande.' },
  { key: 'notify_sms', title: 'Alertes par SMS', desc: 'Recevoir uniquement les alertes critiques par SMS.' },
]

const SELECT = 'h-9 w-full rounded-md border border-input bg-card px-3 text-sm'

export function SettingsTab({ initialSection = 'merchant' }) {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState(initialSection)
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (initialSection) setActiveSection(initialSection)
  }, [initialSection])

  useEffect(() => {
    if (settings) setForm({ ...settings, currency: settings.currency === 'DH' ? 'MAD' : settings.currency })
  }, [settings])

  const handleSave = (label) => toast.success(`${label} enregistrés avec succès.`)

  const saveSettings = (label) =>
    updateSettings.mutate(form, {
      onSuccess: () => toast.success(`${label} enregistrés avec succès.`),
      onError: (e) => toast.error(e.message),
    })

  // Raccourcis pour relier un champ au formulaire
  const bind = (key) => ({
    disabled: !form,
    value: form?.[key] ?? '',
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  })
  const bindCheck = (key) => ({
    disabled: !form,
    checked: form?.[key] ?? false,
    onChange: (e) => setForm({ ...form, [key]: e.target.checked }),
  })
  const saving = !form || updateSettings.isPending

  return (
    <>
      <PageHeader title="Paramètres" copy="Configurez votre espace marchand et vos préférences." />

      <div className="grid gap-5 lg:grid-cols-[.7fr_1.4fr]">
        <Card className="h-fit border-border p-3">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon
            const isActive = activeSection === sec.id
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${
                  isActive ? 'bg-secondary font-bold text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="size-4" />
                  {sec.label}
                </span>
                <ChevronRight className="size-4" />
              </button>
            )
          })}
        </Card>

        {activeSection === 'merchant' && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Profil marchand</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom complet">
                <Input defaultValue={user?.full_name || ''} />
              </Field>
              <Field label="Rôle dans l’entreprise">
                <Input defaultValue={user?.role || 'Fondatrice & Gérante'} />
              </Field>
              <Field label="Email professionnel">
                <Input defaultValue={user?.email || ''} />
              </Field>
              <Field label="Téléphone personnel">
                <Input defaultValue={user?.phone || ''} />
              </Field>
              <Field label="Langue de l’interface">
                <select className={SELECT}>
                  <option>Français (Maroc)</option>
                  <option>Arabe</option>
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Button onClick={() => handleSave('Paramètres du profil')}>
                  <Check className="size-4" /> Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'store' && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Informations boutique</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom commercial de la boutique">
                <Input {...bind('store_name')} />
              </Field>
              <Field label="Secteur d’activité">
                <select className={SELECT} {...bind('sector')}>
                  <option>Prêt-à-porter & Mode</option>
                  <option>Accessoires & Maroquinerie</option>
                  <option>Décoration & Maison</option>
                  <option>Cosmétique & Beauté</option>
                </select>
              </Field>
              <Field label="Ville">
                <Input {...bind('city')} />
              </Field>
              <Field label="Adresse physique">
                <Input {...bind('address')} />
              </Field>
              <Field label="Devise principale">
                <select className={SELECT} {...bind('currency')}>
                  <option value="MAD">Dirham marocain (DH)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar US ($)</option>
                </select>
              </Field>
              <Field label="Seuil d’alerte stock (jours de couverture)">
                <Input
                  type="number"
                  min={1}
                  max={365}
                  disabled={!form}
                  value={form?.stock_critical_threshold ?? ''}
                  onChange={(e) => setForm({ ...form, stock_critical_threshold: Number(e.target.value) })}
                />
              </Field>
              <Field label="Frais de livraison standard">
                <Input
                  type="number"
                  min={0}
                  disabled={!form}
                  value={form?.shipping_fee ?? ''}
                  onChange={(e) => setForm({ ...form, shipping_fee: Number(e.target.value) })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Button disabled={saving} onClick={() => saveSettings('Informations de la boutique')}>
                  <Check className="size-4" /> Enregistrer la boutique
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'whatsapp' && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Configuration de l’Assistant WhatsApp IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Numéro WhatsApp Business">
                  <Input {...bind('whatsapp_number')} />
                </Field>
                <Field label="Ton de réponse de l’IA">
                  <select className={SELECT} {...bind('whatsapp_tone')}>
                    <option>Chaleureux & accueillant (recommandé)</option>
                    <option>Professionnel & concis</option>
                    <option>Darija / Français mixte</option>
                  </select>
                </Field>
              </div>
              <Field label="Message d’accueil automatique">
                <Input {...bind('welcome_message')} />
              </Field>
              <Field label="Token API WhatsApp Cloud (Meta / FastAPI)">
                <Input type="password" defaultValue="EAAJxxxxxxxxxxxxxx" />
              </Field>
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3.5">
                <div>
                  <p className="text-xs font-bold">Réponse automatique 24h/24</p>
                  <p className="text-[11px] text-muted-foreground">
                    L’IA répond aux questions de prix et stock même en dehors des horaires d’ouverture.
                  </p>
                </div>
                <input type="checkbox" {...bindCheck('enable_whatsapp')} className="size-4 accent-primary" />
              </div>
              <Button disabled={saving} onClick={() => saveSettings('Paramètres WhatsApp IA')}>
                <Check className="size-4" /> Enregistrer la configuration WhatsApp
              </Button>
            </CardContent>
          </Card>
        )}

        {activeSection === 'notifications' && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Préférences de notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {NOTIFICATIONS.map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <input type="checkbox" {...bindCheck(item.key)} className="size-4 accent-primary" />
                </div>
              ))}
              <Button disabled={saving} onClick={() => saveSettings('Préférences de notifications')}>
                <Check className="size-4" /> Mettre à jour
              </Button>
            </CardContent>
          </Card>
        )}

        {activeSection === 'security' && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Compte & sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mot de passe actuel">
                  <Input type="password" placeholder="••••••••" />
                </Field>
                <div className="hidden sm:block" />
                <Field label="Nouveau mot de passe">
                  <Input type="password" placeholder="Minimum 8 caractères" />
                </Field>
                <Field label="Confirmer le nouveau mot de passe">
                  <Input type="password" placeholder="••••••••" />
                </Field>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3.5">
                <div className="flex items-center gap-3">
                  <Lock className="size-4 text-primary" />
                  <div>
                    <p className="text-xs font-bold">Double authentification (2FA)</p>
                    <p className="text-[11px] text-muted-foreground">
                      Sécurisez l’accès à votre boutique avec un code de vérification par email.
                    </p>
                  </div>
                </div>
                <input type="checkbox" className="size-4 accent-primary" />
              </div>
              <Button onClick={() => handleSave('Paramètres de sécurité')}>
                <Check className="size-4" /> Mettre à jour le mot de passe
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}