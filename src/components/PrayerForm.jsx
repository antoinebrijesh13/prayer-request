import { useState } from 'react';
import { getTodayDate } from '../utils/formatPost';

export default function PrayerForm({ onAdd }) {
  const [name, setName] = useState('');
  const [request, setRequest] = useState('');
  const [date, setDate] = useState(getTodayDate());

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim() || !request.trim()) return;
    
    onAdd({
      id: Date.now(),
      name: name.trim(),
      request: request.trim(),
      date,
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
        <div className="form-row">
          <div>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 최하늘 Haneul"
            />
          </div>
          <div>
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="request">Prayer Request</label>
          <textarea
            id="request"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="What would you like prayer for?"
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
