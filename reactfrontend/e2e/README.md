# E2E Tests for Job Management

This directory contains Playwright end-to-end tests for the job management application.

## Tests Included

The comprehensive test suite covers:

1. **Job Creation**: Creates a new job and verifies it appears in the list with initial PENDING status
2. **Status Updates**: Updates job status from PENDING to RUNNING and verifies the change
3. **Status History**: Verifies that the status history modal contains both previous and current statuses
4. **Multiple Status Changes**: Tests multiple status transitions and verifies complete history
5. **Failed Status**: Tests updating to FAILED status and verifies history
6. **Complex Transitions**: Tests various status transition scenarios including recovery patterns
7. **Cancel Operations**: Verifies that canceling status updates maintains original status
8. **UI Validation**: Tests that same-status updates are properly disabled
9. **Modal Details**: Verifies job details display correctly in status modals

## Available Status Transitions

The tests cover transitions between all available statuses:
- PENDING (initial status)
- RUNNING
- COMPLETED
- FAILED

## Running the Tests

### Prerequisites
1. Make sure the Django backend is running
2. Make sure the Next.js frontend is running on http://localhost:3000

### Commands
```bash
# Run all tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Features

- **Unique Job Names**: Each test uses timestamped job names to avoid conflicts
- **Cross-Browser**: Tests run on Chromium, Firefox, and WebKit
- **Status History Validation**: Verifies that status updates create proper history records
- **UI State Verification**: Checks modal states, button states, and form validation
- **Error Handling**: Tests cancel operations and validation scenarios

## Configuration

The tests are configured in `playwright.config.ts` with:
- Automatic server startup
- Trace collection on retry
- HTML reporter
- Base URL configuration

## Test Structure

Each test follows this pattern:
1. Navigate to the application
2. Create or interact with jobs
3. Verify UI states and data persistence
4. Validate status history and transitions
5. Clean up by closing modals/completing flows