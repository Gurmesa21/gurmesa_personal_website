import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('MediaPicker Component E2E', () => {
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  test.beforeEach(async ({ page }) => {
    // 1. Log in to admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('pick-existing and upload-then-pick flows in MediaPicker modal', async ({ page }) => {
    // 2. Navigate to Service Create form which uses MediaPicker
    await page.goto('/admin/services/new');
    await page.waitForLoadState('networkidle');

    // Verify there is only one "Select media file" button for the media field
    const triggerBtn = page.locator('[data-testid="select-media-file-btn"]');
    await expect(triggerBtn).toBeVisible();

    // Verify no embedded media grid is visible prior to opening the modal
    await expect(page.locator('[data-testid="modal-media-card"]')).toBeHidden();

    // --- FLOW 1: PICK EXISTING ---
    // Open the modal
    await triggerBtn.click();

    // Verify modal elements are visible: central library dialog, search, and upload button
    const modalTitle = page.locator('text=Media Library — Select Media File');
    await expect(modalTitle).toBeVisible();
    await expect(page.locator('input[placeholder*="Search media"]')).toBeVisible();
    await expect(page.locator('button:has-text("Upload New File")')).toBeVisible();

    // If existing media cards exist, select the first one
    const mediaCards = page.locator('[data-testid="modal-media-card"]');
    const cardCount = await mediaCards.count();

    if (cardCount > 0) {
      await mediaCards.first().click();
      // Confirm selection in the dialog footer
      const confirmBtn = page.locator('button:has-text("Select Media File")').last();
      await confirmBtn.click();

      // Modal closes and form shows selected media preview
      await expect(modalTitle).toBeHidden();
      await expect(triggerBtn).toHaveText(/Change Media File/i);
    } else {
      // Close modal if no existing items
      await page.click('button:has-text("Back to Form")');
      await expect(modalTitle).toBeHidden();
    }

    // --- FLOW 2: UPLOAD-THEN-PICK ---
    // Re-open the modal
    await triggerBtn.click();
    await expect(modalTitle).toBeVisible();

    // Create a unique temporary test image
    const uniqueFileName = `picker-upload-${Date.now()}.png`;
    const tempFilePath = path.join(process.cwd(), 'tests', 'e2e', uniqueFileName);
    fs.writeFileSync(tempFilePath, Buffer.from(pngBase64, 'base64'));

    try {
      // Upload via file input
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(tempFilePath);

      // Verify upload spinner/feedback
      await expect(page.locator('text=Uploading...').first()).toBeVisible();
      await expect(page.locator('text=Uploading...').first()).toBeHidden({ timeout: 15000 });

      // Confirm modal footer shows asset selected and confirm selection
      const confirmBtn = page.locator('button:has-text("Select Media File")').last();
      await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
      await confirmBtn.click();

      // Verify modal closes
      await expect(modalTitle).toBeHidden();

      // Verify form preview now shows the uploaded asset's filename
      await expect(page.locator(`text=${uniqueFileName}`)).toBeVisible();
      await expect(triggerBtn).toHaveText(/Change Media File/i);
    } finally {
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch {
        // Ignore EBUSY on Windows file locks from browser
      }
    }
  });
});
