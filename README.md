# MyDartTraining

> Application de jeu de fléchette en ligne — multijoueur, solo et entraînement.

---

## Architecture

Ce projet est composé de deux dépôts séparés :

| Dépôt | Rôle | URL de déploiement |
|-------|------|--------------------|
| [MyDartTraining-client](https://github.com/ton-compte/MyDartTraining-client) | Front-end React/Vite | https://mydarttraining.fr |
| [MyDartTraining-server](https://github.com/ton-compte/MyDartTraining-server) | Back-end Node.js/Express | https://mydarttraining-fr-525230.hostingersite.com |

---

## Stack technique

### Front-end (`MyDartTraining-client`)
- React 18 + TypeScript + Vite
- Tailwind CSS
- Zustand (state management)
- Axios (appels API)
- React Router v6
- Socket.io-client

### Back-end (`MyDartTraining-server`)
- Node.js + Express + TypeScript
- Sequelize ORM + PostgreSQL
- Socket.io
- JWT + bcryptjs
- Passport.js + Google OAuth 2.0

---

## Lancer en local

### Prérequis
- Node.js >= 20
- PostgreSQL en cours d'exécution
- Base de données `mydarttraining` créée

### 1. Cloner les deux dépôts

```bash
git clone https://github.com/ton-compte/MyDartTraining-client.git
git clone https://github.com/ton-compte/MyDartTraining-server.git
```

### 2. Back-end

```bash
cd MyDartTraining-server
cp .env.example .env
# Remplir les valeurs dans .env
npm install
npm run dev
```

### 3. Front-end

```bash
cd MyDartTraining-client
cp .env.example .env.development
# Vérifier les URLs dans .env.development
npm install
npm run dev
```

L'application sera disponible sur http://localhost:5173

---

## Variables d'environnement

### MyDartTraining-server (`.env`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du serveur | `3000` |
| `NODE_ENV` | Environnement | `development` |
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nom de la base | `mydarttraining` |
| `DB_USER` | Utilisateur PostgreSQL | `postgres` |
| `DB_PASSWORD` | Mot de passe PostgreSQL | — |
| `JWT_SECRET` | Secret de signature JWT | — |
| `JWT_EXPIRES_IN` | Durée de validité du token | `7d` |
| `GOOGLE_CLIENT_ID` | ID OAuth Google | — |
| `GOOGLE_CLIENT_SECRET` | Secret OAuth Google | — |
| `GOOGLE_CALLBACK_URL` | URL de callback OAuth | `http://localhost:3000/api/auth/google/callback` |
| `CLIENT_URL` | URL du front-end | `http://localhost:5173` |

### MyDartTraining-client (`.env.development` / `.env.production`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de l'API back-end | `http://localhost:3000` |
| `VITE_SOCKET_URL` | URL Socket.io | `http://localhost:3000` |

---

## Routes API

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `POST` | `/api/auth/register` | Inscription | Non |
| `POST` | `/api/auth/login` | Connexion | Non |
| `GET` | `/api/auth/google` | OAuth Google | Non |
| `GET` | `/api/auth/google/callback` | Callback Google | Non |
| `GET` | `/api/auth/me` | Utilisateur connecté | JWT |
| `GET` | `/api/profiles` | Liste des profils | JWT |
| `POST` | `/api/profiles` | Créer un profil | JWT |
| `PUT` | `/api/profiles/:id` | Modifier un profil | JWT |
| `DELETE` | `/api/profiles/:id` | Supprimer un profil | JWT |

---

## 📋 Sommaire

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
  - [Authentification & Compte](#authentification--compte)
  - [Profils](#profils)
  - [Paramètres](#paramètres)
  - [Modes de jeu](#modes-de-jeu)
- [Modes de jeu détaillés](#modes-de-jeu-détaillés)
  - [Online](#online)
  - [Solo](#solo)
  - [Training](#training)

---

## Présentation

**MyDartTraining** est une application de jeu de fléchette en ligne permettant de jouer seul, entre amis ou contre d'autres joueurs du monde entier. Elle propose des modes compétitifs classiques, des sessions locales multi-profils ainsi qu'un ensemble d'outils d'entraînement pour progresser.

---

## Fonctionnalités

### Authentification & Compte

- Inscription avec : pseudo, adresse e-mail, mot de passe, photo de profil, etc.
- Connexion sécurisée au compte
- Gestion du compte (modification des informations, mot de passe, avatar, etc.)

---

### Profils

Chaque compte peut accueillir **jusqu'à 8 profils joueur**, permettant à plusieurs personnes de partager un même compte (famille, amis, etc.).

Chaque profil est personnalisable :
- Nom du profil (ex : Joueur 1, Alice, Papa…)
- Couleur associée
- Photo / avatar
- Statistiques propres à chaque profil

---

### Paramètres

- Paramètres de l'application (thème, affichage, langue, notifications…)
- Paramètres du compte (sécurité, confidentialité, gestion des profils…)

---

## Modes de jeu détaillés

### Online

Jouez en ligne contre d'autres joueurs en temps réel.

| Mode | Description |
|------|-------------|
| 301 | Partir de 301 et atteindre exactement 0 |
| 501 | Partir de 501 et atteindre exactement 0 |
| 701 | Partir de 701 et atteindre exactement 0 |
| Cricket | Fermer les cases 15 à 20 et le bull avant l'adversaire |
| Clock | Toucher les cases dans l'ordre de 1 à 20 |
| … | D'autres modes à venir |

---

### Solo

Jouez en local avec vos propres profils, sans connexion internet requise.

**Configurations de jeu disponibles :**

| Format | Exemple |
|--------|---------|
| 1 vs 1 | Duel classique |
| 1 vs 1 vs 1 | Trois joueurs chacun pour soi |
| 1 vs 1 vs 1 vs 1 | Quatre joueurs chacun pour soi |
| 2 vs 2 | Équipes de deux |
| 3 vs 3 | Équipes de trois |
| 4 vs 4 | Équipes de quatre |
| 2 vs 2 vs 2 vs 2 | Multiples équipes |
| … | Toutes combinaisons possibles |

Les mêmes modes de jeu que le mode Online sont disponibles (301, 501, 701, Cricket, Clock, etc.).

---

### Training

Mode dédié à la progression individuelle. Plusieurs sous-modes disponibles :

#### Modes classiques
Entraînement libre sur les modes de jeu standards (301, 501, Cricket, etc.) sans adversaire.

#### Statistiques
- Lancer un nombre défini de fléchettes
- Analyse de précision : secteurs visés vs. secteurs touchés
- Historique et évolution des performances

#### Dead On
- Un nombre est généré aléatoirement
- Le joueur doit atteindre exactement ce score avec ses fléchettes
- Variantes possibles : double out, triple in, combinaisons imposées, etc.

#### Autres jeux d'entraînement
- Exercices de précision sur des zones spécifiques (bull, triples, doubles…)
- Challenges chronométrés
- D'autres mini-jeux à définir

---

## 🚀 Roadmap

- [ ] Authentification & gestion des comptes
- [ ] Système de profils multiples
- [ ] Mode Solo multi-profils
- [ ] Mode Online multijoueur
- [ ] Module Training complet
- [ ] Classements & statistiques globales
- [ ] Application mobile (iOS / Android)

---

## 📄 Licence

À définir.
