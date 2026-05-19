const axios = require('axios');

const toneConfig = {
  toronto: {
    language: 'English',
    tone: 'professional, direct, ROI-focused',
  },
  buea: {
    language: 'English',
    tone: 'warm, relationship-first, growth-focused',
  },
  bamenda: {
    language: 'English',
    tone: 'warm, relationship-first, growth-focused',
  },
  douala: {
    language: 'French',
    tone: 'chaleureux, axé sur la croissance et la visibilité',
  },
  yaounde: {
    language: 'French',
    tone: 'chaleureux, axé sur la croissance et la visibilité',
  },
};

function getToneConfig(market) {
  const key = market.toLowerCase().split(' ')[0];
  return toneConfig[key] || toneConfig['buea'];
}

async function generateMessage(lead) {
  const config = getToneConfig(lead.market);
  const hasWebsite = lead.website ? 'yes' : 'no';

  const prompt = `You are a copywriter for ZeelTech, a web agency specializing in digital presence for hospitality businesses.

Write a short, personalized DM outreach message for the following business:
- Business Name: ${lead.businessName}
- Category: ${lead.category}
- Location: ${lead.market}
- Has Website: ${hasWebsite}
- Rating: ${lead.rating}

Tone: ${config.tone}
Language: ${config.language}
Brand: ZeelTech

ZeelTech's offer: A professional website plus Facebook advertising that brings in more customers.

Rules:
- Maximum 5 lines — every word must earn its place
- Open with a warm, specific greeting that references the business name and category naturally — make it feel like you noticed them, not copied them
- Never use filler phrases: "I hope this message finds you well", "feel free to reach out", "I came across your business", or any variation
- If they have no website: lead with the cost of invisibility — what they're losing daily by not existing online — then position a website as the solution that compounds over time
- If they have a website: acknowledge it briefly, then pivot to Facebook advertising as the next multiplier — frame it around reaching more of the right people, not just more people
- Sell the outcome, not the service — paint a picture of what their business looks like after: more calls, more walk-ins, more trust, more growth
- Keep the tone warm and peer-level — like someone who genuinely noticed an opportunity for their business, not a vendor pitching a package
- End with one soft, low-friction call to action: invite them to reply to this message for a quick conversation — no calls, no meetings, no forms
- The CTA should feel like an open door, not a push
- Include portfolio link naturally: https://zeeltech-agency.vercel.app — don't introduce it as "my portfolio", let the context carry it
- No emojis
- No bullet points in the output
- Write only the message, nothing else`
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('Message generation error:', err.response?.data || err.message);
    return null;
  }
}

module.exports = { generateMessage };