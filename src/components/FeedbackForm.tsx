import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { validateName, validateRating, validateComment, isFormValid } from '../utils/validation';

const client = generateClient<Schema>();

type FeedbackEntry = Schema['Feedback']['type'];

interface FeedbackFormProps {
  onFeedbackSubmitted: (entry: FeedbackEntry) => void;
}

interface FormState {
  name: string;
  rating: number | null;
  comment: string;
}

interface FormErrors {
  name?: string;
  rating?: string;
  comment?: string;
}

export function FeedbackForm({ onFeedbackSubmitted }: FeedbackFormProps) {
  const [formState, setFormState] = useState<FormState>({
    name: '',
    rating: null,
    comment: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateField = (field: keyof FormState, value: string | number | null): string | undefined => {
    switch (field) {
      case 'name':
        return validateName(value as string);
      case 'rating':
        return validateRating(value as number | null);
      case 'comment':
        return validateComment(value as string);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => ({ ...prev, name: value }));
    if (touched.name) {
      setErrors(prev => ({ ...prev, name: validateField('name', value) }));
    }
  };

  const handleRatingChange = (value: number) => {
    setFormState(prev => ({ ...prev, rating: value }));
    setTouched(prev => ({ ...prev, rating: true }));
    setErrors(prev => ({ ...prev, rating: validateField('rating', value) }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormState(prev => ({ ...prev, comment: value }));
    if (touched.comment) {
      setErrors(prev => ({ ...prev, comment: validateField('comment', value) }));
    }
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, formState[field]) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate all fields on submit
    const newErrors: FormErrors = {
      name: validateField('name', formState.name),
      rating: validateField('rating', formState.rating),
      comment: validateField('comment', formState.comment),
    };
    setErrors(newErrors);
    setTouched({ name: true, rating: true, comment: true });

    if (!isFormValid(formState.name, formState.rating, formState.comment)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, errors: apiErrors } = await client.models.Feedback.create({
        name: formState.name,
        rating: formState.rating!,
        comment: formState.comment,
      });

      if (apiErrors && apiErrors.length > 0) {
        setSubmitError('Unable to submit feedback. Please try again.');
        return;
      }

      if (data) {
        // Clear form on success
        setFormState({ name: '', rating: null, comment: '' });
        setErrors({});
        setTouched({});
        onFeedbackSubmitted(data);
      }
    } catch {
      setSubmitError('Unable to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formValid = isFormValid(formState.name, formState.rating, formState.comment);

  return (
    <form onSubmit={handleSubmit} aria-label="Feedback form" noValidate>
      {submitError && (
        <div role="alert" className="form-error-banner">
          {submitError}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="feedback-name">Name</label>
        <input
          id="feedback-name"
          type="text"
          maxLength={100}
          value={formState.name}
          onChange={handleNameChange}
          onBlur={() => handleBlur('name')}
          disabled={isSubmitting}
          aria-invalid={touched.name && !!errors.name}
          aria-describedby={errors.name ? 'feedback-name-error' : undefined}
        />
        {touched.name && errors.name && (
          <span id="feedback-name-error" className="field-error" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      <div className="form-field">
        <fieldset>
          <legend>Rating</legend>
          <div className="rating-buttons" role="group" aria-label="Rating selection">
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                type="button"
                className={`rating-button ${formState.rating === value ? 'selected' : ''}`}
                onClick={() => handleRatingChange(value)}
                disabled={isSubmitting}
                aria-pressed={formState.rating === value}
                aria-label={`Rate ${value} out of 5`}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>
        {touched.rating && errors.rating && (
          <span id="feedback-rating-error" className="field-error" role="alert">
            {errors.rating}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="feedback-comment">Comment</label>
        <textarea
          id="feedback-comment"
          maxLength={500}
          value={formState.comment}
          onChange={handleCommentChange}
          onBlur={() => handleBlur('comment')}
          disabled={isSubmitting}
          rows={4}
          aria-invalid={touched.comment && !!errors.comment}
          aria-describedby={errors.comment ? 'feedback-comment-error' : undefined}
        />
        {touched.comment && errors.comment && (
          <span id="feedback-comment-error" className="field-error" role="alert">
            {errors.comment}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={!formValid || isSubmitting}
        className="submit-button"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
}
