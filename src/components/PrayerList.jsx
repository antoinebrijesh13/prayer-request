import PrayerItem from './PrayerItem';

export default function PrayerList({ requests, onDelete, onClearAll }) {
  if (requests.length === 0) {
    return (
      <div className="card">
        <div className="section-header">
          <h2>🙏 Prayer Requests</h2>
        </div>
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <p>No prayer requests yet.<br/>Add your first one above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="section-header">
        <h2>🙏 Prayer Requests ({requests.length})</h2>
        <button 
          className="btn btn-secondary" 
          onClick={onClearAll}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          Clear All
        </button>
      </div>
      <div className="prayer-list">
        {requests.map((request) => (
          <PrayerItem 
            key={request.id} 
            request={request} 
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
