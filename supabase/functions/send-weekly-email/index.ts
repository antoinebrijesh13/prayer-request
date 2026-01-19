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

// Generate Bible verse using Claude API
async function generateBibleVerse(requests: any[]) {
  const requestsList = requests.map(r => `${r.name} - ${r.request}`).join('\n')
  
  const prompt = `Analyze these prayer requests and suggest ONE relevant Bible verse:

${requestsList}

Respond in this exact format only:
[Verse Reference] NIV
[Verse Number] [Verse Text]
[Bible.com URL]

Example:
Psalms 133:1 NIV
[1] How good and pleasant it is when God's people live together in unity!
https://bible.com/bible/111/psa.133.1.NIV

Consider themes like: unity, strength, guidance, hope, perseverance, faith, healing, peace.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') || ''
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      console.error('Claude API error:', response.status)
      return 'Psalms 23:1 NIV\n[1] The LORD is my shepherd, I lack nothing.\nhttps://bible.com/bible/111/psa.23.1.NIV'
    }

    const data = await response.json()
    return data.content[0].text.trim()
  } catch (error) {
    console.error('Error generating verse:', error)
    return 'Psalms 23:1 NIV\n[1] The LORD is my shepherd, I lack nothing.\nhttps://bible.com/bible/111/psa.23.1.NIV'
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

    // Generate Bible verse
    const bibleVerse = await generateBibleVerse(requests)
    
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

    // Optionally clear requests after sending (uncomment if desired)
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
