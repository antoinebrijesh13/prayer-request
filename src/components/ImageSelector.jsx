import { useState } from 'react';
import { getRandomSpiritualImage } from '../services/unsplash';

export default function ImageSelector({ imageUrl, onImageChange }) {
  const [customUrl, setCustomUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetRandom = async () => {
    setLoading(true);
    try {
      const image = await getRandomSpiritualImage();
      onImageChange(image.url);
    } catch (error) {
      console.error('Error fetching image:', error);
    }
    setLoading(false);
  };

  const handleCustomUrl = () => {
    if (customUrl.trim()) {
      onImageChange(customUrl.trim());
      setCustomUrl('');
    }
  };

  return (
    <div className="card">
      <div className="section-header">
        <h2>🖼️ Image</h2>
      </div>
      
      <div className="image-selector">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Prayer post image" 
            className="image-preview"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        
        <div className="image-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleGetRandom}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Loading...
              </>
            ) : (
              '🎲 Random Image'
            )}
          </button>
          
          {imageUrl && (
            <button 
              className="btn btn-secondary" 
              onClick={() => onImageChange(null)}
            >
              ✕ Remove
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Or paste image URL..."
            style={{ flex: 1 }}
          />
          <button 
            className="btn btn-secondary" 
            onClick={handleCustomUrl}
            disabled={!customUrl.trim()}
          >
            Use
          </button>
        </div>
      </div>
    </div>
  );
}
