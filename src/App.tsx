import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { FeedbackForm } from './components/FeedbackForm';
import { FeedbackList } from './components/FeedbackList';
import type { FeedbackEntry } from './components/FeedbackList';
import './App.css';

const client = generateClient<Schema>();

function App() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const { data, errors } = await client.models.Feedback.list();

        if (errors && errors.length > 0) {
          setError('Unable to load feedback. Please refresh the page.');
          return;
        }

        // Sort client-side by createdAt descending (newest first)
        const sorted = [...(data ?? [])].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setEntries(
          sorted.map((item) => ({
            id: item.id,
            name: item.name,
            rating: item.rating,
            comment: item.comment,
            createdAt: item.createdAt ?? new Date().toISOString(),
          }))
        );
      } catch {
        setError('Unable to load feedback. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeedback();
  }, []);

  const handleFeedbackSubmitted = (entry: Schema['Feedback']['type']) => {
    const newEntry: FeedbackEntry = {
      id: entry.id,
      name: entry.name,
      rating: entry.rating,
      comment: entry.comment,
      createdAt: entry.createdAt ?? new Date().toISOString(),
    };
    setEntries((prev) => [newEntry, ...prev]);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Workshop Feedback</h1>
      </header>
      <main className="app-main">
        <section className="form-section">
          <h2>Submit Your Feedback</h2>
          <FeedbackForm onFeedbackSubmitted={handleFeedbackSubmitted} />
        </section>
        <section className="list-section">
          <h2>All Feedback</h2>
          <FeedbackList entries={entries} isLoading={isLoading} error={error} />
        </section>
      </main>
    </div>
  );
}

export default App;
