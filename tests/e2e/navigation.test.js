const { Builder, By, Browser, until } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
const { expect } = require("chai");

describe("E2E - navigation ShopNow", function () {
  this.timeout(40000);

  let driver;

  before(async function () {
    driver = await new Builder().forBrowser(Browser.CHROME).build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("doit réaliser un parcours utilisateur complet", async function () {
    await driver.get("http://localhost:8081");
    await driver.executeScript("window.localStorage.clear();");
    await driver.navigate().refresh();

    const homeLink = await driver.wait(
      until.elementLocated(By.css('[data-testid="home-link"]')),
      10000,
    );
    expect(await homeLink.isDisplayed()).to.equal(true);
    expect(await driver.getTitle()).to.contain("ShopNow");

    const loginLink = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-link"]')),
      10000,
    );
    await loginLink.click();

    const loginForm = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-form"]')),
      10000,
    );
    expect(await loginForm.isDisplayed()).to.equal(true);
    await driver.findElement(By.css('[data-testid="login-submit"]')).click();

    await driver.wait(until.urlContains("products"), 10000);

    const productsPage = await driver.wait(
      until.elementLocated(By.css('[data-testid="products-page"]')),
      10000,
    );
    expect(await productsPage.isDisplayed()).to.equal(true);

    const productLink = await driver.wait(
      until.elementLocated(By.css('[data-testid="view-product-1"]')),
      10000,
    );
    await productLink.click();

    const productPage = await driver.wait(
      until.elementLocated(By.css('[data-testid="product-page"]')),
      10000,
    );
    expect(await productPage.isDisplayed()).to.equal(true);
    expect(
      await driver
        .findElement(By.css('[data-testid="product-name"]'))
        .getText(),
    ).to.equal('Laptop Pro 14"');

    await driver.findElement(By.css('[data-testid="add-to-cart-1"]')).click();
    await driver.switchTo().alert().accept();

    const cartLink = await driver.wait(
      until.elementLocated(By.css('[data-testid="cart-link"]')),
      10000,
    );
    await cartLink.click();

    const cart = await driver.wait(
      until.elementLocated(By.css('[data-testid="cart"]')),
      10000,
    );
    expect(await cart.isDisplayed()).to.equal(true);
    expect(
      await driver.findElement(By.css('[data-testid="quantity-1"]')).getText(),
    ).to.equal("1");

    await driver.findElement(By.css('[data-testid="increase-1"]')).click();
    const quantity = await driver.wait(
      until.elementLocated(By.css('[data-testid="quantity-1"]')),
      10000,
    );
    await driver.wait(until.elementTextIs(quantity, "2"), 10000);
    expect(await quantity.getText()).to.equal("2");

    const total = await driver
      .findElement(By.css('[data-testid="cart-total"]'))
      .getText();
    expect(total.replace(/\s/g, "")).to.include("2599,98");

    await driver.findElement(By.css('[data-testid="remove-item-1"]')).click();
    const emptyCart = await driver.wait(
      until.elementLocated(By.css('[data-testid="empty-cart"]')),
      10000,
    );
    expect(await emptyCart.isDisplayed()).to.equal(true);

    console.log(
      "Parcours E2E réussi : connexion, produit, panier, quantité, total et suppression.",
    );
  });

  it("doit refuser une connexion avec un mauvais mot de passe", async function () {
    await driver.get("http://localhost:8081/login.html");
    await driver.executeScript("window.localStorage.clear();");

    const loginForm = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-form"]')),
      10000,
    );
    expect(await loginForm.isDisplayed()).to.equal(true);

    const password = await driver.findElement(
      By.css('[data-testid="login-password"]'),
    );
    await password.clear();
    await password.sendKeys("mauvais-mot-de-passe");
    await driver.findElement(By.css('[data-testid="login-submit"]')).click();

    const message = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-message"]')),
      10000,
    );
    await driver.wait(
      until.elementTextIs(message, "Email ou mot de passe incorrect"),
      10000,
    );

    expect(await message.getText()).to.equal("Email ou mot de passe incorrect");
    expect(await driver.getCurrentUrl()).to.include("login.html");
    console.log("Scénario E2E négatif réussi : connexion refusée.");
  });
});
