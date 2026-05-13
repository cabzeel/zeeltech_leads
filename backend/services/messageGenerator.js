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
- Maximum 5 lines
- Do NOT use generic phrases like "I hope this message finds you well"
- Reference the business name and category naturally
- If they have no website, make that the hook
- If they have a website, focus on Facebook advertising as the next growth step
- End with a soft call to action inviting them to reply to this message — no calls, no meetings, just a conversation
- Sound human, not like a template
- Do not use emojis

Write only the message, nothing else.`;

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