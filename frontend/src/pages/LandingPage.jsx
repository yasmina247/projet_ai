import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import {
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  BrainCircuit,
  ChevronRight,
  FileSpreadsheet,
  Info,
  LineChart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge, Logo, SectionTitle } from '../components/shared/CommonUI'
import { chartData } from '../data/mockData'

const DYNAMIC_WORDS = [
  'plus futées.',
  'plus rentables.',
  'prédictives.',
  'automatisées.',
]

const FAQ_ITEMS = [
  {
    q: 'Est-ce adapté à une petite boutique ou un commerce indépendant ?',
    a: 'Oui, tout à fait. SmartSales AI est conçu pour les commerces locaux de toutes tailles : vous pouvez démarrer avec quelques dizaines de références et faire évoluer votre catalogue sans aucune complexité technique.',
  },
  {
    q: 'Les recommandations IA remplacent-elles mon intuition de commerçant ?',
    a: 'Jamais. L’IA analyse vos historiques de ventes et détecte les signaux faibles (produits qui accélèrent, risques de rupture) pour éclairer vos choix, mais vous gardez toujours la décision finale sur vos achats et promotions.',
  },
  {
    q: 'Comment mes clients interagissent-ils avec l’assistant sur WhatsApp ?',
    a: 'Vos clients écrivent directement sur votre numéro WhatsApp habituel : l’assistant IA leur répond instantanément 24h/24 sur la disponibilité des tailles, les prix en DH et enregistre leurs commandes dans votre tableau de bord.',
  },
  {
    q: 'Mes données commerciales et celles de mes clients sont-elles en sécurité ?',
    a: 'Absolument. Toutes vos données (catalogue, chiffre d’affaires, fichiers clients) sont isolées, chiffrées et hébergées de manière sécurisée. Vous restez l’unique propriétaire de vos informations.',
  },
]
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
}

export function LandingPage({ onNavigateAuth }) {
  const [wordIndex, setWordIndex] = useState(0)
  const [openFaqIndex, setOpenFaqIndex] = useState(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) return
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % DYNAMIC_WORDS.length)
    }, 2800)
    return () => clearInterval(timer)
  }, [shouldReduceMotion])

  const features = [
    [BrainCircuit, 'Assistant WhatsApp IA', 'Répondez instantanément aux questions clients, 24h/24, avec un ton naturel.'],
    [Boxes, 'Inventaire intelligent', 'Anticipez les ruptures et gardez exactement la bonne quantité en stock.'],
    [BarChart3, 'Analytics commercial', 'Transformez vos ventes quotidiennes en tableaux de bord limpides.'],
    [TrendingUp, 'Prévisions de ventes', 'Visualisez les tendances de revenus à 7 et 30 jours grâce à l’IA.'],
    [Sparkles, 'Recommandations IA', 'Suggérez automatiquement le produit complémentaire idéal à chaque client.'],
    [Users, 'Connaissance client', 'Segmentez vos acheteurs fidèles et cultivez des relations durables.'],
  ]

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      {/* Motifs géométriques et halos lumineux */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#3b66f50a_1px,transparent_1px),linear-gradient(to_bottom,#3b66f50a_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute -left-24 top-16 size-[480px] rounded-full bg-blue-400/20 blur-[110px]" />
      <div className="pointer-events-none absolute right-0 top-32 size-[520px] rounded-full bg-indigo-400/20 blur-[120px]" />

      {/* En-tête */}
      <header className="relative z-20 flex w-full items-center justify-between px-6 py-5 md:px-12 xl:px-20">
        <Logo />
        <nav className="hidden gap-10 text-sm font-medium text-slate-600 md:flex">
          <a href="#fonctionnalites" className="transition hover:text-primary">Fonctionnalités</a>
          <a href="#methode" className="transition hover:text-primary">Comment ça marche</a>
          <a href="#apropos" className="transition hover:text-primary">À propos</a>
          <a href="#faq" className="transition hover:text-primary">FAQ</a>
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateAuth}
            className="hidden text-sm font-semibold text-slate-700 transition hover:text-primary sm:block"
          >
            Se connecter
          </button>
          <Button
            onClick={onNavigateAuth}
            className="shadow-md shadow-primary/25 transition-transform hover:scale-[1.02]"
          >
            Commencer gratuitement <ArrowRight className="size-4" />
          </Button>
        </div>
      </header>

      <main className="relative z-10 w-full">
        {/* Section Hero */}
        <section className="grid w-full items-center gap-12 px-6 pb-24 pt-10 md:px-12 lg:grid-cols-[1fr_1.08fr] lg:pb-32 lg:pt-16 xl:px-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-primary shadow-sm backdrop-blur-md">
                <Sparkles className="size-3.5" /> La nouvelle intelligence des commerces locaux
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl xl:text-[64px]"
            >
              Votre boutique mérite des décisions{' '}
              <span className="inline-block min-h-[1.15em] align-bottom">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={DYNAMIC_WORDS[wordIndex]}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35 }}
                    className="inline-block bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent"
                  >
                    {DYNAMIC_WORDS[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              SmartSales AI réunit ventes, stocks, clients et intelligence artificielle dans un espace fluide pensé pour les commerçants marocains.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={onNavigateAuth}
                className="h-12 px-7 text-base shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5"
              >
                Découvrir la plateforme <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onNavigateAuth}
                className="h-12 border-slate-300/80 bg-white/80 px-7 text-base backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white"
              >
                Se connecter
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-2.5">
              {[
                { label: 'Intelligence Artificielle', icon: BrainCircuit },
                { label: 'Smart Analytics', icon: LineChart },
                { label: 'Prévisions de ventes', icon: TrendingUp },
                { label: 'Assistant IA 24/7', icon: Bot },
              ].map((tag) => {
                const TagIcon = tag.icon
                return (
                  <span
                    key={tag.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white/75 px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-md"
                  >
                    <TagIcon className="size-3.5 text-primary" />
                    {tag.label}
                  </span>
                )
              })}
            </motion.div>
          </motion.div>

          {/* Aperçu Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="animate-float-slow absolute -right-2 -top-5 z-20 hidden rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-xl backdrop-blur-md sm:block">
              <p className="text-[11px] font-medium text-slate-500">Prévision 30 jours</p>
              <p className="mt-0.5 text-base font-extrabold text-emerald-600">
                +18,6% <TrendingUp className="inline size-4" />
              </p>
            </div>

            <div className="animate-float-delayed absolute -bottom-5 -left-4 z-20 hidden rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">Recommandation IA</p>
                <p className="text-[11px] text-slate-500">Stock optimal détecté · +22%</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/90 bg-white/95 p-4 shadow-[0_28px_70px_-15px_rgba(37,78,219,0.18)] backdrop-blur-xl sm:p-6">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Zap className="size-4 fill-current" />
                </span>
                <b className="text-sm text-slate-800">SmartSales AI</b>
                <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  Aujourd’hui · En direct
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-5 sm:grid-cols-4">
                {[
                  ['Chiffre d’affaires', '48 295 DH', '+12%'],
                  ['Commandes', '284', '+8%'],
                  ['Clients actifs', '1 248', '+16%'],
                  ['Panier moyen', '170 DH', '+4%'],
                ].map(([label, val, delta]) => (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                    <p className="text-[11px] text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-extrabold text-slate-900">{val}</p>
                    <span className="text-[10px] font-bold text-emerald-600">{delta}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50/70 to-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Évolution du revenu</p>
                    <p className="text-xs text-slate-500">7 derniers jours</p>
                  </div>
                  <Badge tone="green">+12,4%</Badge>
                </div>
                <div className="h-48">
                  <ResponsiveContainer>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="hero" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#3b66f5" stopOpacity=".32" />
                          <stop offset="1" stopColor="#3b66f5" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="r" stroke="#3b66f5" strokeWidth="3" fill="url(#hero)" />
                      <XAxis dataKey="n" hide />
                      <YAxis hide />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Bandeau de confiance */}
        <div className="w-full border-y border-blue-200/60 bg-white/60 backdrop-blur-md">
          <div className="flex w-full flex-wrap justify-around gap-6 px-6 py-5 text-xs font-bold text-slate-600 md:px-12 xl:px-20">
            <span>✓ Données chiffrées de bout en bout</span>
            <span>✓ Conçu pour le marché marocain (MAD)</span>
            <span>✓ Assistant WhatsApp intelligent</span>
            <span>✓ Prêt pour votre croissance</span>
          </div>
        </div>

        {/* Section Fonctionnalités */}
        <section id="fonctionnalites" className="w-full px-6 py-24 md:px-12 xl:px-20">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
            <SectionTitle
              eyebrow="Une seule vue. Plus de maîtrise."
              title="Tout ce qu’il faut pour faire grandir votre commerce."
              copy="De la première vente à la prochaine décision, SmartSales AI vous aide à garder une longueur d’avance."
            />
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([Icon, t, c], idx) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group rounded-2xl border border-white bg-white/85 p-7 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5"
              >
                <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="size-6" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">{t}</h3>
                <p className="mt-2.5 text-sm leading-6 text-slate-600">{c}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section Méthode */}
        <section id="methode" className="relative w-full overflow-hidden bg-slate-950 py-24 text-white">
          <div className="pointer-events-none absolute left-1/4 top-0 size-96 rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="relative z-10 w-full px-6 md:px-12 xl:px-20">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <SectionTitle
                eyebrow="Simple par design"
                title="L’intelligence qui se met au travail en trois étapes."
                copy="Pas besoin d’être analyste. Vous connectez votre activité, SmartSales AI met les signaux importants en évidence."
              />
            </motion.div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                ['01', 'Centralisez votre boutique', 'Produits, commandes et clients réunis dans un espace clair.'],
                ['02', 'Laissez l’IA vous assister', 'Votre assistant répond, vos données évoluent, vos équipes gagnent du temps.'],
                ['03', 'Décidez avec confiance', 'Des prévisions concrètes pour agir au bon moment.'],
              ].map(([n, t, c], idx) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-md"
                >
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text font-mono text-base font-bold text-transparent">
                    {n}
                  </span>
                  <h3 className="mt-6 text-xl font-bold text-white">{t}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{c}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section FAQ avec réponses personnalisées */}
        <section id="faq" className="mx-auto max-w-4xl px-6 py-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
            <SectionTitle
              eyebrow="Questions fréquentes"
              title="Commencez avec une vision claire."
              copy="Une plateforme pensée pour rester lisible au quotidien et devenir plus puissante avec votre activité."
            />
            <div className="mt-10 divide-y divide-slate-200/80 rounded-3xl border border-white bg-white/85 px-7 shadow-sm backdrop-blur-md">
            {FAQ_ITEMS.map(({ q, a }, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div key={q} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 text-left text-base font-semibold text-slate-800"
                  >
                    <span>{q}</span>
                    <ChevronRight
                      className={`size-5 shrink-0 text-primary transition-transform duration-200 ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm leading-6 text-slate-600">{a}</p>
                  )}
                </div>
              )
            })}
          </div>
          </motion.div>
        </section>

        {/* Section À propos */}
        <section id="apropos" className="relative w-full overflow-hidden bg-[#0a0c14] py-16 lg:py-20 text-white">
          <div className="pointer-events-none absolute -right-24 top-10 size-[420px] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="pointer-events-none absolute -left-24 bottom-0 size-[350px] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="relative z-10 grid w-full items-center gap-12 px-6 md:px-12 lg:grid-cols-2 xl:px-20">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
              >
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300">
                <Info className="size-3.5" /> À propos
              </span>
              <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Une plateforme née des{' '}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                  besoins réels du terrain
                </span>
              </h2>
              <p className="mt-6 text-base leading-7 text-slate-300">
                SmartSales AI est né d’un constat simple : gérer ses stocks sur cahier, répondre tardivement sur WhatsApp et piloter ses ventes sans visibilité fait perdre un temps précieux aux commerçants.
              </p>
              <p className="mt-4 text-base leading-7 text-slate-400">
                Nous avons conçu une suite d’outils{' '}
                <span className="font-semibold text-indigo-300">intelligents et autonomes</span> qui analysent vos ventes, préviennent les ruptures et assistent vos clients au quotidien, comme le ferait un véritable bras droit commercial.
              </p>
            </motion.div>

            {/* Carte 2x2 style Glassmorphism sombre */}
            <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
              >
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: Bot,
                    title: '9 modules intégrés',
                    desc: 'Catalogue, Stocks, Commandes, Clients & IA',
                  },
                  {
                    icon: FileSpreadsheet,
                    title: 'Multi-canaux',
                    desc: 'Boutique physique, WhatsApp & Réseaux sociaux',
                  },
                  {
                    icon: BrainCircuit,
                    title: 'IA prédictive',
                    desc: 'Prévisions à 30j & alertes de rupture',
                  },
                  {
                    icon: ShieldCheck,
                    title: '100% adapté au MAD',
                    desc: 'Pensé pour les commerçants marocains',
                  },
                ].map((item) => {
                  const CardIcon = item.icon
                  return (
                    <div
                      key={item.title}
                      className="group rounded-2xl border border-white/10 bg-[#121624]/90 p-5 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10"
                    >
                      <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 transition-all duration-300 group-hover:bg-indigo-500 group-hover:text-white">
                        <CardIcon className="size-5" />
                      </span>
                      <h3 className="mt-4 text-base font-bold text-white">{item.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{item.desc}</p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer complet en bas de page */}
      <footer className="w-full border-t border-white/10 bg-[#07090f] text-slate-400">
        <div className="grid w-full gap-10 px-6 py-14 md:grid-cols-4 md:px-12 xl:px-20">
          <div className="space-y-4 md:col-span-2">
            <div className="text-white">
              <Logo />
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              La plateforme de gestion commerciale et d’intelligence artificielle dédiée aux boutiques et marques ambitieuses au Maroc.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Navigation</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#fonctionnalites" className="transition hover:text-white">Fonctionnalités</a></li>
              <li><a href="#methode" className="transition hover:text-white">Comment ça marche</a></li>
              <li><a href="#apropos" className="transition hover:text-white">À propos</a></li>
              <li><a href="#faq" className="transition hover:text-white">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Espace Marchand</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button onClick={onNavigateAuth} className="transition hover:text-white">
                  Se connecter
                </button>
              </li>
              <li>
                <button onClick={onNavigateAuth} className="transition hover:text-white">
                  Créer une boutique
                </button>
              </li>
              <li className="text-xs text-slate-500">support@smartsales.ma</li>
            </ul>
          </div>
        </div>

        <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-white/10 px-6 py-6 text-xs text-slate-500 sm:flex-row md:px-12 xl:px-20">
          <span>© 2026 SmartSales AI · Tous droits réservés.</span>
          <button onClick={onNavigateAuth} className="font-semibold text-indigo-400 hover:text-indigo-300">
            Accéder à mon tableau de bord →
          </button>
        </div>
      </footer>
    </div>
  )
}