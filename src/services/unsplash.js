// Unsplash API service for spiritual images

// Using Unsplash Source for random images (no API key needed)
const UNSPLASH_BASE = 'https://source.unsplash.com';

// Spiritual/prayer-related keywords
const KEYWORDS = [
  'prayer',
  'faith',
  'church',
  'sunrise',
  'peaceful',
  'hope',
  'light',
  'spiritual',
  'nature',
  'sky'
];

export const getRandomSpiritualImage = async (width = 800, height = 400) => {
  // Pick a random keyword
  const keyword = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
  
  // Add timestamp to prevent caching
  const timestamp = Date.now();
  
  // Unsplash Source returns a random image matching the query
  const url = `${UNSPLASH_BASE}/${width}x${height}/?${keyword}&${timestamp}`;
  
  // Return the URL directly - Unsplash Source handles the redirect
  return {
    url,
    keyword,
    attribution: 'Photo from Unsplash'
  };
};

export const getImageFromKeyword = async (keyword, width = 800, height = 400) => {
  const timestamp = Date.now();
  const url = `${UNSPLASH_BASE}/${width}x${height}/?${encodeURIComponent(keyword)}&${timestamp}`;
  
  return {
    url,
    keyword,
    attribution: 'Photo from Unsplash'
  };
};
