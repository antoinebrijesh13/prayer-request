// Format the final post output

export const formatPost = (date, imageUrl, bibleVerse, requests, usePolished = false) => {
  const dateStr = formatDate(date);
  
  let output = `Prayer requests of ${dateStr}\n\n`;
  
  // Add image placeholder or URL
  if (imageUrl) {
    output += `[Image: ${imageUrl}]\n\n`;
  }
  
  // Add Bible verse
  if (bibleVerse) {
    output += `${bibleVerse.reference}\n`;
    output += `${bibleVerse.text}\n`;
    output += `${bibleVerse.url}\n\n`;
  }
  
  // Add prayer requests
  requests.forEach((request) => {
    const text = usePolished && request.polishedRequest 
      ? request.polishedRequest 
      : request.request;
    output += `${request.name} - ${text}\n`;
  });
  
  return output.trim();
};

export const formatDate = (date) => {
  const d = new Date(date);
  const options = { month: 'long', day: 'numeric' };
  
  // Add ordinal suffix
  const day = d.getDate();
  let suffix = 'th';
  if (day === 1 || day === 21 || day === 31) suffix = 'st';
  else if (day === 2 || day === 22) suffix = 'nd';
  else if (day === 3 || day === 23) suffix = 'rd';
  
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  return `${month} ${day}${suffix}`;
};

export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};
