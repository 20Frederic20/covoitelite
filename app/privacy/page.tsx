"use client";

import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          <h1 className="mt-3 text-display text-ink">Politique de confidentialité</h1>
          <p className="mt-4 text-sm font-semibold text-muted">
            Dernière mise à jour : 13 Avril 2026
          </p>
        </header>

        <section>
          <h2 className="mt-10 text-title text-ink">1. Collecte des données</h2>
          <p className="mt-4 text-lead text-graphite">
            Pour assurer le bon fonctionnement de CovoitElite, nous collectons les informations suivantes :
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-lead text-graphite marker:text-brand-dark">
            <li>Informations d&apos;identité (Nom, Prénom, Email, Téléphone)</li>
            <li>Données de localisation (pour la recherche et la publication de trajets)</li>
            <li>Informations sur le véhicule (pour les conducteurs)</li>
            <li>Historique des trajets et des réservations</li>
          </ul>
        </section>

        <section>
          <h2 className="mt-12 text-title text-ink">2. Utilisation des données</h2>
          <p className="mt-4 text-lead text-graphite">Vos données sont utilisées exclusivement pour :</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-lead text-graphite marker:text-brand-dark">
            <li>Mettre en relation les conducteurs et les passagers</li>
            <li>Gérer vos réservations et notifications</li>
            <li>Assurer la sécurité de la communauté via la vérification des profils</li>
            <li>Améliorer nos services et votre expérience utilisateur</li>
          </ul>
        </section>

        <section>
          <h2 className="mt-12 text-title text-ink">3. Partage des informations</h2>
          <p className="mt-4 text-lead text-graphite">
            CovoitElite ne vend jamais vos données à des tiers. Vos informations de contact ne sont partagées avec un autre membre que lorsqu&apos;une réservation est confirmée, afin de faciliter l&apos;organisation du trajet.
          </p>
        </section>

        <section>
          <h2 className="mt-12 text-title text-ink">4. Vos droits</h2>
          <p className="mt-4 text-lead text-graphite">
            Conformément aux lois en vigueur au Bénin, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ces droits depuis votre profil ou en nous contactant directement.
          </p>
        </section>

        <p className="mt-12 border-t border-line pt-6 text-sm leading-relaxed text-muted">
          Une question sur vos données ? Écrivez-nous à{" "}
          <a
            href="mailto:apprentissagethough@gmail.com"
            className="break-all font-bold text-ink transition-colors hover:text-brand-dark"
          >
            apprentissagethough@gmail.com
          </a>
          .
        </p>
      </motion.article>
    </AppLayout>
  );
}
