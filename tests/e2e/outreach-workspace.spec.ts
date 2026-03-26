import { expect, test } from "@playwright/test"

test("outreach workspace uses dedicated seller routes and navigation", async ({ page }) => {
  await page.goto("/outreach")

  await expect(page).toHaveURL(/\/outreach\/emails$/)
  await expect(page.getByTestId("outreach-page")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Emails" })).toBeVisible()
  await expect(page.getByText("Manage personal mailboxes")).toBeVisible()
  await expect(page.getByText("Email workspace")).toBeVisible()

  const workspace = page.getByTestId("outreach-page")

  await workspace.getByRole("link", { name: "Tasks", exact: true }).click()
  await expect(page).toHaveURL(/\/outreach\/tasks$/)
  await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible()
  await expect(page.getByText("Seller task queue")).toBeVisible()

  await workspace.getByRole("link", { name: "Sequences", exact: true }).click()
  await expect(page).toHaveURL(/\/outreach\/sequences$/)
  await expect(page.getByText("Sequence library")).toBeVisible()

  await workspace.getByRole("link", { name: "Templates", exact: true }).click()
  await expect(page).toHaveURL(/\/outreach\/templates$/)
  await expect(page.getByText("Seller template library")).toBeVisible()
})
