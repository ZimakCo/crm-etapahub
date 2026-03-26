import { expect, test } from "@playwright/test"

const routes = [
  "/",
  "/contacts",
  "/contacts/new",
  "/contacts/import",
  "/companies",
  "/companies/new",
  "/campaigns",
  "/campaigns/new",
  "/broadcasts",
  "/broadcasts/new",
  "/segments",
  "/segments/new",
  "/templates",
  "/templates/new",
  "/events",
  "/events/new",
  "/registrations",
  "/registrations/new",
  "/billing",
  "/billing/new",
  "/settings",
  "/metrics",
  "/domains",
  "/webhooks",
  "/suppressions",
  "/help",
  "/outreach-beta",
]

test("core static routes return 200 and render the main shell", async ({ page }) => {
  for (const route of routes) {
    const response = await page.goto(route)

    expect(response, `missing response for ${route}`).not.toBeNull()
    expect(response?.status(), `unexpected status for ${route}`).toBeLessThan(400)
    await expect(page.locator("main").first()).toBeVisible()
    await expect(page.getByText("Application error")).toHaveCount(0)
    await expect(page.getByText("This page could not be found")).toHaveCount(0)
  }
})
