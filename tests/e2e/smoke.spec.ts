import { expect, test } from "@playwright/test"

test("dashboard and contacts routes load", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("Recent CRM Activity")).toBeVisible()

  await page.goto("/contacts")
  await expect(page.getByRole("heading", { name: "Contacts" })).toBeVisible()
  await expect(page.getByTestId("contacts-filter-bar")).toBeVisible()
})
