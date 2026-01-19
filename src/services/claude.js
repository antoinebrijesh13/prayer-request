// Claude API service for AI features

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

export const suggestBibleVerse = async (requests) => {
  const requestsList = requests.map(r => `${r.name} - ${r.request}`).join('\n');
  
  const prompt = `Analyze these prayer requests and suggest ONE relevant Bible verse:

${requestsList}

Respond in this exact JSON format only, no other text:
{
  "reference": "Psalms 23:1 NIV",
  "text": "The LORD is my shepherd, I lack nothing.",
  "url": "https://bible.com/bible/111/psa.23.1.NIV"
}

Consider themes like: unity, strength, guidance, hope, perseverance, faith, healing, peace based on the requests.
Choose a verse that would encourage and uplift those making these prayers.`;

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Could not parse Bible verse response');
  } catch (error) {
    console.error('Error suggesting Bible verse:', error);
    throw error;
  }
};

export const polishPrayerText = async (name, request) => {
  const prompt = `Polish this prayer request to be more concise and clear while keeping the original meaning. Keep it brief (one sentence).

Name: ${name}
Original request: ${request}

Respond with ONLY the polished prayer request text, nothing else. Start with the action verb (e.g., "Pray for...", "To pray for...").`;

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text.trim();
  } catch (error) {
    console.error('Error polishing text:', error);
    throw error;
  }
};
