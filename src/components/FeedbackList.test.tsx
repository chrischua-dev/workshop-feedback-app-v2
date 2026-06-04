import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FeedbackList } from './FeedbackList';
import type { FeedbackEntry } from './FeedbackList';

describe('FeedbackList', () => {
  const mockEntries: FeedbackEntry[] = [
    {
      id: '1',
      name: 'Alice',
      rating: 5,
      comment: 'Great workshop!',
      createdAt: '2024-01-15T10:30:00.000Z',
    },
    {
      id: '2',
      name: 'Bob',
      rating: 3,
      comment: 'It was okay.',
      createdAt: '2024-01-15T09:00:00.000Z',
    },
  ];

  it('shows loading indicator when isLoading is true', () => {
    render(<FeedbackList entries={[]} isLoading={true} error={null} />);
    expect(screen.getByTestId('feedback-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading feedback...')).toBeInTheDocument();
  });

  it('shows error message when error is set', () => {
    render(
      <FeedbackList entries={[]} isLoading={false} error="Unable to load feedback." />
    );
    expect(screen.getByTestId('feedback-error')).toBeInTheDocument();
    expect(screen.getByText('Unable to load feedback.')).toBeInTheDocument();
    expect(screen.getByText('Please refresh the page to try again.')).toBeInTheDocument();
  });

  it('shows empty state when entries is empty and not loading', () => {
    render(<FeedbackList entries={[]} isLoading={false} error={null} />);
    expect(screen.getByTestId('feedback-empty')).toBeInTheDocument();
    expect(screen.getByText('No feedback has been submitted yet.')).toBeInTheDocument();
  });

  it('renders each entry with name, rating, comment, and formatted date', () => {
    render(<FeedbackList entries={mockEntries} isLoading={false} error={null} />);

    const entries = screen.getAllByTestId('feedback-entry');
    expect(entries).toHaveLength(2);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('5/5')).toBeInTheDocument();
    expect(screen.getByText('Great workshop!')).toBeInTheDocument();

    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('3/5')).toBeInTheDocument();
    expect(screen.getByText('It was okay.')).toBeInTheDocument();
  });

  it('displays entries in the order provided', () => {
    render(<FeedbackList entries={mockEntries} isLoading={false} error={null} />);

    const names = screen.getAllByTestId('feedback-entry-name');
    expect(names[0]).toHaveTextContent('Alice');
    expect(names[1]).toHaveTextContent('Bob');
  });

  it('displays locale-formatted date for each entry', () => {
    render(<FeedbackList entries={mockEntries} isLoading={false} error={null} />);

    const dates = screen.getAllByTestId('feedback-entry-date');
    expect(dates[0]).toHaveAttribute('datetime', '2024-01-15T10:30:00.000Z');
    expect(dates[1]).toHaveAttribute('datetime', '2024-01-15T09:00:00.000Z');

    // Verify dates contain locale string output (format varies by locale)
    const expectedDate1 = new Date('2024-01-15T10:30:00.000Z').toLocaleString();
    const expectedDate2 = new Date('2024-01-15T09:00:00.000Z').toLocaleString();
    expect(dates[0]).toHaveTextContent(expectedDate1);
    expect(dates[1]).toHaveTextContent(expectedDate2);
  });

  it('prioritizes loading state over empty state', () => {
    render(<FeedbackList entries={[]} isLoading={true} error={null} />);
    expect(screen.getByTestId('feedback-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('feedback-empty')).not.toBeInTheDocument();
  });

  it('prioritizes error state over entries', () => {
    render(
      <FeedbackList entries={mockEntries} isLoading={false} error="Network error" />
    );
    expect(screen.getByTestId('feedback-error')).toBeInTheDocument();
    expect(screen.queryByTestId('feedback-list')).not.toBeInTheDocument();
  });
});
