# Implementation Plan: Workshop Feedback App

## Overview

This plan implements a React + TypeScript feedback application backed by AWS Amplify Gen 2 (AppSync + DynamoDB). The work progresses from environment setup and backend configuration, through validation utilities and UI components, to integration wiring. Property-based tests use fast-check with Vitest.

## Tasks

- [x] 1. Set up Node.js version guards and Amplify hosting config
  - [x] 1.1 Create Node.js version enforcement files
    - Create `.nvmrc` file at project root containing `20`
    - Add `engines` field to `package.json`: `"engines": { "node": ">=20 <21" }`
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 1.2 Create `amplify.yml` build configuration
    - Create `amplify.yml` at project root with preBuild phase running `nvm install 20`, `nvm use 20`, `node -v`, and `npm ci`
    - Set build command to `npm run build`
    - Set `baseDirectory` to `dist`
    - _Requirements: 1.3, 6.1, 6.2, 6.3, 6.4_

- [x] 2. Configure Amplify Gen 2 backend
  - [x] 2.1 Create Amplify backend definition
    - Create `amplify/backend.ts` that imports and registers auth and data resources
    - _Requirements: 2.1, 2.3_

  - [x] 2.2 Create auth resource with guest access
    - Create `amplify/auth/resource.ts` with `defineAuth` enabling email login and guest access via identity pool
    - _Requirements: 2.3, 2.4_

  - [x] 2.3 Create data resource with Feedback model
    - Create `amplify/data/resource.ts` defining `Feedback` model with fields: `name` (string, required), `rating` (integer, required), `comment` (string, required)
    - Set authorization to `allow.guest()` for create and read operations
    - Set `defaultAuthorizationMode` to `'iam'`
    - Export `Schema` type for client-side type generation
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 2.4 Install Amplify dependencies
    - Install `aws-amplify` and `@aws-amplify/backend` packages
    - Install `@aws-amplify/backend-cli` as dev dependency
    - _Requirements: 2.1_

- [x] 3. Checkpoint - Verify backend configuration
  - Ensure all files compile without TypeScript errors, ask the user if questions arise.

- [x] 4. Implement validation utilities
  - [x] 4.1 Create validation functions
    - Create `src/utils/validation.ts` with pure functions: `validateName`, `validateRating`, `validateComment`, `isFormValid`
    - `validateName`: accepts strings with ≥1 non-whitespace char and ≤100 total chars
    - `validateRating`: accepts integers in [1, 5] only
    - `validateComment`: accepts strings with ≥1 non-whitespace char and ≤500 total chars
    - `isFormValid`: returns true iff all three validators pass
    - Each validator returns `undefined` if valid, or an error message string if invalid
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ]* 4.2 Write property test: text field validation (Property 1)
    - **Property 1: Text field validation accepts only valid inputs**
    - Generate random strings with fast-check; verify `validateName` accepts iff 1 ≤ trimmed length and total length ≤ 100
    - Verify `validateComment` accepts iff 1 ≤ trimmed length and total length ≤ 500
    - Minimum 100 iterations
    - **Validates: Requirements 4.1, 4.3**

  - [ ]* 4.3 Write property test: rating validation (Property 2)
    - **Property 2: Rating validation accepts only integers 1 through 5**
    - Generate random numbers (integers, floats, negatives, nulls) with fast-check; verify `validateRating` accepts iff value is integer in [1, 5]
    - Minimum 100 iterations
    - **Validates: Requirements 2.2, 4.2**

  - [ ]* 4.4 Write property test: form validity (Property 3)
    - **Property 3: Submit button enabled iff all fields are valid**
    - Generate random form states (name, rating, comment tuples) with fast-check; verify `isFormValid` returns true iff all individual validators return undefined
    - Minimum 100 iterations
    - **Validates: Requirements 4.5**

- [x] 5. Implement FeedbackForm component
  - [x] 5.1 Create FeedbackForm component
    - Create `src/components/FeedbackForm.tsx` accepting `onFeedbackSubmitted` prop
    - Render name input (text, maxLength 100), rating selector (1–5 buttons or select), comment textarea (maxLength 500)
    - Integrate validation utils for inline error display next to invalid fields
    - Disable submit button when form is invalid or submission is in progress
    - On submit: call Amplify Data `client.models.Feedback.create()`; show saving indicator
    - On success: clear form fields, call `onFeedbackSubmitted` with created entry
    - On failure: show error message, preserve field values
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.4, 4.5_

  - [ ]* 5.2 Write property test: successful submission clears form (Property 4)
    - **Property 4: Successful submission clears form state**
    - Generate valid feedback entries with fast-check; mock successful Amplify save; verify form resets to empty state (name="", rating=null, comment="")
    - Minimum 100 iterations
    - **Validates: Requirements 3.4**

  - [ ]* 5.3 Write property test: failed submission preserves form (Property 5)
    - **Property 5: Failed submission preserves form state**
    - Generate valid feedback entries with fast-check; mock failed Amplify save; verify form retains all entered values
    - Minimum 100 iterations
    - **Validates: Requirements 3.5**

- [x] 6. Implement FeedbackList component
  - [x] 6.1 Create FeedbackList component
    - Create `src/components/FeedbackList.tsx` accepting `entries`, `isLoading`, and `error` props
    - Show loading indicator when `isLoading` is true
    - Show error message when `error` is set
    - Show empty state message when entries is empty and not loading
    - Render each entry with: name, numeric rating (1–5), comment, and locale-formatted date/time
    - Entries displayed in order provided (caller ensures newest-first)
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 6.2 Write property test: entry display contains all fields (Property 6)
    - **Property 6: Feedback entry display contains all required fields**
    - Generate random feedback objects with fast-check; render FeedbackList; verify rendered output contains name, rating, comment, and formatted date
    - Minimum 100 iterations
    - **Validates: Requirements 5.3**

  - [ ]* 6.3 Write property test: list ordering is newest first (Property 7)
    - **Property 7: Feedback list ordering is newest first**
    - Generate random lists of entries with distinct timestamps; verify rendered order is strictly descending by createdAt
    - Minimum 100 iterations
    - **Validates: Requirements 5.4**

- [x] 7. Checkpoint - Verify components compile and render
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Wire everything together in App
  - [x] 8.1 Configure Amplify client in main.tsx
    - Import and call `Amplify.configure()` with the generated `amplify_outputs.json` config in `src/main.tsx`
    - _Requirements: 2.4_

  - [x] 8.2 Integrate components in App.tsx
    - Replace existing template content in `src/App.tsx`
    - Create Amplify Data client with `generateClient<Schema>()`
    - Manage state: `entries`, `isLoading`, `error`
    - On mount: fetch all Feedback entries sorted by `createdAt` descending, set loading/error states
    - Render `FeedbackForm` with `onFeedbackSubmitted` that prepends new entry to local list
    - Render `FeedbackList` with entries, loading, and error state
    - _Requirements: 5.1, 5.4, 5.7_

  - [x] 8.3 Add app-level CSS for layout
    - Update `src/App.css` with layout styles for form and list sections
    - Ensure accessible contrast ratios and responsive layout
    - _Requirements: 3.1, 5.3_

- [x] 9. Set up test infrastructure
  - [x] 9.1 Install testing dependencies
    - Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `fast-check` as dev dependencies
    - Configure Vitest in `vite.config.ts` with jsdom environment
    - Create test setup file for `@testing-library/jest-dom` matchers
    - _Requirements: (testing infrastructure)_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The Amplify sandbox (`npx ampx sandbox`) must be running during development to test backend integration
- `amplify_outputs.json` is auto-generated by the Amplify sandbox and should be gitignored

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.4"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["4.1", "9.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4"] },
    { "id": 4, "tasks": ["5.1", "6.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "6.2", "6.3"] },
    { "id": 6, "tasks": ["8.1", "8.2", "8.3"] }
  ]
}
```
