"use client";

import AppLayout from "@/components/AppLayout";
import { motion } from "motion/react";
import { FileText, Scale, AlertTriangle, CheckCircle } from "lucide-react";

export default function TermsPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-primary">
              <Scale size={32} />
            </div>
            <h1 className="text-4xl font-black uppercase italic">Conditions Générales d&apos;Utilisation</h1>
            <p className="text-muted-foreground">Dernière mise à jour : 13 Avril 2026</p>
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 space-y-8 shadow-xl">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <CheckCircle size={24} />
                <h2 className="text-2xl font-bold">1. Engagement des membres</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                En utilisant CovoitElite, vous vous engagez à :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Fournir des informations exactes et véridiques</li>
                <li>Être ponctuel lors des rendez-vous de covoiturage</li>
                <li>Respecter les autres membres de la communauté</li>
                <li>Pour les conducteurs : posséder un permis valide et une assurance à jour</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <FileText size={24} />
                <h2 className="text-2xl font-bold">2. Système de commission</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                CovoitElite est une plateforme intermédiaire. Pour assurer son fonctionnement :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Une commission de 10% est appliquée sur chaque place réservée</li>
                <li>Le conducteur perçoit le montant total auprès du passager</li>
                <li>Le conducteur s&apos;engage à reverser la commission due à la plateforme</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <AlertTriangle size={24} />
                <h2 className="text-2xl font-bold">3. Sanctions et Blocages</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Le non-respect des règles peut entraîner des sanctions :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Un retard de paiement de commission de plus de 7 jours entraîne un blocage automatique</li>
                <li>Les comportements inappropriés signalés peuvent mener à une exclusion définitive</li>
                <li>Les annulations abusives impactent votre score de fiabilité</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Scale size={24} />
                <h2 className="text-2xl font-bold">4. Responsabilité</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                CovoitElite agit en tant que plateforme de mise en relation. Bien que nous vérifions les profils, la responsabilité civile et pénale du trajet incombe au conducteur. La plateforme ne saurait être tenue responsable des incidents survenant durant le trajet.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
