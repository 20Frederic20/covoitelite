<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CovoitElite — Le covoiturage d'élite au Bénin

CovoitElite est une application de covoiturage premium et moderne conçue pour le Bénin. Elle permet de connecter facilement conducteurs et passagers pour des trajets sécurisés, économiques et conviviaux, avec un système de paiement et d'affichage en **FCFA**.

L'application intègre une interface utilisateur moderne et soignée, des animations fluides, ainsi qu'un espace d'administration complet pour la vérification des utilisateurs, des véhicules et des documents KYC.

---

## 🚀 Fonctionnalités Clés

### 👤 Pour les Passagers
- **Recherche de trajets** : Recherche instantanée par ville de départ et de destination.
- **Réservation simplifiée** : Réservation de places avec calcul transparent des coûts (en FCFA).
- **Suivi des réservations** : Historique des trajets réservés et statuts en temps réel.
- **Sécurité** : Visualisation des profils des conducteurs, de leurs véhicules et de leurs notes.

### 🚗 Pour les Conducteurs
- **Publication de trajets** : Ajout de trajets en indiquant le point de départ, la destination, la date, l'heure, le prix par place et le véhicule.
- **Gestion des réservations** : Acceptation ou rejet des demandes de réservation des passagers.
- **Enregistrement de véhicules** : Ajout de véhicules (voiture ou moto) avec pièces justificatives (carte grise, assurance).
- **Suivi des commissions** : Gestion des dettes et commissions dues à la plateforme.

### 🔑 Authentification & Sécurité
- **OTP (One-Time Password)** : Authentification robuste par code temporaire à la connexion et à l'inscription.
- **Processus KYC** : Soumission de documents d'identité pour vérifier les conducteurs.

### 🛡️ Administration (Back-Office)
- **Gestion des utilisateurs** : Promotion, rétrogradation, blocage, suppression et restauration de comptes.
- **Vérification KYC & Véhicules** : Examen et approbation des documents d'identité et des pièces de véhicules.
- **Facturation & Recouvrement** : Suivi des dettes des conducteurs avec gestion des blocages automatiques en cas d'impayé.

---

## 🛠️ Stack Technique

- **Frontend** : [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Style & Animations** : [Tailwind CSS](https://tailwindcss.com/), [Motion/React (Framer Motion)](https://motion.dev/), [Lucide React](https://lucide.dev/) (icônes)
- **Gestion d'état** : [Zustand](https://zustand-demo.pmnd.rs/) (avec persistance locale)
- **Client HTTP** : [Axios](https://axios-http.com/) avec interceptor personnalisé pour le déballage des réponses API
- **Proxying** : Configuration de `rewrites` dans `next.config.ts` pour rediriger dynamiquement les requêtes `/api/v1/*` vers l'API de production backend afin d'éviter les erreurs CORS.

---

## ⚙️ Démarrage Local

### Prérequis
- [Node.js](https://nodejs.org/) (version 18+ recommandée)

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration des variables d'environnement
Créez un fichier `.env.local` à la racine en vous basant sur `.env.example` :
```bash
# Variables nécessaires pour l'application
GEMINI_API_KEY="votre_cle_gemini_api"
APP_URL="http://localhost:3000"
```

### 3. Lancement de l'application
Démarrez le serveur de développement :
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📦 Build et Production

Pour générer le build optimisé pour la production :
```bash
npm run build
npm run start
```
