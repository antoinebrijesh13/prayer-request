export default function PrayerItem({ request, onDelete }) {
  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="prayer-item">
      <div className="prayer-item-content">
        <div className="prayer-item-name">{request.name}</div>
        <div className="prayer-item-request">{request.request}</div>
        <div className="prayer-item-date">{formatDisplayDate(request.date)}</div>
      </div>
      <button 
        className="prayer-item-delete" 
        onClick={() => onDelete(request.id)}
        title="Delete request"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      </button>
    </div>
  );
}
