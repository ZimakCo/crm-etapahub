import { expect, test } from "@playwright/test"

test("contacts support custom tags and keep pagination visible", async ({ page }) => {
  const suffix = Date.now()
  const customTag = `qa-tag-${suffix}`
  const email = `qa-contact-${suffix}@example.com`

  await page.goto("/contacts/new")

  await page.getByLabel("First name").fill("QA")
  await page.getByLabel("Last name").fill(`Tag ${suffix}`)
  await page.getByLabel("Email").fill(email)
  await page.getByTestId("new-contact-tags-input").fill(customTag)
  await page.getByRole("button", { name: "Create Tag" }).click()
  await expect(page.getByText(customTag, { exact: true })).toBeVisible()

  await page.getByRole("button", { name: "Save Contact" }).click()
  await expect(page).toHaveURL(/\/contacts$/)

  await expect(page.getByTestId("contacts-pagination")).toBeVisible()
  await page.getByTestId("contacts-search-input").fill(email)
  await page.getByTestId("contacts-filter-tag-query").fill(customTag)

  await expect(page.getByText(email, { exact: true })).toBeVisible()
  await expect(page.getByText(`Tag: ${customTag}`)).toBeVisible()
})
