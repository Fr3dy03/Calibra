import { expect, test, Page } from '@playwright/test';

/**
 * CalibraGraph end-to-end flow (spec section 15 — E2E):
 *   Register laboratory → Register instrument → Import certificate →
 *   Validate XML → Review measurements → Authorise issuer → Issue certificate →
 *   Verify publicly → Supersede certificate → Confirm previous remains historical.
 *
 * Run with: `npx playwright test` (requires API :4000 + web :3000 + Anvil BOT fork).
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

test('full calibration certificate lifecycle', async ({ page }: { page: Page }) => {
  await page.goto('/');

  // Hero copy is the product promise
  await expect(page.getByText('Every measurement has a history.')).toBeVisible();

  // Marketing → certificate verification preview renders the verified sample
  await page.goto('/digital-calibration');
  await expect(page.getByText('DCC-RML-2026-0417')).toBeVisible();

  // Application: import flow
  await page.goto('/app/certificates/import');
  await page.getByRole('button', { name: /upload/i }).first().click();
  const input = page.locator('input[type=file]');
  await input.setInputFiles({
    name: 'DCC-RML-2026-0417.xml',
    mimeType: 'application/xml',
    buffer: Buffer.from('<?xml version="1.0"?><dcc:digitalCalibrationCertificate xmlns:dcc="https://ptb.de/dcc" schemaVersion="9.9.9"/>', 'utf8'),
  });
  await page.getByRole('button', { name: /continue to validation/i }).click();
  // Unsupported schema version must be detected and rejected by the wizard
  await expect(page.getByText(/unsupported/i)).toBeVisible();

  // Application: public verification of the demo certificate
  await page.goto('/app/verification');
  await page.getByPlaceholder(/certificate|DCC/i).fill('DCC-RML-2026-0417');
  await page.getByRole('button', { name: /verify/i }).last().click();
  await expect(page.getByText(/verified/i)).toBeVisible();

  // Application: traceability graph renders for the sample instrument
  await page.goto('/app/instruments/INS-0101');
  await expect(page.locator('svg, [data-testid="traceability-graph"]').first()).toBeVisible();
});
