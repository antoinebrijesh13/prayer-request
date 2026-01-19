import { useState, useEffect } from 'react';
import './App.css';

import PrayerForm from './components/PrayerForm';
import PrayerList from './components/PrayerList';
import AIOptions from './components/AIOptions';
import ImageSelector from './components/ImageSelector';
import PreviewPanel from './components/PreviewPanel';
import ConfirmModal from './components/ConfirmModal';
import { ToastContainer } from './components/Toast';

import { saveRequests, loadRequests, clearRequests } from './services/storage';
import { suggestBibleVerse, polishPrayerText } from './services/claude';
import { getRandomSpiritualImage } from './services/unsplash';

function App() {
  const [requests, setRequests] = useState([]);
  const [bibleVerse, setBibleVerse] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [usePolishedText, setUsePolishedText] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Load saved requests on mount
  useEffect(() => {
    const load = async () => {
      const saved = await loadRequests();
      if (saved.length > 0) {
        setRequests(saved);
      }
    };
    load();
  }, []);

  // Save requests when they change
  useEffect(() => {
    if (requests.length > 0) {
      saveRequests(requests);
    }
  }, [requests]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddRequest = (newRequest) => {
    setRequests((prev) => [...prev, newRequest]);
    showToast('Prayer request added!', 'success');
  };

  const handleDeleteRequest = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    showToast('Request removed', 'info');
  };

  const handleClearAll = () => {
    setShowClearModal(true);
  };

  const confirmClearAll = async () => {
    setRequests([]);
    setBibleVerse(null);
    setImageUrl(null);
    await clearRequests();
    setShowClearModal(false);
    showToast('All requests cleared', 'success');
  };

  const handleGeneratePost = async () => {
    if (requests.length === 0) return;

    setIsGenerating(true);
    try {
      // Get Bible verse suggestion
      const verse = await suggestBibleVerse(requests);
      setBibleVerse(verse);

      // Get random image if none selected
      if (!imageUrl) {
        const image = await getRandomSpiritualImage();
        setImageUrl(image.url);
      }

      // Polish text if option is enabled
      if (usePolishedText) {
        const polishedRequests = await Promise.all(
          requests.map(async (req) => {
            if (!req.polishedRequest) {
              try {
                const polished = await polishPrayerText(req.name, req.request);
                return { ...req, polishedRequest: polished };
              } catch {
                return req;
              }
            }
            return req;
          })
        );
        setRequests(polishedRequests);
      }

      showToast('Post generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating post:', error);
      showToast('Error generating post. Please try again.', 'error');
    }
    setIsGenerating(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🙏 Prayer Request Manager</h1>
        <p>Collect prayer requests and format them for sharing</p>
      </header>

      <div className="app-content">
        <div className="input-section">
          <PrayerForm onAdd={handleAddRequest} />
          
          <PrayerList 
            requests={requests} 
            onDelete={handleDeleteRequest}
            onClearAll={handleClearAll}
          />
        </div>

        <div className="preview-section">
          <AIOptions
            requests={requests}
            bibleVerse={bibleVerse}
            onBibleVerseChange={setBibleVerse}
            usePolishedText={usePolishedText}
            onUsePolishedTextChange={setUsePolishedText}
            onGeneratePost={handleGeneratePost}
            isGenerating={isGenerating}
          />
          
          <ImageSelector
            imageUrl={imageUrl}
            onImageChange={setImageUrl}
          />
          
          <PreviewPanel
            requests={requests}
            bibleVerse={bibleVerse}
            imageUrl={imageUrl}
            usePolishedText={usePolishedText}
            onShowToast={showToast}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        title="Clear All Requests?"
        message="This will remove all prayer requests. This action cannot be undone."
        onConfirm={confirmClearAll}
        onCancel={() => setShowClearModal(false)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
