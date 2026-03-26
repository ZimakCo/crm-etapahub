import { expect, test } from "@playwright/test"

test("outreach workspace uses dedicated seller routes and navigation", async ({ page }) => {
  await page.goto("/outreach")

  await expect(page).toHaveURL(/\/outreach\/emails$/)
  await expect(page.getByTestId("outreach-page")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Emails" })).toBeVisible()
  await expect(page.getByText("Manage personal mailboxes")).toBeVisible()
  await expect(page.getByText("Email workspace")).toBeVisible()

  const workspaceNav = page.getByTestId("outreach-section-nav")

  await workspaceNav.locator('a[href="/outreach/tasks"]').click()
  await expect(page).toHaveURL(/\/outreach\/tasks$/)
  await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible()
  await expect(page.getByText("Seller task queue")).toBeVisible()

  await workspaceNav.locator('a[href="/outreach/sequences"]').click()
  await expect(page).toHaveURL(/\/outreach\/sequences$/)
  await expect(page.getByText("Sequence library")).toBeVisible()

  await workspaceNav.locator('a[href="/outreach/templates"]').click()
  await expect(page).toHaveURL(/\/outreach\/templates$/)
  await expect(page.getByText("Seller template library")).toBeVisible()
})
