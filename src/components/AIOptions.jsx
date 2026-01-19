import { useState } from 'react';
import { suggestBibleVerse } from '../services/claude';

export default function AIOptions({ 
  requests, 
  bibleVerse, 
  onBibleVerseChange,
  usePolishedText,
  onUsePolishedTextChange,
  onGeneratePost,
  isGenerating 
}) {
  const [editingVerse, setEditingVerse] = useState(false);
  const [editedVerse, setEditedVerse] = useState(null);

  const handleGenerateVerse = async () => {
    if (requests.length === 0) return;
    
    onGeneratePost();
  };

  const handleEditSave = () => {
    if (editedVerse) {
      onBibleVerseChange(editedVerse);
    }
    setEditingVerse(false);
  };

  const handleEditCancel = () => {
    setEditedVerse(null);
    setEditingVerse(false);
  };

  const startEdit = () => {
    setEditedVerse({ ...bibleVerse });
    setEditingVerse(true);
  };

  return (
    <div className="card">
      <div className="section-header">
        <h2>🤖 AI Options</h2>
      </div>
      
      <div className="ai-options">
        <button 
          className="btn btn-primary" 
          onClick={handleGenerateVerse}
          disabled={requests.length === 0 || isGenerating}
          style={{ width: '100%' }}
        >
          {isGenerating ? (
            <>
              <span className="spinner"></span>
              Generating...
            </>
          ) : (
            '✨ Generate Post with AI'
          )}
        </button>
        
        {bibleVerse && !editingVerse && (
          <div className="bible-verse">
            <div className="bible-verse-reference">{bibleVerse.reference}</div>
            <div className="bible-verse-text">"{bibleVerse.text}"</div>
            <a 
              href={bibleVerse.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bible-verse-link"
            >
              {bibleVerse.url}
            </a>
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={startEdit}>
                ✏️ Edit
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleGenerateVerse}
                disabled={isGenerating}
              >
                🔄 New Verse
              </button>
            </div>
          </div>
        )}
        
        {editingVerse && editedVerse && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label>Reference</label>
              <input
                type="text"
                value={editedVerse.reference}
                onChange={(e) => setEditedVerse({ ...editedVerse, reference: e.target.value })}
              />
            </div>
            <div>
              <label>Verse Text</label>
              <textarea
                value={editedVerse.text}
                onChange={(e) => setEditedVerse({ ...editedVerse, text: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label>Bible.com URL</label>
              <input
                type="url"
                value={editedVerse.url}
                onChange={(e) => setEditedVerse({ ...editedVerse, url: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={handleEditSave}>Save</button>
              <button className="btn btn-secondary" onClick={handleEditCancel}>Cancel</button>
            </div>
          </div>
        )}
        
        <div className="ai-option-toggle">
          <input
            type="checkbox"
            id="polished"
            checked={usePolishedText}
            onChange={(e) => onUsePolishedTextChange(e.target.checked)}
          />
          <label htmlFor="polished" style={{ marginBottom: 0, cursor: 'pointer' }}>
            Use AI-polished text (more concise)
          </label>
        </div>
      </div>
    </div>
  );
}
