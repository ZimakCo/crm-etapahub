import { expect, test } from "@playwright/test"

test("outreach page loads the client-facing workspace", async ({ page }) => {
  await page.goto("/outreach")

  await expect(page.getByTestId("outreach-page")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Outreach" })).toBeVisible()
  await expect(page.getByText("Manage mailboxes")).toBeVisible()
  await expect(page.getByText("Email activity")).toBeVisible()

  await page.getByRole("tab", { name: "Tasks" }).click()
  await expect(page.getByText("Follow-up tasks", { exact: true })).toBeVisible()

  await page.getByRole("tab", { name: "Templates" }).click()
  await expect(page.getByText("Outreach templates", { exact: true })).toBeVisible()
})
