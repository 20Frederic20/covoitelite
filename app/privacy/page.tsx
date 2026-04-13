"use client";

import AppLayout from "@/components/AppLayout";
import { motion } from "motion/react";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPage() {
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
              <Shield size={32} />
            </div>
            <h1 className="text-4xl font-black uppercase italic">Politique de Confidentialité</h1>
            <p className="text-muted-foreground">Dernière mise à jour : 13 Avril 2026</p>
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 space-y-8 shadow-xl">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Eye size={24} />
                <h2 className="text-2xl font-bold">1. Collecte des données</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Pour assurer le bon fonctionnement de CovoitElite, nous collectons les informations suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Informations d&apos;identité (Nom, Prénom, Email, Téléphone)</li>
                <li>Données de localisation (pour la recherche et la publication de trajets)</li>
                <li>Informations sur le véhicule (pour les conducteurs)</li>
                <li>Historique des trajets et des réservations</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Lock size={24} />
                <h2 className="text-2xl font-bold">2. Utilisation des données</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Vos données sont utilisées exclusivement pour :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Mettre en relation les conducteurs et les passagers</li>
                <li>Gérer vos réservations et notifications</li>
                <li>Assurer la sécurité de la communauté via la vérification des profils</li>
                <li>Améliorer nos services et votre expérience utilisateur</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Users size={24} />
                <h2 className="text-2xl font-bold">3. Partage des informations</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                CovoitElite ne vend jamais vos données à des tiers. Vos informations de contact ne sont partagées avec un autre membre que lorsqu&apos;une réservation est confirmée, afin de faciliter l&apos;organisation du trajet.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <FileText size={24} />
                <h2 className="text-2xl font-bold">4. Vos droits</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Conformément aux lois en vigueur au Bénin, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ces droits depuis votre profil ou en nous contactant directement.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

import { Users } from "lucide-react";
