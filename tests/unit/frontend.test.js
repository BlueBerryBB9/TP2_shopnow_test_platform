const fs = require("node:fs");
const vm = require("node:vm");
const { expect } = require("chai");

const frontendCode = fs.readFileSync(
  require.resolve("../../app/public/app.js"),
  "utf8",
);

function createFrontend() {
  const storage = new Map();
  const context = {
    alert: () => {},
    location: { pathname: "/products.html", href: "" },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key),
    },
    document: {
      addEventListener: () => {},
      querySelector: () => null,
    },
    window: {},
    Intl,
    fetch: () => Promise.reject(new Error("fetch non configure")),
  };

  vm.createContext(context);
  vm.runInContext(frontendCode, context);
  return {
    ShopNow: vm.runInContext("ShopNow", context),
    context,
    storage,
  };
}

describe("Frontend - fonctions logiques ShopNow", () => {
  it("retourne null quand aucun utilisateur n’est enregistré", () => {
    const { ShopNow } = createFrontend();

    expect(ShopNow.getUser()).to.equal(null);
    expect(ShopNow.isAuthenticated()).to.equal(false);
  });

  it("retourne null si les données utilisateur sont invalides", () => {
    const { ShopNow, storage } = createFrontend();
    storage.set("shopnow_user", "json invalide");

    expect(ShopNow.getUser()).to.equal(null);
    expect(ShopNow.isAuthenticated()).to.equal(false);
  });

  it("enregistre et relit un utilisateur valide", () => {
    const { ShopNow } = createFrontend();
    const user = { id: 1, firstName: "Demo", email: "demo@test.fr" };

    ShopNow.setUser(user);

    expect(ShopNow.getUser()).to.deep.equal(user);
    expect(ShopNow.isAuthenticated()).to.equal(true);
  });

  it("redirige vers la connexion quand une page protégée est visitée sans session", () => {
    const { ShopNow, context } = createFrontend();

    expect(ShopNow.requireAuth()).to.equal(false);
    expect(context.location.href).to.equal(
      "/login.html?redirect=%2Fproducts.html",
    );
  });

  it("autorise l’accès quand un utilisateur est connecté", () => {
    const { ShopNow } = createFrontend();
    ShopNow.setUser({ id: 1, firstName: "Demo" });

    expect(ShopNow.requireAuth()).to.equal(true);
  });

  it("retourne un panier vide si le stockage est vide ou invalide", () => {
    const { ShopNow, storage } = createFrontend();

    expect(ShopNow.getCart()).to.deep.equal([]);
    storage.set("shopnow_cart", "json invalide");
    expect(ShopNow.getCart()).to.deep.equal([]);
  });

  it("ajoute un nouveau produit avec une quantité initiale de 1", () => {
    const { ShopNow } = createFrontend();
    ShopNow.setUser({ id: 1 });

    ShopNow.addToCart({ id: 10, name: "Produit", price: 12.5 });

    expect(ShopNow.getCart()).to.deep.equal([
      { id: 10, name: "Produit", price: 12.5, quantity: 1 },
    ]);
  });

  it("redirige vers la connexion si un visiteur ajoute un produit", () => {
    const { ShopNow, context } = createFrontend();

    ShopNow.addToCart({ id: 10, name: "Produit", price: 12.5 });

    expect(context.location.href).to.equal(
      "/login.html?redirect=%2Fproducts.html",
    );
    expect(ShopNow.getCart()).to.deep.equal([]);
  });

  it("augmente la quantité au lieu de dupliquer un produit", () => {
    const { ShopNow } = createFrontend();
    ShopNow.setUser({ id: 1 });
    ShopNow.addToCart({ id: 10, name: "Produit", price: 12.5 });

    ShopNow.addToCart({ id: 10, name: "Produit", price: 12.5 });

    expect(ShopNow.getCart()).to.have.lengthOf(1);
    expect(ShopNow.getCart()[0].quantity).to.equal(2);
    expect(ShopNow.cartCount()).to.equal(2);
  });

  it("supprime un article quand sa quantité atteint zéro", () => {
    const { ShopNow } = createFrontend();
    ShopNow.setUser({ id: 1 });
    ShopNow.addToCart({ id: 10, name: "Produit", price: 12.5 });

    ShopNow.updateQuantity(10, -1);

    expect(ShopNow.getCart()).to.deep.equal([]);
    expect(ShopNow.cartCount()).to.equal(0);
  });

  it("ne modifie pas le panier pour un identifiant inconnu", () => {
    const { ShopNow } = createFrontend();
    ShopNow.saveCart([{ id: 10, quantity: 1 }]);

    ShopNow.updateQuantity(999, 1);

    expect(ShopNow.getCart()).to.deep.equal([{ id: 10, quantity: 1 }]);
  });

  it("supprime uniquement le produit demandé", () => {
    const { ShopNow } = createFrontend();
    ShopNow.saveCart([
      { id: 10, quantity: 1 },
      { id: 11, quantity: 2 },
    ]);

    ShopNow.removeFromCart(10);

    expect(ShopNow.getCart()).to.deep.equal([{ id: 11, quantity: 2 }]);
  });

  it("formate un prix nul et un prix décimal en euros", () => {
    const { ShopNow } = createFrontend();

    expect(ShopNow.formatPrice(0)).to.match(/0,00/);
    expect(ShopNow.formatPrice(12.5)).to.match(/12,50/);
    expect(ShopNow.formatPrice(12.5)).to.match(/€/);
  });

  it("retourne les données de l’API quand la réponse est valide", async () => {
    const { ShopNow, context } = createFrontend();
    const payload = { status: "ok" };
    context.fetch = async (url, options) => ({
      ok: true,
      json: async () => payload,
      url,
      options,
    });

    const result = await ShopNow.api("/api/health");

    expect(result).to.deep.equal(payload);
  });

  it("lève l’erreur fournie par l’API quand la réponse est invalide", async () => {
    const { ShopNow, context } = createFrontend();
    context.fetch = async () => ({
      ok: false,
      json: async () => ({ error: "Produit introuvable" }),
    });

    try {
      await ShopNow.api("/api/products/999");
      expect.fail("ShopNow.api aurait dû lever une erreur");
    } catch (error) {
      expect(error.message).to.equal("Produit introuvable");
    }
  });
});
