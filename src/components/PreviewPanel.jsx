import { useState } from 'react';
import { formatPost, getTodayDate } from '../utils/formatPost';

export default function PreviewPanel({ 
  requests, 
  bibleVerse, 
  imageUrl, 
  usePolishedText,
  onShowToast 
}) {
  const formattedOutput = formatPost(
    getTodayDate(),
    imageUrl,
    bibleVerse,
    requests,
    usePolishedText
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedOutput);
      onShowToast('Copied to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to copy:', error);
      onShowToast('Failed to copy', 'error');
    }
  };

  const handleDownloadImage = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prayer-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowToast('Image downloaded!', 'success');
    } catch (error) {
      console.error('Failed to download:', error);
      onShowToast('Failed to download image', 'error');
    }
  };

  return (
    <div className="card">
      <div className="section-header">
        <h2>📋 Preview</h2>
      </div>
      
      {requests.length === 0 ? (
        <div className="preview-box" style={{ color: '#9CA3AF', fontStyle: 'italic' }}>
          Add prayer requests to see preview...
        </div>
      ) : (
        <>
          <div className="preview-box">
            {formattedOutput}
          </div>
          
          <div className="preview-actions" style={{ marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={handleCopy}>
              📋 Copy to Clipboard
            </button>
            {imageUrl && (
              <button className="btn btn-secondary" onClick={handleDownloadImage}>
                ⬇️ Download Image
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
