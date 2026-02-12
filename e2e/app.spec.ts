import { test, expect } from '@playwright/test'

test.describe('Vectorize app', () => {
  test('shows empty state and toolbar', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByText('Drop image here to vectorise')).toBeVisible()
    await expect(page.getByText('View vectorized version here')).toBeVisible()
    const toolbar = page.getByRole('toolbar', { name: 'Vectorize actions' })
    await expect(toolbar).toBeVisible()
    await expect(page.getByRole('button', { name: 'Toggle settings panel' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Download SVG' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Copy SVG to clipboard' })).toBeDisabled()
  })

  test('loads image and shows raster and SVG panes', async ({ page }) => {
    await page.goto('/')
    const fileInput = page.locator('.image-input-hidden-input')
    await fileInput.setInputFiles('e2e/fixtures/sample.png')
    await expect(page.getByText('Vectorizing…').or(page.getByRole('img', { name: 'Raster image viewport' })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('img', { name: 'Raster image viewport' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('img', { name: 'Vector SVG viewport' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: 'Download SVG' })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Copy SVG to clipboard' })).toBeEnabled()
  })

  test('opens settings and has controls', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Toggle settings panel' }).click()
    await expect(page.getByRole('dialog', { name: 'Vectorize settings' })).toBeVisible()
    await expect(page.getByLabel('Threshold')).toBeVisible()
    await expect(page.getByLabel('Canvas background color')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Clear canvas' })).toBeVisible()
  })

  test('download triggers and copy can be invoked', async ({ page, context }) => {
    await page.goto('/')
    const fileInput = page.locator('.image-input-hidden-input')
    await fileInput.setInputFiles('e2e/fixtures/sample.png')
    await expect(page.getByRole('button', { name: 'Download SVG' })).toBeEnabled({ timeout: 10000 })

    const downloadPromise = context.waitForEvent('download')
    await page.getByRole('button', { name: 'Download SVG' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('vectorized.svg')
    const path = await download.path()
    expect(path).toBeTruthy()

    await page.getByRole('button', { name: 'Copy SVG to clipboard' }).click()
    await expect(page.getByText('Copied to clipboard')).toBeVisible({ timeout: 3000 })
  })
})
