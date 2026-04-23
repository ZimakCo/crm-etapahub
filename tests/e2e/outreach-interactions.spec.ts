import { expect, test } from "@playwright/test"

test("outreach tasks can be created and completed without sending email", async ({ page }) => {
  const suffix = Date.now().toString().slice(-6)
  const title = `QA outreach task ${suffix}`

  await page.goto("/outreach/tasks?newTask=1")

  await page.locator("#outreach-task-title").fill(title)
  await page.getByRole("button", { name: "Create task" }).last().click()

  await expect(page.getByRole("button", { name: title })).toBeVisible()
  await page.getByRole("button", { name: "Complete" }).click()
  await expect(page.getByTestId("selected-task-status")).toHaveText("completed")
})
