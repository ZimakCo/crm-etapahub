import { expect, test } from "@playwright/test"

test("contacts filters are integrated and update live", async ({ page }) => {
  await page.goto("/contacts")

  await expect(page.getByTestId("contacts-filter-bar")).toBeVisible()
  await expect(page.getByRole("button", { name: "Filters" })).toHaveCount(0)

  await page.getByTestId("contacts-filter-subscription").click()
  await page.getByRole("option", { name: "Subscribed", exact: true }).click()

  await expect(page.getByText("Subscription: subscribed")).toBeVisible()
  await expect(page.getByText("1 active")).toBeVisible()

  await page.getByTestId("contacts-filter-reset").click()

  await expect(page.getByText("Subscription: subscribed")).toHaveCount(0)
})
