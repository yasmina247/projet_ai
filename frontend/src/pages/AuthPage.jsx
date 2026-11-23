import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowRight, ChevronLeft, Eye, EyeOff, Sparkles, TrendingUp, Users } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Field, Logo } from '../components/shared/CommonUI'
import { useEffect, useRef, useState } from 'react'
import { apiRequest } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export function AuthPage({ onSuccess, onBack }) {
  const { login } = useAuth()
  const [mode, setMode] = useState('login')   // login | signup | forgot | reset
  const [fullName, setFullName] = useState('')
  const [shopName, setShopName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetToken, setResetToken] = useState(null)
  const [unverified, setUnverified] = useState(false)
  const handled = useRef(false)

  // Liens e-mail : /?verify=TOKEN et /?reset=TOKEN
  useEffect(() => {
    if (handled.current) return
    handled.current = true
    const p = new URLSearchParams(window.location.search)
    const v = p.get('verify')
    const r = p.get('reset')
    if (!v && !r) return
    window.history.replaceState({}, '', window.location.pathname)
    if (r) { setResetToken(r); setMode('reset'); return }
    apiRequest('/api/auth/verify-email', { method: 'POST', body: { token: v } })
      .then(() => toast.success('E-mail vérifié. Vous pouvez vous connecter.'))
      .catch((e) => toast.error(e.message))
  }, [])

  const resend = async () => {
    try {
      const d = await apiRequest('/api/auth/resend-verification', { method: 'POST', body: { email } })
      toast.success(d.message)
    } catch (e) { toast.error(e.message) }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      if (mode === 'forgot') {
        if (!email) throw new Error('Veuillez saisir votre email.')
        await apiRequest('/api/auth/forgot-password', { method: 'POST', body: { email } })
        toast.success('Si un compte correspond, un lien a été envoyé.')
        setMode('login')
      } else if (mode === 'reset') {
        if (pass !== confirm) throw new Error('Les mots de passe ne correspondent pas.')
        await apiRequest('/api/auth/reset-password', { method: 'POST', body: { token: resetToken, password: pass } })
        toast.success('Mot de passe réinitialisé. Connectez-vous.')
        setPass(''); setConfirm(''); setMode('login')
      } else if (mode === 'signup') {
        if (!fullName || !shopName || !email || !pass) throw new Error('Veuillez remplir les champs obligatoires.')
        if (pass !== confirm) throw new Error('Les mots de passe ne correspondent pas.')
        const d = await apiRequest('/api/auth/signup', {
          method: 'POST',
          body: { full_name: fullName, shop_name: shopName, email, password: pass },
        })
        toast.success(d.message)
        setPass(''); setConfirm(''); setMode('login')
      } else {
        if (!email || !pass) throw new Error('Veuillez remplir les champs obligatoires.')
        await login(email, pass)
        toast.success('Bienvenue dans votre espace marchand.')
        onSuccess?.()
      }
    } catch (err) {
      setUnverified(err.code === 'email_not_verified')
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-dvh w-full lg:grid-cols-2">
      {/* MOITIÉ GAUCHE (50%) : Thème sombre captivant, Halos lumineux (Aurora) & Glassmorphism */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex xl:p-16">
        {/* Halos lumineux en arrière-plan (Ambient Glows) */}
        <div className="pointer-events-none absolute -left-20 top-12 size-[420px] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-10 right-0 size-[440px] rounded-full bg-indigo-600/30 blur-[130px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/15 blur-[100px]" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-md">
            <Logo />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 my-auto max-w-lg"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-md">
            <Sparkles className="size-3.5" /> Plateforme commerciale augmentée
          </span>

          <h2 className="mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight xl:text-5xl">
            Les bons signaux.{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Au bon moment.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-300">
            La salle de contrôle de votre commerce, avec une{' '}
            <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text font-bold text-transparent">
              longueur d’avance
            </span>{' '}
            grâce à l’analyse prédictive en temps réel.
          </p>

          {/* Cartes effet verre lumineux (Glassmorphism) */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
                  <TrendingUp className="size-4" />
                </span>
                <span className="text-xs font-semibold text-emerald-400">IA Active</span>
              </div>
              <p className="mt-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-3xl font-extrabold text-transparent">
                +18,6%
              </p>
              <p className="mt-1 text-xs text-slate-400">croissance prédite sur 30j</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl bg-violet-400/15 text-violet-300">
                  <Users className="size-4" />
                </span>
                <span className="text-xs font-semibold text-cyan-300">+16,7%</span>
              </div>
              <p className="mt-4 bg-gradient-to-r from-white to-violet-200 bg-clip-text text-3xl font-extrabold text-transparent">
                1 248
              </p>
              <p className="mt-1 text-xs text-slate-400">clients actifs fidélisés</p>
            </div>
          </div>
        </motion.div>

        <p className="relative z-10 text-xs text-slate-400">
          © 2026 SmartSales AI · La donnée au service du commerce local.
        </p>
      </div>

      {/* MOITIÉ DROITE (50%) : Formulaire lumineux et équilibré */}
      <div className="relative flex w-full flex-col justify-center bg-gradient-to-br from-[#eef3fb] via-white to-[#e6eefc] px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <button
          onClick={onBack}
          className="mb-10 flex items-center gap-2 self-start rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 shadow-xs backdrop-blur-sm transition hover:border-primary/40 hover:text-primary"
        >
          <ChevronLeft className="size-4" /> Retour à l’accueil
        </button>

        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md rounded-3xl border border-white bg-white/90 p-8 shadow-[0_20px_50px_-15px_rgba(37,78,219,0.12)] backdrop-blur-xl sm:p-10"
        >
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xs font-extrabold uppercase tracking-wider text-transparent">
            SmartSales AI
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {mode === 'login' ? 'Bon retour.' : mode === 'signup' ? 'Créez votre espace.' : mode === 'reset' ? 'Nouveau mot de passe.' : 'Réinitialisez votre accès.'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">


            {mode === 'login'
              ? 'Connectez-vous pour piloter votre activité commerciale.'
              : 'Votre boutique mérite des outils intelligents.'}
          </p>


          {mode === 'forgot' || mode === 'reset' ? (
            <form onSubmit={submit} className="mt-8 space-y-5">
              {mode === 'forgot' ? (
                <Field label="Adresse email">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-slate-50/70" />
                </Field>
              ) : (
                <>
                  <Field label="Nouveau mot de passe">
                    <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="h-11 bg-slate-50/70" />
                  </Field>
                  <Field label="Confirmer le mot de passe">
                    <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11 bg-slate-50/70" />
                  </Field>
                </>
              )}
              <Button type="submit" disabled={loading} className="h-11 w-full shadow-md shadow-primary/20">
                {mode === 'forgot' ? 'Envoyer le lien' : 'Réinitialiser'}
              </Button>
            </form>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-4">
              {mode === 'signup' && (
                <>
                  <Field label="Nom complet">
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nadia El Idrissi" className="h-11 bg-slate-50/70" />
                  </Field>
                  <Field label="Nom de la boutique">
                    <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Atelier Noura" className="h-11 bg-slate-50/70" />
                  </Field>
                </>
              )}

              <Field label="Adresse email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-slate-50/70"
                />
              </Field>

              <Field label="Mot de passe">
                <div className="relative">
                  <Input
                    type={show ? 'text' : 'password'}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    className="h-11 bg-slate-50/70 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>

              {mode === 'signup' && (
                <Field label="Confirmer le mot de passe">
                  <Input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="h-11 bg-slate-50/70"
                  />
                </Field>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                  <label className="flex cursor-pointer items-center">
                    <input type="checkbox" defaultChecked className="mr-2 rounded accent-primary" />
                    Se souvenir de moi
                  </label>
                  <button type="button" onClick={() => setMode('forgot')} className="font-bold text-primary hover:underline">
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              <Button type="submit" disabled={loading} className="mt-2 h-11 w-full text-sm font-bold shadow-lg shadow-primary/25">
                {mode === 'login' ? 'Se connecter' : 'Créer mon espace'} <ArrowRight className="size-4" />
              </Button>
              {unverified && mode === 'login' && (
                <button type="button" onClick={resend} className="w-full text-center text-xs font-bold text-primary hover:underline">
                  Renvoyer l’e-mail de vérification
                </button>
              )}
            </form>
          )}
          {mode !== 'reset' && (
          <p className="mt-7 text-center text-sm text-slate-500">
            {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="font-bold text-primary hover:underline"
            >
              {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
            </button>
          </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}