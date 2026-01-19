import { useState, useEffect } from 'react';
import './App.css';
import { saveRequests, loadRequests } from './services/storage';

function App() {
  const [requests, setRequests] = useState([]);
  const [name, setName] = useState('');
  const [request, setRequest] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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
    
    // Show success card
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Prayer Requests</h1>
      </header>

      {/* Success Card */}
      {showSuccess && (
        <div className="card success-card">
          <div className="success-message">Request added</div>
        </div>
      )}

      {/* Add Form */}
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
