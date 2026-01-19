// Storage service using window.storage API

const STORAGE_KEY = 'prayer-requests';

export const saveRequests = async (requests) => {
  try {
    if (window.storage) {
      await window.storage.set(STORAGE_KEY, JSON.stringify(requests));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    }
  } catch (error) {
    console.error('Error saving requests:', error);
  }
};

export const loadRequests = async () => {
  try {
    if (window.storage) {
      const data = await window.storage.get(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } else {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }
  } catch (error) {
    console.error('Error loading requests:', error);
    return [];
  }
};

export const clearRequests = async () => {
  try {
    if (window.storage) {
      await window.storage.delete(STORAGE_KEY);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error clearing requests:', error);
  }
};
