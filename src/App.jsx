import { useState } from 'react';
import './App.css';
import { saveRequest } from './services/storage';

function App() {
  const [name, setName] = useState('');
  const [request, setRequest] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim() || !request.trim()) return;
    
    setIsSubmitting(true);
    try {
      await saveRequest({
        name: name.trim(),
        request: request.trim()
      });
      setName('');
      setRequest('');
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Error submitting request. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleAddAnother = () => {
    setSubmitted(false);
  };

  // Success Page
  if (submitted) {
    return (
      <div className="app">
        <div className="success-page">
          <div className="success-title">Request added, thank you!</div>
          <button className="btn btn-secondary" onClick={handleAddAnother}>
            Add another request
          </button>
        </div>
      </div>
    );
  }

  // Form Page
  return (
    <div className="app">
      <header className="header">
        <h1>Prayer Requests</h1>
      </header>

      <div className="card">
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label>Prayer Request</label>
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="What would you like prayer for?"
              disabled={isSubmitting}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
