import { expect, test } from "@playwright/test"

test("outreach beta page loads the client-facing mockup", async ({ page }) => {
  await page.goto("/outreach-beta")

  await expect(page.getByTestId("outreach-beta-page")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Apollo-style Outreach Workspace" })).toBeVisible()
  await expect(page.getByText("Client demo mockup")).toBeVisible()
  await expect(page.getByText("1:1 Email Composer")).toBeVisible()
  await expect(page.getByText("Sequences Core")).toBeVisible()
  await expect(page.getByText("Contact Communication Logic")).toBeVisible()
})
