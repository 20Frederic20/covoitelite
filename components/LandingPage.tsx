"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import {
  Car,
  ShieldCheck,
  Zap,
  Users,
  ArrowRight,
  Star,
  Sun,
  Moon,
  Clock,
  Send,
  Mail,
  MapPin,
  Menu,
  X,
  Check,
  BadgeCheck,
  Wallet,
  Search,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

const NAV_LINKS = [
  { href: "#etapes", label: "Comment ça marche" },
  { href: "#atouts", label: "Nos atouts" },
  { href: "#securite", label: "Sécurité" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#contact", label: "Contact" },
];

// TODO: remplacer par les vraies URL des pages CovoitElite.
const SOCIAL_LINKS = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
];

/* The chevron: a road sign's arrow, used as the hero's geometry. */
function Chevron({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 100 140"
      aria-hidden
      className={`chevron ${className}`}
      style={style}
      fill="currentColor"
    >
      <path d="M0 0 L58 70 L0 140 L42 140 L100 70 L42 0 Z" />
    </svg>
  );
}

function Wordmark({ onDark = false, className = "" }: { onDark?: boolean; className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-brand text-on-brand">
        <Car size={19} strokeWidth={2.4} />
      </span>
      <span
        className={`text-lg font-extrabold tracking-[-0.03em] ${onDark ? "text-white" : "text-ink"}`}
      >
        Covoit<span className={onDark ? "text-brand" : "text-brand-dark"}>elite</span>
      </span>
    </Link>
  );
}

function ThemeToggle({ onDark = false }: { onDark?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={`grid h-10 w-10 place-items-center rounded-[11px] transition-colors ${
        onDark
          ? "text-white/70 hover:bg-white/10 hover:text-white"
          : "text-graphite hover:bg-surface-alt hover:text-ink"
      }`}
      aria-label="Changer de thème"
    >
      {mounted && resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

/* Right-edge social rail, as in the reference. Desktop only. */
function SocialRail() {
  return (
    <div className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col overflow-hidden rounded-l-[14px] border border-r-0 border-line bg-surface/90 shadow-soft backdrop-blur-xl xl:flex">
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="grid h-11 w-11 place-items-center text-slate transition-colors hover:bg-brand hover:text-on-brand"
        >
          <s.icon size={17} />
        </a>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const reduce = useReducedMotion();
  const router = useRouter();
  const { user } = useStore();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // The header only turns solid once the hero photo is behind us.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    const handle = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(handle);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <SocialRail />

      {/* ─── Navigation — transparent over the hero, solid once scrolled ─── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled
            ? "border-b border-line bg-bg/90 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-6 gutter">
          <Wordmark onDark={!scrolled} />

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.slice(0, 4).map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-[13px] font-semibold transition-colors ${
                  scrolled ? "text-graphite hover:text-ink" : "text-white/75 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Search — goes straight to the trip search, as in the reference */}
            <form
              onSubmit={onSearch}
              className={`hidden items-center rounded-full border pl-4 pr-1 transition-colors xl:flex ${
                scrolled ? "border-line bg-surface" : "border-white/25 bg-white/10"
              }`}
            >
              <label htmlFor="hero-search" className="sr-only">
                Rechercher une destination
              </label>
              <input
                id="hero-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Destination…"
                className={`h-9 w-36 bg-transparent text-[13px] font-semibold outline-none ${
                  scrolled
                    ? "text-ink placeholder:text-muted"
                    : "text-white placeholder:text-white/50"
                }`}
              />
              <button
                type="submit"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-on-brand transition-colors hover:bg-brand-light"
                aria-label="Rechercher"
              >
                <Search size={15} strokeWidth={2.6} />
              </button>
            </form>

            <ThemeToggle onDark={!scrolled} />

            {user ? (
              /* Already signed in: one way back into the app. */
              <Link
                href={user.role === "admin" ? "/admin" : "/"}
                className="btn btn-primary hidden rounded-full sm:inline-flex sm:h-10 sm:min-h-0"
              >
                Mon espace
                <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`hidden rounded-[11px] px-3 py-2 text-[13px] font-bold transition-colors sm:block ${
                    scrolled ? "text-graphite hover:text-ink" : "text-white/80 hover:text-white"
                  }`}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary hidden rounded-full sm:inline-flex sm:h-10 sm:min-h-0"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              className={`grid h-10 w-10 place-items-center rounded-[11px] transition-colors lg:hidden ${
                scrolled ? "text-ink hover:bg-surface-alt" : "text-white hover:bg-white/10"
              }`}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile menu ────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex flex-col bg-bg lg:hidden"
          >
            <div className="flex h-[68px] shrink-0 items-center justify-between gutter">
              <Wordmark />
              <button
                onClick={() => setMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-[11px] text-ink transition-colors hover:bg-surface-alt"
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto gutter py-6">
              <ul className="space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: reduce ? 0 : -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i + 0.05, duration: 0.3 }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between border-b border-line-soft py-4 text-xl font-bold tracking-[-0.02em] text-ink"
                    >
                      {link.label}
                      <ArrowRight size={18} className="text-muted" />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="shrink-0 gutter pb-safe space-y-2.5 pt-4 pb-6">
              {user ? (
                <Link
                  href={user.role === "admin" ? "/admin" : "/"}
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-primary btn-lg w-full"
                >
                  Mon espace
                  <ArrowRight size={17} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-primary btn-lg w-full"
                  >
                    Créer un compte
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-outline btn-lg w-full"
                  >
                    Connexion
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[42rem] items-center overflow-hidden bg-night lg:min-h-[92dvh]">
        {/* Photograph: full-bleed on phones, diagonally cut on desktop */}
        <div className="photo-cut absolute inset-0 lg:left-auto lg:w-[60%]">
          <Image
            src="/hero-driver.jpg"
            alt="Un conducteur au volant, au lever du jour"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 60vw"
            className="object-cover object-center"
          />
        </div>

        {/* Ink veil: keeps the headline readable over the photo at every size */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#121316]/95 via-[#121316]/85 to-[#121316]/95 lg:bg-gradient-to-r lg:from-[#121316] lg:via-[#121316]/92 lg:to-transparent"
        />

        {/* Chevrons — road-sign arrows, layered at the seam.
            They frame the driver; they never cover him. */}
        <Chevron className="left-[30%] top-[-10%] h-[135%] w-auto text-white/[0.035]" />
        <Chevron className="hidden text-white/[0.07] lg:block lg:left-[44%] lg:top-[2%] lg:h-[92%] lg:w-auto" />
        <Chevron className="hidden text-brand lg:block lg:left-[47%] lg:top-[30%] lg:h-[26%] lg:w-auto" />

        <div className="relative z-10 mx-auto w-full max-w-6xl gutter pb-16 pt-28 lg:pb-24 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <span className="chip border border-white/20 bg-white/10 text-white/85 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Cotonou · Porto-Novo · Abomey-Calavi · Parakou
            </span>

            <h1 className="mt-6 text-hero uppercase text-white">
              Voyagez
              <span className="mt-1 block font-extrabold italic tracking-[-0.04em] text-brand lowercase">
                avec l&apos;élite.
              </span>
            </h1>

            <p className="mt-5 text-sm font-semibold text-white/55">
              Le covoiturage au Bénin
            </p>

            <p className="mt-6 max-w-md text-lead text-white/70">
              Réservez une place auprès d&apos;un conducteur vérifié, ou remplissez votre voiture
              sur un trajet que vous faites déjà. Prix affichés en FCFA, sans surprise.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/search" className="btn btn-primary btn-lg w-full rounded-full sm:w-auto">
                Réserver un trajet
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/create-ride"
                className="btn btn-lg w-full rounded-full border border-white/25 text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                Proposer un trajet
              </Link>
            </div>

            <ul className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13px] font-semibold text-white/60">
              {["Conducteurs vérifiés", "Support 24h/24", "Commission de 10 %"].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check size={14} className="text-brand" strokeWidth={3} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

      </section>

      {/* ─── Chiffres ───────────────────────────────────────────── */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-line gutter sm:grid-cols-4 sm:divide-x">
          {[
            { value: "10 000+", label: "Membres" },
            { value: "50 000+", label: "Trajets" },
            { value: "25", label: "Villes" },
            { value: "4,9/5", label: "Satisfaction" },
          ].map((stat) => (
            <div key={stat.label} className="px-2 py-7 text-center sm:py-9">
              <p className="text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">
                {stat.value}
              </p>
              <p className="overline mt-1.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Comment ça marche — a real sequence, so it gets the rail ─── */}
      <section id="etapes" className="section">
        <div className="mx-auto max-w-6xl gutter">
          <motion.div {...rise()} className="max-w-2xl">
            <h2 className="mt-3 text-display text-ink">Quatre arrêts, du départ au règlement.</h2>
            <p className="mt-4 text-lead text-graphite">
              Le conducteur encaisse ses passagers, puis reverse la commission. Chaque étape est
              visible des deux côtés.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {[
              {
                icon: Car,
                title: "Publication",
                desc: "Le conducteur annonce son trajet, ses horaires, ses places libres et son prix par siège.",
              },
              {
                icon: Users,
                title: "Réservation",
                desc: "Les passagers demandent une place. Le conducteur voit leur profil et confirme qui monte.",
              },
              {
                icon: MapPin,
                title: "Course",
                desc: "Rendez-vous au point de départ. Le passager règle sa place directement au conducteur.",
              },
              {
                icon: Wallet,
                title: "Règlement",
                desc: "Le conducteur reverse 10 % à CovoitElite sous 7 jours. Passé ce délai, le compte est suspendu.",
              },
            ].map((step, i) => (
              <motion.div key={step.title} {...rise(i * 0.06)} className="rail-node">
                <h3 className="mt-2 flex items-center gap-2 text-base font-bold tracking-[-0.015em] text-ink">
                  <step.icon size={16} className="text-brand-dark" strokeWidth={2.4} />
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Atouts ─────────────────────────────────────────────── */}
      <section id="atouts" className="section border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl gutter">
          <motion.div {...rise()} className="max-w-2xl">
            <h2 className="mt-3 text-display text-ink">Pensé pour les routes du Bénin.</h2>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Conducteurs vérifiés",
                desc: "Pièce d'identité, permis et véhicule contrôlés avant la première annonce. Aucun profil anonyme.",
              },
              {
                icon: Zap,
                title: "Réservation en trois gestes",
                desc: "Recherche, demande, confirmation. Vous savez qui vous conduit avant de monter.",
              },
              {
                icon: Users,
                title: "Une communauté notée",
                desc: "Chaque trajet se termine par une note. Les meilleurs conducteurs remontent naturellement.",
              },
            ].map((f, i) => (
              <motion.article
                key={f.title}
                {...rise(i * 0.06)}
                className="card group p-6 transition-colors hover:border-ink sm:p-7"
              >
                <span className="grid h-11 w-11 place-items-center rounded-[11px] bg-brand-soft text-brand-dark transition-colors group-hover:bg-brand group-hover:text-on-brand">
                  <f.icon size={20} strokeWidth={2.2} />
                </span>
                <h3 className="mt-5 text-title text-ink">{f.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate">{f.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Sécurité ───────────────────────────────────────────── */}
      <section id="securite" className="section">
        <div className="mx-auto grid max-w-6xl items-start gap-12 gutter lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <motion.div {...rise()}>
            <h2 className="mt-3 text-display text-ink">
              On sait qui conduit, et vous aussi.
            </h2>

            <div className="mt-10 space-y-8">
              {[
                {
                  title: "Vérification des profils",
                  desc: "Chaque conducteur fournit une pièce d'identité valide et passe un entretien avant de publier.",
                },
                {
                  title: "Inspection des véhicules",
                  desc: "Carte grise, assurance et état du véhicule sont contrôlés, puis revérifiés chaque année.",
                },
                {
                  title: "Notation après chaque trajet",
                  desc: "Les notes de la communauté font remonter les meilleurs conducteurs et écartent les autres.",
                },
                {
                  title: "Support 24h/24",
                  desc: "Un litige, un retard, un incident sur la route : l'équipe répond à toute heure.",
                },
              ].map((item, i) => (
                <motion.div key={item.title} {...rise(i * 0.05)} className="flex gap-4">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-dark">
                    <Check size={15} strokeWidth={3} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold tracking-[-0.015em] text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* The verification record itself — the artifact, not a stock photo */}
          <motion.aside {...rise(0.1)} className="card overflow-hidden p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="overline">Dossier conducteur</p>
              <span className="chip bg-success-soft text-success">
                <BadgeCheck size={13} />
                Validé
              </span>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink text-lg font-extrabold text-bg">
                K
              </span>
              <div className="min-w-0">
                <p className="text-title text-ink">Koffi Mensah</p>
                <p className="flex items-center gap-1 text-sm font-semibold text-slate">
                  <Star size={13} className="fill-brand text-brand" />
                  4,9 · 214 trajets
                </p>
              </div>
            </div>

            <dl className="mt-7 space-y-px overflow-hidden rounded-[12px] border border-line">
              {[
                ["Pièce d'identité", "Vérifiée"],
                ["Permis de conduire", "Vérifié"],
                ["Carte grise", "Vérifiée"],
                ["Assurance", "Valide jusqu'au 03/2027"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between gap-3 bg-surface-alt px-4 py-3"
                >
                  <dt className="text-[13px] font-semibold text-slate">{k}</dt>
                  <dd className="flex items-center gap-1.5 text-[13px] font-bold text-ink">
                    <Check size={13} className="text-success" strokeWidth={3} />
                    <span className="truncate">{v}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 text-xs leading-relaxed text-muted">
              Les documents sont contrôlés par l&apos;équipe CovoitElite avant toute publication de
              trajet.
            </p>
          </motion.aside>
        </div>
      </section>

      {/* ─── Tarifs / commission ────────────────────────────────── */}
      <section id="tarifs" className="section border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl gutter">
          <motion.div {...rise()} className="max-w-2xl">
            <h2 className="mt-3 text-display text-ink">
              10 % de commission. C&apos;est tout.
            </h2>
            <p className="mt-4 text-lead text-graphite">
              Le conducteur fixe son prix par place et encaisse ses passagers. CovoitElite prélève
              10 %, réglés sous 7 jours.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div {...rise(0.05)} className="card-flat overflow-hidden">
              <p className="border-b border-line bg-surface-alt px-6 py-4 text-sm font-bold text-ink">
                Exemple : 3 places à 700 F
              </p>
              <div className="divide-y divide-line">
                {[
                  ["Encaissé par le conducteur", "2 100 F", false],
                  ["Commission CovoitElite (10 %)", "− 210 F", false],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between gap-4 px-6 py-4">
                    <span className="text-sm font-semibold text-slate">{label}</span>
                    <span className="text-sm font-bold text-ink">{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 bg-brand-soft px-6 py-5">
                  <span className="text-sm font-bold text-ink">Reste au conducteur</span>
                  <span className="text-title text-ink">1 890 F</span>
                </div>
              </div>
            </motion.div>

            <motion.div {...rise(0.1)} className="card-flat flex flex-col justify-between gap-6 p-6 sm:p-7">
              <div>
                <span className="grid h-10 w-10 place-items-center rounded-[11px] bg-warning-soft text-warning">
                  <Clock size={18} strokeWidth={2.2} />
                </span>
                <h3 className="mt-5 text-title text-ink">Le délai de 7 jours</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate">
                  La commission est due dans les 7 jours suivant le trajet. Au-delà, le compte est
                  suspendu jusqu&apos;au règlement complet.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate">Jour 6 sur 7</span>
                  <span className="text-warning">210 F dus</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
                  <motion.div
                    className="h-full rounded-full bg-warning"
                    initial={{ width: reduce ? "85%" : 0 }}
                    whileInView={{ width: "85%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Contact ────────────────────────────────────────────── */}
      <section id="contact" className="section">
        <div className="mx-auto max-w-6xl gutter">
          <motion.div {...rise()} className="max-w-2xl">
            <h2 className="mt-3 text-display text-ink">Une question ? Écrivez-nous.</h2>
            <p className="mt-4 text-lead text-graphite">
              L&apos;équipe répond sous 24 heures. Pour une urgence sur un trajet en cours,
              indiquez votre numéro de téléphone.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <motion.div {...rise(0.05)} className="card-flat space-y-7 self-start p-6 sm:p-7">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: (
                    <a
                      href="mailto:apprentissagethough@gmail.com"
                      className="break-all font-bold text-ink transition-colors hover:text-brand-dark"
                    >
                      apprentissagethough@gmail.com
                    </a>
                  ),
                },
                {
                  icon: Clock,
                  label: "Disponibilité",
                  value: <p className="font-bold text-ink">24h/24, 7j/7 · réponse sous 24 h</p>,
                },
                {
                  icon: MapPin,
                  label: "Bureau",
                  value: <p className="font-bold text-ink">Cotonou, Bénin</p>,
                },
              ].map((item) => (
                <div key={item.label} className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-brand-soft text-brand-dark">
                    <item.icon size={17} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <p className="overline">{item.label}</p>
                    <div className="mt-1 text-sm">{item.value}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div {...rise(0.1)} className="card p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex h-full min-h-[20rem] flex-col items-center justify-center text-center"
                  >
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-success-soft text-success">
                      <Check size={26} strokeWidth={3} />
                    </span>
                    <h3 className="mt-5 text-title text-ink">Message envoyé</h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate">
                      L&apos;équipe vous répond sous 24 heures à l&apos;adresse indiquée.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn btn-outline btn-sm mt-6"
                    >
                      Écrire un autre message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="field-label">
                          Nom complet
                        </label>
                        <input
                          id="name"
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Koffi Mensah"
                          className="field"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="field-label">
                          Email
                        </label>
                        <input
                          id="email"
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="vous@exemple.com"
                          className="field"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="field-label">
                        Sujet
                      </label>
                      <input
                        id="subject"
                        required
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Réservation, paiement, signalement…"
                        className="field"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="field-label">
                        Message
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Décrivez votre demande."
                        className="field resize-y"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg w-full">
                      Envoyer le message
                      <Send size={17} />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Pied de page ───────────────────────────────────────── */}
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl gutter py-12">
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
            <div className="max-w-xs">
              <Wordmark />
              <p className="mt-4 text-sm leading-relaxed text-slate">
                Le covoiturage d&apos;élite au Bénin. Conducteurs vérifiés, prix affichés,
                communauté notée.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:gap-16">
              <div>
                <p className="overline">Produit</p>
                <ul className="mt-4 space-y-2.5 text-sm font-semibold">
                  <li>
                    <Link href="/search" className="text-slate transition-colors hover:text-ink">
                      Rechercher un trajet
                    </Link>
                  </li>
                  <li>
                    <Link href="/create-ride" className="text-slate transition-colors hover:text-ink">
                      Publier un trajet
                    </Link>
                  </li>
                  <li>
                    <a href="#tarifs" className="text-slate transition-colors hover:text-ink">
                      Tarifs
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="overline">Légal</p>
                <ul className="mt-4 space-y-2.5 text-sm font-semibold">
                  <li>
                    <Link href="/privacy" className="text-slate transition-colors hover:text-ink">
                      Confidentialité
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-slate transition-colors hover:text-ink">
                      Conditions
                    </Link>
                  </li>
                  <li>
                    <a href="#contact" className="text-slate transition-colors hover:text-ink">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
