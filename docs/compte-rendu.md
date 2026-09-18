# Compte rendu - Tests ShopNow

## Informations

- **Nom :** Leroy Martin
- **URL :** https://github.com/BlueBerryBB9/TP2_shopnow_test_platform

## Tests ajoutés

### Tests unitaires

Fichier : `tests/unit/frontend.test.js`

Les fonctions frontend suivantes sont testées :

- lecture et écriture de l'utilisateur dans `localStorage` ;
- authentification et protection des pages ;
- panier vide ou stockage invalide ;
- ajout d'un produit ;
- regroupement des produits identiques ;
- augmentation et suppression d'une quantité ;
- suppression d'un produit ;
- formatage des prix ;
- succès et erreur de l'appel API ;
- ajout au panier par un visiteur non connecté.

### Tests d'intégration API

Fichier : `tests/integration/application.test.js`

Les routes couvertes sont :

- `GET /api/health` ;
- `GET /api/products` ;
- `GET /api/products/:id` ;
- `POST /api/register` ;
- `POST /api/login` ;
- route API inexistante ;
- route web inconnue.

Les cas valides et invalides sont couverts : produit inexistant, identifiant non numérique ou nul, champ absent, champ vide, mot de passe trop court, email dupliqué, email inconnu, mauvais mot de passe et paramètres absents.

### Tests E2E

Fichier : `tests/e2e/navigation.test.js`

Deux scénarios sont automatisés avec Selenium et Chrome :

1. **Parcours utilisateur complet** : accueil, connexion, catalogue, détail produit, ajout au panier, modification de quantité, vérification du total, suppression et vérification du panier vide.
2. **Connexion incorrecte** : saisie d'un mauvais mot de passe, vérification du message d'erreur et vérification du maintien sur la page de connexion.

Les tests utilisent des sélecteurs `data-testid` et des attentes explicites avec `until`.

## Couverture

- **Couverture initiale :** environ `47,5 %`.
- **Couverture intermédiaire :** `88,88 %` puis `91,11 %` selon les itérations.
- **Couverture finale :** `95,55 %` des instructions, `95,83 %` des branches et `94,87 %` des lignes sur `server.js`.
- Les seules lignes restantes correspondent au démarrage direct du serveur avec `app.listen()`, non exécuté lorsque l'application est importée par Supertest.

Commande utilisée :

```bash
npm run test:coverage
```

## Tableau de suivi

| Étape       | Tests ajoutés                                 |    Coverage | Jenkins         | SonarQube       |
| ----------- | --------------------------------------------- | ----------: | --------------- | --------------- |
| Départ      | 0                                             |    ≈ 47,5 % | —               | —               |
| Itération 1 | Tests API de base et tests unitaires frontend |     88,88 % | Non exécuté     | Non exécuté     |
| Itération 2 | Tests invalides, erreurs API et panier        |     91,11 % | Non exécuté     | Non exécuté     |
| Itération 3 | Tests négatifs et fallback des routes         |     95,55 % | Non exécuté     | Non exécuté     |
| Itération 4 | Deuxième scénario E2E                         |     95,55 % | Non exécuté     | Non exécuté     |
| **Final**   | **37 tests au total**                         | **95,55 %** | **Non exécuté** | **Non exécuté** |

## Résultats Jenkins

Aucun résultat Jenkins n'a été exécuté ou vérifié dans l'environnement de travail.

À compléter après exécution du pipeline :

- statut du build ;
- nombre de tests réussis et échoués ;
- rapport de couverture publié ;
- résultat de l'analyse SonarQube.

## Analyse SonarQube

Aucune analyse SonarQube n'a été exécutée ou vérifiée dans l'environnement de travail. Le projet contient toutefois la configuration `sonar-project.properties` et les services Docker prévus par le TP.

À compléter après analyse :

- bugs ;
- vulnérabilités ;
- code smells ;
- duplications ;
- couverture affichée par SonarQube ;
- qualité globale du projet.

## Difficultés rencontrées

- Le frontend est un script navigateur global et n'est pas directement importable comme un module Node.js.
- Les fonctions frontend dépendent de `localStorage`, `location`, `document`, `window` et `fetch`.
- Le serveur Express démarre avec `app.listen()` uniquement lorsqu'il est exécuté directement, ce qui explique les lignes non couvertes avec Supertest.
- Selenium nécessite Chrome, une application démarrée sur le port `8081` et des attentes explicites pour éviter les tests instables.
- Les montants français contiennent parfois des espaces insécables dans le texte récupéré par Selenium.

## Solutions apportées

- Création d'un contexte navigateur minimal avec `node:vm` pour tester les fonctions frontend sans ouvrir de navigateur.
- Simulation de `localStorage` avec une `Map` et simulation de `fetch` pour tester les réponses API.
- Utilisation de Supertest pour tester l'application Express sans démarrer un serveur séparé.
- Utilisation de `data-testid` et de `until.elementLocated`, `until.elementTextIs` et `until.urlContains` dans les tests E2E.
- Nettoyage du `localStorage` au début du parcours E2E pour rendre les tests reproductibles.
- Vérification d'une régression volontaire sur le prix d'un produit : le test a échoué avec `expected price 1299.99, but got 40`, puis tous les tests sont repassés après restauration.

## Validation finale

Commande exécutée :

```bash
npm test
```

Résultat observé :

```text
37 passing
```

## Logs npm run test:coverage

npm run test:coverage
npm notice run shopnow-test-platform@1.0.0 test:coverage
npm notice run nyc --reporter=lcov --reporter=text mocha "tests/unit/**/*.test.js" "tests/integration/**/*.test.js" --timeout 10000


  Frontend - fonctions logiques ShopNow
    ✔ retourne null quand aucun utilisateur n’est enregistré
    ✔ retourne null si les données utilisateur sont invalides
    ✔ enregistre et relit un utilisateur valide
    ✔ redirige vers la connexion quand une page protégée est visitée sans session
    ✔ autorise l’accès quand un utilisateur est connecté
    ✔ retourne un panier vide si le stockage est vide ou invalide
    ✔ ajoute un nouveau produit avec une quantité initiale de 1
    ✔ redirige vers la connexion si un visiteur ajoute un produit
    ✔ augmente la quantité au lieu de dupliquer un produit
    ✔ supprime un article quand sa quantité atteint zéro
    ✔ ne modifie pas le panier pour un identifiant inconnu
    ✔ supprime uniquement le produit demandé
    ✔ formate un prix nul et un prix décimal en euros
    ✔ retourne les données de l’API quand la réponse est valide
    ✔ lève l’erreur fournie par l’API quand la réponse est invalide

  Smoke test - apprentissage
    ✔ doit réussir un premier test

  API - exemple de test
    ✔ GET /api/health doit retourner 200

  ShopNow - tests d’intégration API
    GET /api/health
      ✔ retourne 200 et le statut de santé de l’application
    GET /api/products
      ✔ retourne 200 et la liste des produits
    GET /api/products/:id
      ✔ retourne 200 et le produit demandé avec un identifiant valide
      ✔ retourne 404 pour un identifiant inexistant
      ✔ retourne 404 pour un identifiant non numérique
    POST /api/register
      ✔ retourne 201 et les données du compte créé
      ✔ retourne 400 lorsqu’un champ obligatoire est absent
      ✔ retourne 400 lorsqu’un champ obligatoire est vide
      ✔ retourne 400 lorsque le mot de passe est trop court
      ✔ retourne 409 lorsqu’un email est déjà utilisé
    POST /api/login
      ✔ retourne 200 et l’utilisateur avec des identifiants valides
      ✔ retourne 401 avec un mot de passe incorrect
      ✔ retourne 401 lorsque les paramètres de connexion sont absents
    Routes inexistantes
      ✔ retourne 404 pour une route API inconnue
      ✔ retourne la page d’accueil pour une route web inconnue


  32 passing (210ms)

-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------|---------|----------|---------|---------|-------------------
All files  |   95.55 |    95.83 |      90 |   94.87 |                   
 server.js |   95.55 |    95.83 |      90 |   94.87 | 121-122           
-----------|---------|----------|---------|---------|-------------------