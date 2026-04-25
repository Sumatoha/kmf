import { expect, test } from "@playwright/test";

test.describe("public surface", () => {
  test("landing renders hero, features, bots, pricing", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Управляйте клинингом/i })).toBeVisible();
    await expect(page.getByText("CRM и два Telegram-бота")).toBeVisible();
    await expect(page.getByRole("link", { name: /Начать бесплатно/i }).first()).toHaveAttribute(
      "href",
      "/signup",
    );
    // Sections are anchor-linked from the nav.
    for (const id of ["features", "how", "bots", "pricing", "faq"]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test("/signup shows the registration form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Регистрация компании" })).toBeVisible();
    await expect(page.getByPlaceholder("BlueSparkle Cleaning")).toBeVisible();
    await expect(page.getByPlaceholder("you@company.com")).toBeVisible();
    await expect(page.getByRole("button", { name: /Создать компанию/ })).toBeVisible();
  });

  test("/login shows the login form and links to signup", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Вход в систему" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Зарегистрировать компанию/ })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  test("dark theme persists across navigation", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.dataset.theme = "dark";
      localStorage.setItem("cleanops.theme", "dark");
    });
    await page.goto("/login");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});
