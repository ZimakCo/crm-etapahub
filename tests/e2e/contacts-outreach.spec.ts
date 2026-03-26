import { expect, test } from "@playwright/test"

test("contacts persist outreach status and filter by it", async ({ page }) => {
  const suffix = Date.now()
  const email = `qa-outreach-${suffix}@example.com`

  await page.goto("/contacts/new")

  await page.getByLabel("First name").fill("QA")
  await page.getByLabel("Last name").fill(`Outreach ${suffix}`)
  await page.getByLabel("Email").fill(email)
  await page.getByTestId("new-contact-outreach-status").click()
  await page.getByRole("option", { name: "Interested", exact: true }).click()
  await page.getByRole("button", { name: "Save Contact" }).click()

  await expect(page).toHaveURL(/\/contacts$/, { timeout: 10000 })

  await page.getByTestId("contacts-search-input").fill(email)
  await page.getByTestId("contacts-filter-outreach").click()
  await page.getByRole("option", { name: "Interested", exact: true }).click()

  await expect(page.getByText(`Outreach: interested`)).toBeVisible({ timeout: 10000 })
  await expect(page.getByText(email, { exact: true })).toBeVisible({ timeout: 10000 })
  await expect(page.getByRole("table").getByText("Interested", { exact: true })).toBeVisible({ timeout: 10000 })
})
