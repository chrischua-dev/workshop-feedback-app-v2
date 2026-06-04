/**
 * Pure validation functions for the feedback form.
 * Each validator returns undefined if valid, or an error message string if invalid.
 */

/**
 * Validates the name field.
 * Must have at least 1 non-whitespace character and no more than 100 total characters.
 */
export function validateName(value: string): string | undefined {
  if (value.trim().length === 0) {
    return 'Name is required';
  }
  if (value.length > 100) {
    return 'Name must be 100 characters or less';
  }
  return undefined;
}

/**
 * Validates the rating field.
 * Must be an integer in the inclusive range [1, 5].
 */
export function validateRating(value: number | null): string | undefined {
  if (value === null) {
    return 'Please select a rating';
  }
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return 'Rating must be an integer between 1 and 5';
  }
  return undefined;
}

/**
 * Validates the comment field.
 * Must have at least 1 non-whitespace character and no more than 500 total characters.
 */
export function validateComment(value: string): string | undefined {
  if (value.trim().length === 0) {
    return 'Comment is required';
  }
  if (value.length > 500) {
    return 'Comment must be 500 characters or less';
  }
  return undefined;
}

/**
 * Returns true if and only if all three validators pass (all return undefined).
 */
export function isFormValid(name: string, rating: number | null, comment: string): boolean {
  return (
    validateName(name) === undefined &&
    validateRating(rating) === undefined &&
    validateComment(comment) === undefined
  );
}
