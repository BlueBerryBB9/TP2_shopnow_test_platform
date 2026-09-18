# ShopNow — Plateforme pédagogique Tests + SonarQube + Jenkins

Mini site e-commerce JavaScript/Node.js destiné à un TP de tests logiciels. Le dépôt est volontairement **partiellement testé** : les apprenants doivent écrire et enrichir les tests.

## 1. Objectifs pédagogiques

- Comprendre les tests unitaires, d'intégration et E2E.
- Écrire des tests avec Mocha + Chai.
- Tester une API avec Supertest.
- Automatiser le navigateur avec Selenium WebDriver.
- Mesurer couverture et qualité avec SonarQube.
- Exécuter la chaîne de tests avec Jenkins.
- Travailler par fork GitLab et Pull/Merge Request.

## 2. Démarrage rapide

### Option A — lancer l'application avec Node.js

```bash
npm install
npm start
```

Application : http://localhost:8081

### Option B — lancer les services

```bash
docker compose up -d --build
```

- ShopNow : http://localhost:8081
- SonarQube : http://localhost:9000
- Jenkins : http://localhost:8080

Les identifiants SonarQube par défaut d'une installation neuve sont généralement `admin/admin` et Jenkins affiche son mot de passe initial dans ses logs. À vérifier au premier démarrage.

## 3. Tests déjà présents

Le dépôt contient seulement quelques tests de démarrage :

- `tests/unit/smoke.test.js`
- `tests/integration/api.test.js`
- `tests/e2e/navigation.test.js`

Ils sont volontairement simples. **Le travail des apprenants consiste à faire monter progressivement la couverture et la qualité des tests.**

## 4. Commandes

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage
```

Pour Selenium, l'application doit être accessible sur `http://localhost:8081` et Firefox doit être disponible sur la machine exécutant le test.

## 5. Compte de démonstration

- Email : `student@shopnow.test`
- Mot de passe : `Password123!`

## 6. Travail demandé

### Niveau 1 — Tests unitaires

Ajouter des tests sur les règles métier et fonctions JavaScript.

### Niveau 2 — Tests API

Tester :

- `/api/health`
- `GET /api/products`
- `GET /api/products/:id`
- cas produit inexistant
- `/api/login`
- succès et échec de connexion

### Niveau 3 — Tests fonctionnels Selenium

Créer des scénarios couvrant :

1. Accueil → Produits
2. Produits → détail produit
3. Ajouter un produit au panier
4. Modifier une quantité
5. Vérifier le total
6. Supprimer un produit
7. Vérifier panier vide
8. Connexion réussie
9. Connexion refusée

Utiliser prioritairement les `data-testid` documentés dans `docs/data-testids.md`.

### Niveau 4 — Qualité SonarQube

- Lancer les tests.
- Produire la couverture.
- Connecter le projet à SonarQube.
- Analyser bugs, code smells, duplications et couverture.
- Corriger progressivement les problèmes.

### Niveau 5 — Jenkins

Configurer un pipeline qui :

1. récupère le code,
2. installe les dépendances,
3. lance les tests,
4. génère la couverture,
5. lance l'analyse SonarQube,
6. publie le résultat du pipeline.

## 7. Preuve des tests et de la régression

La suite couvre les tests unitaires, les tests d'intégration API et les tests E2E avec Chrome.

### Détection d'une régression

Pour vérifier que les tests détectent réellement une erreur, le prix du produit `Laptop Pro 14"` a été temporairement modifié de `1299.99` à `40` dans `app/src/server.js`.

Commande exécutée :

```bash
npx mocha "tests/integration/application.test.js" --grep "produit demandé" --timeout 10000
```

Résultat observé :

```text
0 passing
1 failing
expected price 1299.99, but got 40
```

Le test a donc correctement détecté la régression. Le prix a ensuite été restauré à `1299.99`.

### Validation finale

Commande exécutée après restauration :

```bash
npm test
```

Résultat observé :

```text
37 passing
```

La validation finale inclut les tests unitaires, les tests d'intégration API et les deux scénarios E2E Chrome.

## 8. Challenge final

Atteindre une couverture de tests significative sans modifier artificiellement le code uniquement pour faire monter le pourcentage. Chaque test doit vérifier un comportement utile.

## 9. MDP SonarQube

sonarqube : admin -> admins

sonarqube-token : squ_fd93aa11ed80900527e84f06627e66f63bf558b1

set this as sonarqube host in jenkins : http://sonarqube:9000

## Réponse aux questions

