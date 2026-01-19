import { useState, useEffect } from 'react';
import './App.css';
import { saveRequests, loadRequests } from './services/storage';

function App() {
  const [requests, setRequests] = useState([]);
  const [name, setName] = useState('');
  const [request, setRequest] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadRequests().then(saved => {
      if (saved?.length) setRequests(saved);
    });
  }, []);

  useEffect(() => {
    if (requests.length > 0) saveRequests(requests);
  }, [requests]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim() || !request.trim()) return;
    
    setRequests(prev => [...prev, {
      id: Date.now(),
      name: name.trim(),
      request: request.trim()
    }]);
    setName('');
    setRequest('');
    setSubmitted(true);
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
            />
          </div>
          <div className="form-group">
            <label>Prayer Request</label>
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="What would you like prayer for?"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
