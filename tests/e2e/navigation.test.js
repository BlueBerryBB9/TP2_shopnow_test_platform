const { Builder, By, Browser, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { expect } = require('chai');

describe('E2E - navigation ShopNow', function () {
    this.timeout(30000);

    let driver;

    before(async function () {
        driver = await new Builder().forBrowser(Browser.CHROME).build();
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    it('doit accéder à la page des produits', async function () {

        // Ouvrir ShopNow
        await driver.get('http://localhost:8081');

        // Attendre le lien Produits
        const productsLink = await driver.wait(
            until.elementLocated(
                By.css('[data-testid="products-link"]')
            ),
            10000
        );

        // Vérifier qu'il est visible
        await driver.wait(
            until.elementIsVisible(productsLink),
            10000
        );

        // Cliquer sur Produits
        await productsLink.click();

        // Attendre l'URL
        await driver.wait(
            until.urlContains('products'),
            10000
        );

        // Attendre la page Produits
        const productsPage = await driver.wait(
            until.elementLocated(
                By.css('[data-testid="products-page"]')
            ),
            10000
        );

        // Vérifier que la page est visible
        await driver.wait(
            until.elementIsVisible(productsPage),
            10000
        );

        // Assertions
        expect(await productsPage.isDisplayed()).to.equal(true);

        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('products');
    });
});