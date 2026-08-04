<div align="center">
  <img width="1200" height="475" alt="CovoitElite Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  # 🚗 CovoitElite — Le covoiturage d'élite au Bénin

  **CovoitElite** est une application web moderne et élégante de covoiturage conçue pour le Bénin. Elle connecte conducteurs et passagers pour des trajets sécurisés, économiques et conviviaux en toute simplicité, avec affichage et transactions en **FCFA**.
</div>

---

## 📋 Table des Matières

- [✨ Aperçu & Fonctionnalités](#-aperçu--fonctionnalités)
  - [👤 Espace Passager](#-espace-passager)
  - [🚗 Espace Conducteur](#-espace-conducteur)
  - [🔑 Authentification & Sécurité](#-authentification--sécurité)
  - [🛡️ Back-Office Administration](#️-back-office-administration)
- [🛠️ Stack Technique](#️-stack-technique)
- [📁 Structure du Projet](#-structure-du-projet)
- [📡 API & Backend Proxying](#-api--backend-proxying)
- [⚙️ Installation & Démarrage](#️-installation--démarrage)
- [📜 Scripts Disponibles](#-scripts-disponibles)

---

## ✨ Aperçu & Fonctionnalités

### 👤 Espace Passager
- **Recherche multicritères** : Recherche de trajets par ville de départ, destination, date et nombre de places souhaitées.
- **Réservation instantanée** : Réservation simplifiée de sièges avec calcul automatique des coûts en FCFA.
- **Gestion des trajets** : Consultation et suivi du statut des réservations (*En attente*, *Confirmé*, *Annulé*, *Rejeté*).
- **Évaluation des conducteurs** : Système d'avis et de notation après chaque trajet effectué.

### 🚗 Espace Conducteur
- **Publication de trajets** : Création rapide de trajets (départ, destination, date, heure, prix/place, places disponibles et véhicule utilisé).
- **Gestion des réservations** : Validation ou refus direct des demandes des passagers.
- **Vérification KYC & Véhicules** : Soumission des pièces d'identité et enregistrement de véhicules (Voitures ou Motos) avec documents justificatifs (Carte grise, Assurance).
- **Contrôle KYC préalable** : Redirection automatique vers la vérification des pièces avant la publication de trajets.
- **Gestion des dettes & commissions** : Suivi en temps réel des commissions dues à la plateforme avec alertes en cas d'impayé.

### 🔑 Authentification & Sécurité
- **Authentification double modalité** : Prise en charge des adresses e-mail et des numéros de téléphone du Bénin (format international `+229` avec validation et normalisation automatique).
- **Vérification OTP (One-Time Password)** : Saisie sécurisée par code à 6 chiffres avec compte à rebours et renvoi.
- **Contrôle d'accès par rôles (RBAC)** : Navigation et fonctionnalités adaptées selon les rôles (`passager`, `conducteur`, `admin`).
- **Thème dynamique** : Support complet du Mode Sombre (Dark) et Clair (Light) avec transition fluide.

### 🛡️ Back-Office Administration (`/admin`)
- **Tableau de Bord Global (`/admin`)** : Vue synthétique des indicateurs clés (Trajets actifs, Revenus, Utilisateurs, KYC en attente) et flux d'activités récentes.
- **Gestion des Utilisateurs (`/admin/users`)** : Recherche, filtrage, promotion/rétrogradation d'administrateurs, suppression douce (*soft-delete*), restauration de comptes et gestion du blocage.
- **Vérification KYC & Véhicules (`/admin/kyc`)** : Interface dédiée à l'approbation ou au rejet des pièces d'identité et des cartes grises/assurances.
- **Suivi des Trajets (`/admin/rides`)** : Inspection de tous les trajets publiés, filtrage par statut et annulation si nécessaire.
- **Gestion Financière & Recouvrement (`/admin/financials`)** : Analyse des revenus, suivi des commissions impayées des conducteurs et déclenchement des tâches de mise à jour des impayés (Cron).

---

## 🛠️ Stack Technique

| Catégorie | Technologie / Bibliothèque |
| :--- | :--- |
| **Framework Frontend** | [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript 5.9](https://www.typescriptlang.org/) |
| **Styling & Thème** | [Tailwind CSS v4](https://tailwindcss.com/), CSS Custom Properties, [Next-Themes](https://github.com/pacocoursey/next-themes) |
| **UI Components & Icons** | [Lucide React](https://lucide.dev/), Tailwind Animate |
| **Animations** | [Motion (Framer Motion)](https://motion.dev/) |
| **Gestion d'État** | [Zustand 5](https://zustand-demo.pmnd.rs/) (Persistance locale via middleware) |
| **Visualisation de Données**| [Recharts 3](https://recharts.org/) |
| **HTTP Client & Proxy** | [Axios](https://axios-http.com/) avec interceptors pour l'unwrapping des enveloppes d'API backend |

---

## 📁 Structure du Projet

```text
covoitelite/
├── app/                      # Routes Next.js (App Router)
│   ├── admin/                # Back-office Administrateur
│   │   ├── financials/       # Suivi financier & impayés
│   │   ├── kyc/              # Validation des pièces & véhicules
│   │   ├── rides/            # Suivi des trajets globaux
│   │   └── users/            # Gestion des comptes utilisateurs
│   ├── create-ride/          # Publication d'un nouveau trajet
│   ├── kyc/                  # Soumission de documents KYC utilisateur
│   ├── login/                # Page de connexion OTP
│   ├── my-bookings/          # Suivi des réservations (Passager / Conducteur)
│   ├── profile/              # Profil utilisateur & gestion véhicules
│   ├── register/             # Inscription utilisateur
│   ├── ride/[id]/            # Détails et réservation d'un trajet
│   ├── search/               # Recherche de trajets
│   ├── terms/ & privacy/     # Conditions d'utilisation & Confidentialité
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Page d'accueil / Landing page
├── components/               # Composants UI réutilisables (AppLayout, AuthPanel, BottomNav, OtpInput...)
├── hooks/                    # Hooks React personnalisés (use-mobile, etc.)
├── lib/                      # Utilitaires (api.ts pour Axios, auth.ts pour validation Bénin)
├── store/                    # Store global Zustand (useStore.ts)
├── next.config.ts            # Configuration Next.js & Proxy rewrites
└── package.json              # Dépendances et scripts
```

---

## 📡 API & Backend Proxying

L'application communique avec le backend via un système de proxy Next.js configuré dans `next.config.ts`.

Toutes les requêtes adressées à `/api/v1/*` sont automatiquement redirigées vers le serveur backend distant :
`https://covoitelite-backend.onrender.com/api/v1/*`

Ce mécanisme empêche les erreurs de **CORS** en maintenant toutes les requêtes HTTP sur l'origine du client Web.

---

## ⚙️ Installation & Démarrage

### Prérequis
- **Node.js** v18+ 
- **npm** ou **yarn** / **pnpm**

### 1. Cloner le projet & installer les dépendances
```bash
npm install
```

### 2. Configuration de l'environnement
Créez un fichier `.env.local` à la racine du projet en vous basant sur `.env.example` :
```env
GEMINI_API_KEY="votre_cle_api_gemini"
APP_URL="http://localhost:3000"
```

### 3. Lancer en mode Développement
```bash
npm run dev
```
Rendez-vous sur [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📜 Scripts Disponibles

- `npm run dev` : Lance le serveur de développement avec rechargement chaud.
- `npm run build` : Compile et génère l'application optimisée pour la production.
- `npm run start` : Démarre le serveur de production après compilation.
- `npm run lint` : Exécute ESLint pour vérifier la qualité du code.
- `npm run clean` : Nettoie le cache de Next.js (`.next`).

---

<div align="center">
  <sub>Développé avec passion pour faciliter le transport au Bénin. 🇧🇯</sub>
</div>

