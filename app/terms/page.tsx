"use client";

import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  const reduce = useReducedMotion();

  return (
    <AppLayout>
      <motion.article
        initial={{ opacity: 0, y: reduce ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[44rem] break-words pb-10"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 py-2 text-[13px] font-bold text-slate transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} />
          Retour à l&apos;accueil
        </Link>

        <header className="mt-6 border-b border-line pb-8">
          <p className="overline">Légal</p>
          <h1 className="mt-3 text-display text-ink">
            Conditions générales d&apos;utilisation
          </h1>
          <p className="mt-4 text-sm font-semibold text-muted">
            Dernière mise à jour : 13 Avril 2026
          </p>
        </header>

        <section>
          <h2 className="mt-10 text-title text-ink">1. Engagement des membres</h2>
          <p className="mt-4 text-lead text-graphite">
            En utilisant CovoitElite, vous vous engagez à :
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-lead text-graphite marker:text-brand-dark">
            <li>Fournir des informations exactes et véridiques</li>
            <li>Être ponctuel lors des rendez-vous de covoiturage</li>
            <li>Respecter les autres membres de la communauté</li>
            <li>Pour les conducteurs : posséder un permis valide et une assurance à jour</li>
          </ul>
        </section>

        <section>
          <h2 className="mt-12 text-title text-ink">2. Système de commission</h2>
          <p className="mt-4 text-lead text-graphite">
            CovoitElite est une plateforme intermédiaire. Pour assurer son fonctionnement :
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-lead text-graphite marker:text-brand-dark">
            <li>Une commission de 10% est appliquée sur chaque place réservée</li>
            <li>Le conducteur perçoit le montant total auprès du passager</li>
            <li>Le conducteur s&apos;engage à reverser la commission due à la plateforme</li>
          </ul>
        </section>

        <section>
          <h2 className="mt-12 text-title text-ink">3. Sanctions et blocages</h2>
          <p className="mt-4 text-lead text-graphite">
            Le non-respect des règles peut entraîner des sanctions :
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-lead text-graphite marker:text-brand-dark">
            <li>
              Un retard de paiement de commission de plus de 7 jours entraîne un blocage automatique
            </li>
            <li>Les comportements inappropriés signalés peuvent mener à une exclusion définitive</li>
            <li>Les annulations abusives impactent votre score de fiabilité</li>
          </ul>
        </section>

        <section>
          <h2 className="mt-12 text-title text-ink">4. Responsabilité</h2>
          <p className="mt-4 text-lead text-graphite">
            CovoitElite agit en tant que plateforme de mise en relation. Bien que nous vérifions les profils, la responsabilité civile et pénale du trajet incombe au conducteur. La plateforme ne saurait être tenue responsable des incidents survenant durant le trajet.
          </p>
        </section>

        <p className="mt-12 border-t border-line pt-6 text-sm leading-relaxed text-muted">
          En créant un compte, vous acceptez ces conditions ainsi que notre{" "}
          <Link
            href="/privacy"
            className="font-bold text-ink transition-colors hover:text-brand-dark"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </motion.article>
    </AppLayout>
  );
}
