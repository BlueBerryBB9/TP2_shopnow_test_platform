const request = require("supertest");
const { expect } = require("chai");
const app = require("../../app/src/server");

describe("ShopNow - règles métier de l’application", () => {
  describe("Catalogue", () => {
    it("retourne le catalogue complet avec des produits valides", async () => {
      const res = await request(app).get("/api/products");

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array").that.is.not.empty;
      res.body.forEach((product) => {
        expect(product).to.include.all.keys("id", "name", "price", "category");
        expect(product.id).to.be.a("number").above(0);
        expect(product.name).to.be.a("string").and.not.empty;
        expect(product.price).to.be.a("number").at.least(0);
      });
    });

    it("retourne le produit demandé pour un identifiant valide", async () => {
      const res = await request(app).get("/api/products/1");

      expect(res.status).to.equal(200);
      expect(res.body).to.include({
        id: 1,
        name: 'Laptop Pro 14"',
        category: "Informatique",
      });
      expect(res.body.price).to.equal(1299.99);
    });

    it("accepte la valeur minimale valide d’un identifiant", async () => {
      const res = await request(app).get("/api/products/1");

      expect(res.status).to.equal(200);
      expect(res.body.id).to.equal(1);
    });

    it("refuse un produit inexistant", async () => {
      const res = await request(app).get("/api/products/999999");

      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({ error: "Produit introuvable" });
    });

    it("refuse un identifiant vide ou non numérique", async () => {
      const res = await request(app).get("/api/products/not-a-number");

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal("Produit introuvable");
    });
  });

  describe("Inscription", () => {
    const validUser = () => ({
      firstName: "Test",
      lastName: "User",
      email: `test-${Date.now()}-${Math.random()}@shopnow.test`,
      password: "Password123!",
    });

    it("crée un compte avec des données valides", async () => {
      const user = validUser();
      const res = await request(app).post("/api/register").send(user);

      expect(res.status).to.equal(201);
      expect(res.body.message).to.equal("Compte créé avec succès");
      expect(res.body.user).to.include({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
      expect(res.body.user).not.to.have.property("password");
    });

    ["firstName", "lastName", "email", "password"].forEach((field) => {
      it(`refuse l’absence du champ obligatoire ${field}`, async () => {
        const user = validUser();
        delete user[field];

        const res = await request(app).post("/api/register").send(user);

        expect(res.status).to.equal(400);
        expect(res.body.error).to.equal("Tous les champs sont obligatoires");
      });
    });

    it("accepte un mot de passe de 8 caractères, la longueur minimale", async () => {
      const user = validUser();
      user.password = "12345678";

      const res = await request(app).post("/api/register").send(user);

      expect(res.status).to.equal(201);
    });

    it("refuse un mot de passe de 7 caractères", async () => {
      const user = validUser();
      user.password = "1234567";

      const res = await request(app).post("/api/register").send(user);

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal(
        "Le mot de passe doit contenir au moins 8 caractères",
      );
    });

    it("refuse un email déjà utilisé sans tenir compte de la casse", async () => {
      const user = validUser();
      await request(app).post("/api/register").send(user);

      const res = await request(app)
        .post("/api/register")
        .send({
          ...user,
          email: user.email.toUpperCase(),
        });

      expect(res.status).to.equal(409);
      expect(res.body.error).to.equal("Un compte existe déjà avec cet email");
    });
  });

  describe("Connexion", () => {
    it("connecte le compte de démonstration avec des identifiants valides", async () => {
      const res = await request(app).post("/api/login").send({
        email: "student@shopnow.test",
        password: "Password123!",
      });

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Connexion réussie");
      expect(res.body.user).to.include({
        id: 1,
        email: "student@shopnow.test",
      });
      expect(res.body.user).not.to.have.property("password");
    });

    it("accepte un email valide quelle que soit sa casse", async () => {
      const res = await request(app).post("/api/login").send({
        email: "STUDENT@SHOPNOW.TEST",
        password: "Password123!",
      });

      expect(res.status).to.equal(200);
    });

    it("refuse un mot de passe incorrect", async () => {
      const res = await request(app).post("/api/login").send({
        email: "student@shopnow.test",
        password: "wrong-password",
      });

      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Email ou mot de passe incorrect");
    });

    it("refuse un email inexistant ou vide", async () => {
      const res = await request(app).post("/api/login").send({
        email: "",
        password: "",
      });

      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Email ou mot de passe incorrect");
    });
  });
});
