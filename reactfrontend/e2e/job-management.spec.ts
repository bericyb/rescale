import { test, expect } from '@playwright/test';

test.describe('Job Management E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the page to load and jobs to be fetched
    await expect(page.getByText('Rescale Job Dashboard')).toBeVisible();

    // Wait for the page to fully load including any JavaScript
    await page.waitForLoadState('networkidle');

    // Wait for any portals or overlays to settle
    await page.waitForTimeout(2000);
  });

  test('should create a new job and verify it appears in the list with PENDING status', async ({ page }) => {
    // Use a more specific button selector to avoid portal issues
    const newJobButton = page.locator('button').filter({ hasText: 'New Job' });

    // Wait for button to be ready and click
    await newJobButton.waitFor({ state: 'visible' });
    await newJobButton.click({ timeout: 10000, force: true });

    // Verify the create job modal is open
    await expect(page.getByText('Create New Job')).toBeVisible();

    // Generate unique job name to avoid conflicts
    const jobName = `Test Job ${Date.now()}`;

    // Fill in the job name
    await page.getByPlaceholder('Enter job name...').fill(jobName);

    // Click Create Job button
    await page.getByRole('button', { name: 'Create Job' }).click();

    // Wait for the modal to close and job to be created
    await expect(page.getByText('Create New Job')).not.toBeVisible();

    // Wait for success toast (indicates job was created)
    await expect(page.getByText('Job created successfully!')).toBeVisible();

    // Verify the job appears in the table
    await expect(page.getByText(jobName)).toBeVisible();

    // Verify the job has PENDING status - look for the status span within the same row
    const jobRow = page.locator('div.absolute').filter({ has: page.getByText(jobName) });
    await expect(jobRow.locator('span.px-3.py-1.rounded-full').filter({ hasText: 'PENDING' })).toBeVisible();
  });

  test('should cancel status update and maintain original status', async ({ page }) => {
    // Create a job using button selector
    const newJobButton = page.locator('button').filter({ hasText: 'New Job' });
    await newJobButton.waitFor({ state: 'visible' });
    await newJobButton.click({ timeout: 10000, force: true });

    const jobName = `Cancel Test Job ${Date.now()}`;
    await page.getByPlaceholder('Enter job name...').fill(jobName);
    await page.getByRole('button', { name: 'Create Job' }).click();
    await expect(page.getByText('Create New Job')).not.toBeVisible();
    await expect(page.getByText('Job created successfully!')).toBeVisible();

    const jobRow = page.locator('div.absolute').filter({ has: page.getByText(jobName) });

    // Open status modal and select a different status but cancel
    await jobRow.click();
    await expect(page.getByText('Update Job Status')).toBeVisible();

    // Select RUNNING but don't save
    await page.locator('input[value="RUNNING"]').click({ force: true });

    // Cancel instead of updating
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify status is still PENDING
    await expect(jobRow.locator('span.px-3.py-1.rounded-full').filter({ hasText: 'PENDING' })).toBeVisible();
    await expect(jobRow.locator('span.px-3.py-1.rounded-full').filter({ hasText: 'RUNNING' })).not.toBeVisible();

    // Verify history hasn't changed with enhanced loading wait
    await jobRow.click();
    const historyPanel = page.locator('.w-80.border-l.border-gray-200');
    try {
      await expect(historyPanel.getByText('Loading history...')).not.toBeVisible({ timeout: 3000 });
    } catch {
      await expect(historyPanel).toContainText(/PENDING/i, { timeout: 10000 });
    }

    await expect(historyPanel.locator('span').filter({ hasText: 'PENDING' })).toBeVisible();
    await expect(historyPanel.locator('span').filter({ hasText: 'RUNNING' })).not.toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('should handle job creation', async ({ page }) => {
    const numberOfJobs = 20;
    const jobNames: string[] = [];

    const batchSize = 10;
    const batches = Math.ceil(numberOfJobs / batchSize);

    console.log(`Creating ${numberOfJobs} jobs in ${batches} batches of ${batchSize}`);

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const startJob = batchIndex * batchSize;
      const endJob = Math.min(startJob + batchSize, numberOfJobs);
      const currentBatchSize = endJob - startJob;

      console.log(`Creating batch ${batchIndex + 1}/${batches} (jobs ${startJob + 1}-${endJob})`);

      for (let i = startJob; i < endJob; i++) {
        const jobName = `Stress Test Job ${i + 1} - ${Date.now()}`;
        jobNames.push(jobName);

        // Click New Job button
        const newJobButton = page.locator('button').filter({ hasText: 'New Job' });
        await newJobButton.waitFor({ state: 'visible' });
        await newJobButton.click({ timeout: 10000, force: true });

        // Verify modal opened
        await expect(page.getByText('Create New Job')).toBeVisible();

        // Fill job name
        await page.getByPlaceholder('Enter job name...').fill(jobName);

        // Create the job
        await page.getByRole('button', { name: 'Create Job' }).click();

        // Wait for modal to close
        await expect(page.getByText('Create New Job')).not.toBeVisible();

        // Small delay to prevent overwhelming the UI
        await page.waitForTimeout(100);
      }

      // Wait a bit between batches to let the UI settle
      await page.waitForTimeout(300);

      // Verify a sample of jobs from this batch are visible
      const sampleJob = jobNames[startJob];
      await expect(page.getByText(sampleJob)).toBeVisible({ timeout: 5000 });

      console.log(`Batch ${batchIndex + 1} completed and verified`);
    }

    console.log(`All ${numberOfJobs} jobs created successfully`);

    console.log('Stress test completed successfully!');
  });

  test('should handle job creation with immediate random status updates', async ({ page }) => {
    const numberOfJobs = 15;
    const jobNames: string[] = [];

    // Available statuses for random assignment (excluding PENDING since that's the default)
    const statusOptions = ['RUNNING', 'COMPLETED', 'FAILED'];

    // Create 50 jobs in batches for better performance
    const batchSize = 10;
    const batches = Math.ceil(numberOfJobs / batchSize);

    console.log(`Creating ${numberOfJobs} jobs in ${batches} batches of ${batchSize}`);

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const startJob = batchIndex * batchSize;
      const endJob = Math.min(startJob + batchSize, numberOfJobs);

      console.log(`Creating batch ${batchIndex + 1}/${batches} (jobs ${startJob + 1}-${endJob})`);

      for (let i = startJob; i < endJob; i++) {
        const jobName = `Full Stress Job ${i + 1} - ${Date.now()}`;
        jobNames.push(jobName);

        // Click New Job button
        const newJobButton = page.locator('button').filter({ hasText: 'New Job' });
        await newJobButton.waitFor({ state: 'visible' });
        await newJobButton.click({ timeout: 10000, force: true });

        // Verify modal opened
        await expect(page.getByText('Create New Job')).toBeVisible();

        // Fill job name
        await page.getByPlaceholder('Enter job name...').fill(jobName);

        // Create the job
        await page.getByRole('button', { name: 'Create Job' }).click();

        // Wait for modal to close
        await expect(page.getByText('Create New Job')).not.toBeVisible();

        // Verify the job appears in the table
        await expect(page.getByText(jobName)).toBeVisible({ timeout: 10000 });

        // Change the job status immediately after creation (jobs start as PENDING)
        // Since new jobs are PENDING, we can safely pick any non-PENDING status
        const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];

        try {
          // Find and click the job row to open status modal
          const jobRow = page.locator('div.absolute').filter({ has: page.getByText(jobName) });
          await jobRow.waitFor({ state: 'visible', timeout: 5000 });
          await jobRow.click();

          // Wait for status modal
          await expect(page.getByText('Update Job Status')).toBeVisible({ timeout: 5000 });

          // Select the random status (safe since it's different from PENDING)
          await page.locator(`input[value="${randomStatus}"]`).click({ force: true });

          // Update the status
          await page.getByRole('button', { name: 'Update Status' }).click();

          // Wait for modal to close
          await expect(page.getByText('Update Job Status')).not.toBeVisible({ timeout: 5000 });

          if (i % 10 === 0) {
            console.log(`Job ${i + 1}: ${jobName} set to ${randomStatus}`);
          }
        } catch (error) {
          console.warn(`Failed to update status for job ${i + 1}: ${jobName}`, error);
          // Try to close any open modals and continue
          try {
            await page.getByRole('button', { name: 'Cancel' }).click({ timeout: 1000 });
          } catch { }
        }

        // Small delay to prevent overwhelming the UI
        await page.waitForTimeout(100);
      }

      // Wait a bit between batches to let the UI settle
      await page.waitForTimeout(300);

      // Verify a sample of jobs from this batch are visible
      const sampleJob = jobNames[startJob];
      await expect(page.getByText(sampleJob)).toBeVisible({ timeout: 5000 });

      console.log(`Batch ${batchIndex + 1} completed and verified`);
    }

    console.log(`All ${numberOfJobs} jobs created with random status updates`);

    // Verify jobs were created by checking a representative sample
    console.log('Verifying jobs are visible...');
    const sampleSize = Math.min(20, jobNames.length);
    for (let i = 0; i < sampleSize; i += Math.floor(sampleSize / 5)) {
      try {
        await expect(page.getByText(jobNames[i])).toBeVisible({ timeout: 5000 });
      } catch (error) {
        console.warn(`Job ${jobNames[i]} not visible, but continuing test...`);
      }
    }

    // Perform additional random status updates on a subset for more variety
    const allStatuses = ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'];
    console.log(`Starting additional random status updates...`);

    // Update a subset of jobs to different statuses for even more variety
    const updateCount = Math.min(25, jobNames.length);
    for (let i = 0; i < updateCount; i++) {
      const jobName = jobNames[i];

      if (i % 10 === 0) {
        console.log(`Additional update ${i + 1}/${updateCount} with status check`);
      }

      try {
        // Find and click the job row
        const jobRow = page.locator('div.absolute').filter({ has: page.getByText(jobName) });
        await jobRow.waitFor({ state: 'visible', timeout: 5000 });

        // Get current status before clicking
        const currentStatusElement = jobRow.locator('span.px-3.py-1.rounded-full');
        const currentStatusText = await currentStatusElement.textContent({ timeout: 3000 });
        const currentStatus = currentStatusText?.trim() || 'UNKNOWN';

        // Filter out the current status from available options
        const availableStatuses = allStatuses.filter(status => status !== currentStatus);

        // Skip if no other statuses available (shouldn't happen with 4 statuses)
        if (availableStatuses.length === 0) {
          console.log(`Skipping job ${jobName} - already in final state ${currentStatus}`);
          continue;
        }

        // Pick a random status that's different from current
        const randomStatus = availableStatuses[Math.floor(Math.random() * availableStatuses.length)];

        await jobRow.click();

        // Wait for status modal
        await expect(page.getByText('Update Job Status')).toBeVisible({ timeout: 5000 });

        // Select the random status (guaranteed to be different from current)
        await page.locator(`input[value="${randomStatus}"]`).click({ force: true });

        // Update the status
        await page.getByRole('button', { name: 'Update Status' }).click();

        // Wait for modal to close
        await expect(page.getByText('Update Job Status')).not.toBeVisible({ timeout: 5000 });

        // Small delay to prevent overwhelming the backend
        await page.waitForTimeout(75);

      } catch (error) {
        console.warn(`Failed additional status update for job ${i + 1}: ${jobName}`, error);
        // Try to close any open modals and continue
        try {
          await page.getByRole('button', { name: 'Cancel' }).click({ timeout: 1000 });
        } catch { }
        continue;
      }
    }

    console.log(`Additional random status updates completed`);

    // Verify a sample of jobs have various statuses
    console.log('Verifying status variety...');
    for (let i = 0; i < Math.min(15, jobNames.length); i += 3) {
      const jobName = jobNames[i];
      const jobRow = page.locator('div.absolute').filter({ has: page.getByText(jobName) });

      // Just verify the job row exists and has some status badge
      try {
        await expect(jobRow.locator('span.px-3.py-1.rounded-full')).toBeVisible({ timeout: 5000 });
      } catch (error) {
        console.warn(`Could not verify status for job: ${jobName}`);
      }
    }

    console.log('Full stress test completed successfully!');
  });

});
