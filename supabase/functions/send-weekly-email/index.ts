// Supabase Edge Function to send weekly prayer request emails
// Runs every Sunday at 11:55 AM KST

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const RECIPIENT_EMAIL = 'brijeshantonio13@gmail.com'

// Format date like "January 19th"
function formatDate() {
  const date = new Date()
  const day = date.getDate()
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  
  let suffix = 'th'
  if (day === 1 || day === 21 || day === 31) suffix = 'st'
  else if (day === 2 || day === 22) suffix = 'nd'
  else if (day === 3 || day === 23) suffix = 'rd'
  
  return `${month} ${day}${suffix}`
}

// Get verse of the day from ourManna API with image
async function getVerseOfTheDay() {
  try {
    // Using ourManna API - free, no auth required
    const response = await fetch('https://beta.ourmanna.com/api/v1/get?format=json&order=daily')
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const verse = data.verse
    
    // Format the verse
    const reference = verse.details.reference
    const text = verse.details.text
    
    // Create bible.com URL
    const bookChapter = reference.split(':')[0].toLowerCase().replace(/\s+/g, '')
    const verseNum = reference.split(':')[1]
    const bibleUrl = `https://bible.com/bible/111/${bookChapter}.${verseNum}.NIV`
    
    // Generate verse image URL using Picsum (more reliable for emails)
    const verseImageUrl = `https://picsum.photos/seed/${Date.now()}/800/300`
    
    return {
      reference,
      text,
      bibleUrl,
      imageUrl: verseImageUrl
    }
  } catch (error) {
    console.error('Error fetching verse of the day:', error)
    // Fallback verse
    return {
      reference: 'Psalms 23:1 NIV',
      text: 'The LORD is my shepherd, I lack nothing.',
      bibleUrl: 'https://bible.com/bible/111/psa.23.1.NIV',
      imageUrl: 'https://source.unsplash.com/800x400/?nature,peaceful'
    }
  }
}

// Format the email as HTML with image
function formatEmailHtml(dateStr: string, verse: any, requests: any[]) {
  let requestsHtml = requests.map(r => 
    `<p style="margin: 10px 0; font-size: 16px;"><strong>${r.name}</strong> - ${r.request}</p>`
  ).join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f7;">
  <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h1 style="font-size: 24px; font-weight: 600; color: #1d1d1f; margin-bottom: 20px;">
      Prayer requests of ${dateStr}
    </h1>
    
    <!-- Verse Image -->
    <div style="margin-bottom: 20px; border-radius: 12px; overflow: hidden;">
      <img src="${verse.imageUrl}" alt="Bible Verse" style="width: 100%; height: auto; display: block;">
    </div>
    
    <!-- Verse Text -->
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #3d3d3d 100%); border-radius: 12px; padding: 20px; color: white; margin-bottom: 24px;">
      <p style="font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">
        ${verse.reference}
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; font-style: italic;">
        ${verse.text}
      </p>
      <a href="${verse.bibleUrl}" style="color: rgba(255,255,255,0.9); font-size: 14px;">
        ${verse.bibleUrl}
      </a>
    </div>
    
    <!-- Prayer Requests -->
    <div style="border-top: 1px solid #e5e5e7; padding-top: 20px;">
      <h2 style="font-size: 18px; font-weight: 600; color: #1d1d1f; margin-bottom: 16px;">
        Prayer Requests
      </h2>
      ${requestsHtml}
    </div>
  </div>
</body>
</html>
</html>
  `.trim()
}

// Plain text fallback
function formatEmailText(dateStr: string, verse: any, requests: any[]) {
  let content = `Prayer requests of ${dateStr}\n\n`
  content += `${verse.reference}\n${verse.text}\n\n${verse.bibleUrl}\n\n`
  
  requests.forEach(r => {
    content += `${r.name} - ${r.request}\n\n`
  })
  
  return content.trim()
}

Deno.serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    // Calculate last Sunday at midnight
    const now = new Date()
    const daysSinceSunday = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const lastSunday = new Date(now)
    lastSunday.setDate(now.getDate() - daysSinceSunday)
    lastSunday.setHours(0, 0, 0, 0)

    // Fetch prayer requests from this week only
    const { data: requests, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .gte('created_at', lastSunday.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching requests:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch requests' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!requests || requests.length === 0) {
      console.log('No prayer requests to send')
      return new Response(JSON.stringify({ message: 'No requests to send' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get verse of the day with image
    const verse = await getVerseOfTheDay()
    
    // Format the email content
    const dateStr = formatDate()
    const htmlContent = formatEmailHtml(dateStr, verse, requests)
    const textContent = formatEmailText(dateStr, verse, requests)

    // Send email via Resend with HTML
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Prayer Requests <onboarding@resend.dev>',
        to: [RECIPIENT_EMAIL],
        subject: `Prayer Requests - ${dateStr}`,
        html: htmlContent,
        text: textContent
      })
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Resend error:', errorData)
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Clear all requests after sending (disabled)
    // await supabase.from('prayer_requests').delete().neq('id', 0)

    console.log('Email sent successfully!')
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully',
      requestCount: requests.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
