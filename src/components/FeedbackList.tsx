export interface FeedbackEntry {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface FeedbackListProps {
  entries: FeedbackEntry[];
  isLoading: boolean;
  error: string | null;
}

export function FeedbackList({ entries, isLoading, error }: FeedbackListProps) {
  if (isLoading) {
    return (
      <div data-testid="feedback-loading" className="feedback-loading">
        <p>Loading feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="feedback-error" className="feedback-error">
        <p>{error}</p>
        <p>Please refresh the page to try again.</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div data-testid="feedback-empty" className="feedback-empty">
        <p>No feedback has been submitted yet.</p>
      </div>
    );
  }

  return (
    <div data-testid="feedback-list" className="feedback-list">
      {entries.map((entry) => (
        <div key={entry.id} data-testid="feedback-entry" className="feedback-entry">
          <div className="feedback-entry-header">
            <span data-testid="feedback-entry-name" className="feedback-entry-name">
              {entry.name}
            </span>
            <span data-testid="feedback-entry-rating" className="feedback-entry-rating">
              {entry.rating}/5
            </span>
          </div>
          <p data-testid="feedback-entry-comment" className="feedback-entry-comment">
            {entry.comment}
          </p>
          <time
            data-testid="feedback-entry-date"
            className="feedback-entry-date"
            dateTime={entry.createdAt}
          >
            {new Date(entry.createdAt).toLocaleString()}
          </time>
        </div>
      ))}
    </div>
  );
}
