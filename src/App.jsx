import { useState, useEffect } from 'react';
import './App.css';
import { saveRequests, loadRequests, clearRequests } from './services/storage';
import { suggestBibleVerse } from './services/claude';
import { getRandomSpiritualImage } from './services/unsplash';
import { formatPost } from './utils/formatPost';

function App() {
  const [requests, setRequests] = useState([]);
  const [name, setName] = useState('');
  const [request, setRequest] = useState('');
  const [bibleVerse, setBibleVerse] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadRequests().then(saved => {
      if (saved?.length) setRequests(saved);
    });
  }, []);

  useEffect(() => {
    if (requests.length > 0) saveRequests(requests);
  }, [requests]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

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
    showToast('Added');
  };

  const handleDelete = (id) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleClearAll = async () => {
    setRequests([]);
    setBibleVerse(null);
    setImageUrl(null);
    await clearRequests();
    setShowClearModal(false);
    showToast('Cleared');
  };

  const handleGenerate = async () => {
    if (requests.length === 0) return;
    setIsGenerating(true);
    try {
      const verse = await suggestBibleVerse(requests);
      setBibleVerse(verse);
      if (!imageUrl) {
        const img = await getRandomSpiritualImage();
        setImageUrl(img.url);
      }
      showToast('Generated');
    } catch (err) {
      showToast('Error generating');
    }
    setIsGenerating(false);
  };

  const handleCopy = async () => {
    const output = formatPost(imageUrl, bibleVerse, requests, false);
    await navigator.clipboard.writeText(output);
    showToast('Copied');
  };

  const preview = requests.length > 0 
    ? formatPost(imageUrl, bibleVerse, requests, false)
    : 'Add prayer requests to see preview...';

  return (
    <div className="app">
      <header className="header">
        <h1>Prayer Requests</h1>
        <p>Collect and share prayer requests</p>
      </header>

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
            Add Request
          </button>
        </form>
      </div>

      {/* Prayer List */}
      {requests.length > 0 && (
        <div className="card">
          <div className="section-header">
            <h2>Requests</h2>
            <span className="count">{requests.length}</span>
          </div>
          <div className="prayer-list">
            {requests.map(r => (
              <div key={r.id} className="prayer-item">
                <div className="prayer-item-content">
                  <div className="prayer-item-name">{r.name}</div>
                  <div className="prayer-item-text">{r.request}</div>
                </div>
                <button 
                  className="prayer-item-delete"
                  onClick={() => handleDelete(r.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? <><span className="loading"></span> Generating...</> : 'Generate with AI'}
            </button>
            <button 
              className="btn btn-secondary btn-danger"
              onClick={() => setShowClearModal(true)}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      {requests.length > 0 && (
        <div className="card">
          <div className="card-title">Preview</div>
          <div className="preview-box">{preview}</div>
          <div className="preview-actions">
            <button className="btn btn-primary" onClick={handleCopy}>
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}

      {/* Clear Modal */}
      {showClearModal && (
        <div className="modal-overlay" onClick={() => setShowClearModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Clear all requests?</h3>
            <p>This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowClearModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{background: 'var(--danger)'}} onClick={handleClearAll}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className="toast">{toast}</div>
        </div>
      )}
    </div>
  );
}

export default App;
