# Requirements Document

## Introduction

A simple Workshop Feedback App for a 90-minute AWS Amplify workshop. The app allows workshop participants to submit feedback (name, rating, comment) after the session. Feedback is persisted via AWS Amplify Data and displayed on the same page for all participants to see. The project uses React, TypeScript, Vite, and AWS Amplify Gen 2, targeting Node.js 20 LTS.

## Glossary

- **Feedback_App**: The React single-page application that collects and displays workshop feedback
- **Feedback_Form**: The UI component containing input fields for name, rating, and comment, plus a submit button
- **Feedback_List**: The UI component that loads and displays all previously submitted feedback entries
- **Amplify_Data**: The AWS Amplify Gen 2 Data layer (backed by AppSync and DynamoDB) that stores feedback records
- **Feedback_Model**: The data model representing a single feedback entry with name, rating, comment, and createdAt fields
- **Rating**: An integer value from 1 to 5 representing the participant's satisfaction level
- **Node_Guard**: Configuration files (.nvmrc, package.json engines) that enforce Node.js 20 LTS compatibility

## Requirements

### Requirement 1: Node.js Version Compatibility

**User Story:** As a developer, I want the project to enforce Node.js 20 LTS compatibility, so that Amplify backend CLI commands run without top-level await issues.

#### Acceptance Criteria

1. THE Feedback_App SHALL include a `.nvmrc` file at the project root specifying the major version `20`
2. THE Feedback_App SHALL include an `engines` field in `package.json` restricting Node.js to version 20 (>=20 <21)
3. WHEN deployed to AWS Amplify Hosting, THE Feedback_App SHALL include an `amplify.yml` file with a preBuild phase that runs `nvm use 20` to activate Node.js version 20
4. IF a developer runs `npm install` with a Node.js version outside the range >=20 <21, THEN THE Feedback_App SHALL cause npm to exit with a non-zero status code and display an error message indicating the required Node.js version range and the currently detected version

### Requirement 2: Amplify Data Backend Configuration

**User Story:** As a developer, I want a properly configured Amplify Gen 2 backend with a Feedback data model, so that feedback entries are stored securely in the cloud.

#### Acceptance Criteria

1. THE Amplify_Data SHALL define a Feedback_Model with fields: name (string, required, maximum 100 characters), rating (integer, required), comment (string, required, maximum 500 characters), and createdAt (datetime, automatically set to the server-side creation timestamp)
2. THE Amplify_Data SHALL enforce that the rating field accepts only integer values from 1 to 5
3. THE Amplify_Data SHALL allow unauthenticated (guest) users to perform create and read operations on Feedback_Model entries, and SHALL deny update and delete operations for all users
4. THE Amplify_Data SHALL NOT expose AWS credentials in client-side code
5. IF a create operation is submitted with a rating value outside the range 1 to 5, THEN THE Amplify_Data SHALL reject the request and return an error indicating the validation failure

### Requirement 3: Feedback Submission

**User Story:** As a workshop participant, I want to submit my name, rating, and comment, so that I can share my workshop experience.

#### Acceptance Criteria

1. THE Feedback_Form SHALL display input fields for name (text, maximum 100 characters), rating (selection from 1 to 5), and comment (text, maximum 500 characters)
2. WHEN the participant enters a name, selects a rating, and enters a comment and submits, THE Feedback_Form SHALL save the entry to Amplify_Data
3. WHILE the feedback is being saved, THE Feedback_Form SHALL display a saving indicator and disable the submit button to prevent duplicate submissions
4. WHEN feedback is saved successfully, THE Feedback_Form SHALL clear all input fields and display the new entry in the Feedback_List
5. IF the save operation fails, THEN THE Feedback_Form SHALL display an error message indicating that the submission was unsuccessful and retain all entered field values so the participant can retry without re-entering data

### Requirement 4: Feedback Form Validation

**User Story:** As a workshop participant, I want the form to prevent incomplete submissions, so that all feedback entries are meaningful.

#### Acceptance Criteria

1. THE Feedback_Form SHALL require the name field to contain at least 1 non-whitespace character and no more than 100 characters before submission
2. THE Feedback_Form SHALL require a rating selection (1 to 5) before submission
3. THE Feedback_Form SHALL require the comment field to contain at least 1 non-whitespace character and no more than 500 characters before submission
4. WHEN the participant attempts to submit with missing or invalid fields, THE Feedback_Form SHALL display a validation message next to each invalid field indicating what is required
5. WHILE any required field is empty or invalid, THE Feedback_Form SHALL keep the submit button disabled

### Requirement 5: Feedback Display

**User Story:** As a workshop participant, I want to see all submitted feedback on the page, so that I can read what others thought of the workshop.

#### Acceptance Criteria

1. WHEN the page loads, THE Feedback_List SHALL fetch all existing Feedback_Model entries from Amplify_Data and display them within 5 seconds
2. WHILE feedback entries are loading, THE Feedback_List SHALL display a visible loading indicator in the feedback list area
3. THE Feedback_List SHALL display each entry showing name, rating (as the numeric value 1 to 5), comment, and submission time formatted as a locale-appropriate date and time string
4. THE Feedback_List SHALL order entries by creation time with the most recent entry displayed first
5. IF loading feedback entries fails, THEN THE Feedback_List SHALL display an error message on the page indicating that feedback could not be loaded and suggesting the participant refresh the page
6. IF no feedback entries exist, THEN THE Feedback_List SHALL display a message indicating that no feedback has been submitted yet
7. WHEN a new Feedback_Model entry is successfully saved via the Feedback_Form, THE Feedback_List SHALL immediately display the new entry without requiring a full page reload

### Requirement 6: Amplify Hosting Build Configuration

**User Story:** As a developer, I want the amplify.yml build configuration to use Node.js 20, so that builds and deployments succeed without compatibility issues.

#### Acceptance Criteria

1. THE Feedback_App SHALL include an `amplify.yml` file with a preBuild phase that runs `nvm install 20` and `nvm use 20` to activate Node.js version 20
2. THE Feedback_App SHALL run `npm ci` in the preBuild phase after activating Node.js 20 to install dependencies deterministically
3. THE Feedback_App SHALL configure the build output directory in `amplify.yml` to `dist` matching Vite's default output location
4. THE Feedback_App SHALL output the active Node.js version (`node -v`) in the preBuild phase for build log verification
