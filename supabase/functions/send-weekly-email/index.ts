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

// Get verse of the day from ourManna API
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
    
    // Create bible.com URL (approximate)
    const bookChapter = reference.split(':')[0].toLowerCase().replace(/\s+/g, '')
    const verseNum = reference.split(':')[1]
    const bibleUrl = `https://bible.com/bible/111/${bookChapter}.${verseNum}.NIV`
    
    return `${reference} NIV\n${text}\n\n${bibleUrl}`
  } catch (error) {
    console.error('Error fetching verse of the day:', error)
    // Fallback verse
    return 'Psalms 23:1 NIV\nThe LORD is my shepherd, I lack nothing.\n\nhttps://bible.com/bible/111/psa.23.1.NIV'
  }
}

// Format the email content
function formatEmailContent(dateStr: string, bibleVerse: string, requests: any[]) {
  let content = `Prayer requests of ${dateStr}\n\n`
  content += bibleVerse + '\n\n'
  
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

    // Fetch all prayer requests
    const { data: requests, error } = await supabase
      .from('prayer_requests')
      .select('*')
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

    // Get verse of the day
    const bibleVerse = await getVerseOfTheDay()
    
    // Format the email content
    const dateStr = formatDate()
    const emailContent = formatEmailContent(dateStr, bibleVerse, requests)

    // Send email via Resend
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
        text: emailContent
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

    // Clear all requests after sending
    await supabase.from('prayer_requests').delete().neq('id', 0)

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
