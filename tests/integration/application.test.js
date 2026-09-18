const request = require("supertest");
const { expect } = require("chai");
const app = require("../../app/src/server");

describe("ShopNow - tests d’intégration API", () => {
  describe("Défi supplémentaire - tests négatifs", () => {
    it("refuse un identifiant produit égal à zéro", async () => {
      // Entrée : GET /api/products/0
      // Attendu : le produit est considéré comme inexistant.
      const response = await request(app).get("/api/products/0");

      // Observé : l’API retourne 404 avec un message d’erreur explicite.
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property("error", "Produit introuvable");
    });

    it("refuse une connexion avec un email inconnu", async () => {
      // Entrée : email absent de la base, avec un mot de passe quelconque.
      const response = await request(app).post("/api/login").send({
        email: "utilisateur-inconnu@shopnow.test",
        password: "Password123!",
      });

      // Attendu et observé : aucune session n’est créée et l’API retourne 401.
      expect(response.status).to.equal(401);
      expect(response.body).to.have.property(
        "error",
        "Email ou mot de passe incorrect",
      );
    });

    it("refuse une inscription avec une donnée incorrecte", async () => {
      // Entrée : mot de passe de 7 caractères au lieu de 8 minimum.
      const response = await request(app)
        .post("/api/register")
        .send({
          firstName: "Negative",
          lastName: "Test",
          email: `negative-${Date.now()}@shopnow.test`,
          password: "1234567",
        });

      // Attendu et observé : l’inscription est refusée avec le code 400.
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property(
        "error",
        "Le mot de passe doit contenir au moins 8 caractères",
      );
    });
  });

  describe("GET /api/health", () => {
    it("retourne 200 et le statut de santé de l’application", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("status", "ok");
    });
  });

  describe("GET /api/products", () => {
    it("retourne 200 et la liste des produits", async () => {
      const response = await request(app).get("/api/products");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array").that.is.not.empty;
      expect(response.body[0]).to.include.all.keys(
        "id",
        "name",
        "price",
        "category",
      );
    });
  });

  describe("GET /api/products/:id", () => {
    it("retourne 200 et le produit demandé avec un identifiant valide", async () => {
      const response = await request(app).get("/api/products/1");

      expect(response.status).to.equal(200);
      expect(response.body).to.include({
        id: 1,
        name: 'Laptop Pro 14"',
        category: "Informatique",
      });
      expect(response.body).to.have.property("price", 1299.99);
    });

    it("retourne 404 pour un identifiant inexistant", async () => {
      const response = await request(app).get("/api/products/999999");

      expect(response.status).to.equal(404);
      expect(response.body).to.deep.equal({ error: "Produit introuvable" });
    });

    it("retourne 404 pour un identifiant non numérique", async () => {
      const response = await request(app).get("/api/products/invalide");

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property("error", "Produit introuvable");
    });
  });

  describe("POST /api/register", () => {
    it("retourne 201 et les données du compte créé", async () => {
      const user = {
        firstName: "Integration",
        lastName: "Test",
        email: `integration-${Date.now()}@shopnow.test`,
        password: "Password123!",
      };
      const response = await request(app).post("/api/register").send(user);

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property(
        "message",
        "Compte créé avec succès",
      );
      expect(response.body.user).to.include({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
      expect(response.body.user).not.to.have.property("password");
    });

    it("retourne 400 lorsqu’un champ obligatoire est absent", async () => {
      const response = await request(app).post("/api/register").send({
        firstName: "Integration",
        lastName: "Test",
        password: "Password123!",
      });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property(
        "error",
        "Tous les champs sont obligatoires",
      );
    });

    it("retourne 400 lorsqu’un champ obligatoire est vide", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({
          firstName: "",
          lastName: "Test",
          email: `empty-${Date.now()}@shopnow.test`,
          password: "Password123!",
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property(
        "error",
        "Tous les champs sont obligatoires",
      );
    });

    it("retourne 400 lorsque le mot de passe est trop court", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({
          firstName: "Integration",
          lastName: "Test",
          email: `short-${Date.now()}@shopnow.test`,
          password: "1234567",
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property(
        "error",
        "Le mot de passe doit contenir au moins 8 caractères",
      );
    });

    it("retourne 409 lorsqu’un email est déjà utilisé", async () => {
      const user = {
        firstName: "Existing",
        lastName: "User",
        email: `duplicate-${Date.now()}@shopnow.test`,
        password: "Password123!",
      };
      await request(app).post("/api/register").send(user);

      const response = await request(app).post("/api/register").send(user);

      expect(response.status).to.equal(409);
      expect(response.body).to.have.property(
        "error",
        "Un compte existe déjà avec cet email",
      );
    });
  });

  describe("POST /api/login", () => {
    it("retourne 200 et l’utilisateur avec des identifiants valides", async () => {
      const response = await request(app).post("/api/login").send({
        email: "student@shopnow.test",
        password: "Password123!",
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("message", "Connexion réussie");
      expect(response.body.user).to.include({
        id: 1,
        email: "student@shopnow.test",
      });
      expect(response.body.user).not.to.have.property("password");
    });

    it("retourne 401 avec un mot de passe incorrect", async () => {
      const response = await request(app).post("/api/login").send({
        email: "student@shopnow.test",
        password: "mot-de-passe-invalide",
      });

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property(
        "error",
        "Email ou mot de passe incorrect",
      );
    });

    it("retourne 401 lorsque les paramètres de connexion sont absents", async () => {
      const response = await request(app).post("/api/login").send({});

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property(
        "error",
        "Email ou mot de passe incorrect",
      );
    });
  });

  describe("Routes inexistantes", () => {
    it("retourne 404 pour une route API inconnue", async () => {
      const response = await request(app).get("/api/route-inexistante");

      expect(response.status).to.equal(404);
    });

    it("retourne la page d’accueil pour une route web inconnue", async () => {
      const response = await request(app).get("/page-inconnue");

      expect(response.status).to.equal(200);
      expect(response.text).to.include("ShopNow");
    });
  });
});
