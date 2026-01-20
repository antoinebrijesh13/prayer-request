import { useState } from 'react';

export default function PrayerForm({ onAdd }) {
  const [name, setName] = useState('');
  const [request, setRequest] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim() || !request.trim()) return;
    
    onAdd({
      id: Date.now(),
      name: name.trim(),
      request: request.trim(),
      createdAt: new Date().toISOString()
    });
    
    setName('');
    setRequest('');
  };

  return (
    <div className="card">
      <div className="section-header">
        <h2>✏️ Add Prayer Request</h2>
      </div>
      
      <form className="prayer-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="request">Prayer Request</label>
          <textarea
            id="request"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="What would you like to pray for?"
            rows={3}
          />
        </div>
        
        <button type="submit" className="btn btn-primary">
          Add Request
        </button>
      </form>
    </div>
  );
}
