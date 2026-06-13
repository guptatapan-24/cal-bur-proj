import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
    }

    if (description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters long.' },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: 'AI API key not configured.' }, { status: 500 });
    }

    const systemPrompt = `You are an AI assistant for a restaurant operations team. Your job is to analyze incident reports and classify them accurately. You always respond with valid JSON only, no explanation text, no markdown, no code blocks.`;

    const userMessage = `Analyze this restaurant incident report and respond with ONLY a JSON object — no text before or after it.

Incident Title: ${title}
Incident Description: ${description}

Respond with exactly this JSON structure:
{
  "summary": "One or two sentence plain English summary of the incident",
  "suggested_category": "Exactly one of: POS Issue, Delivery Delay, Inventory, Kitchen Equipment, Customer Complaint, Other",
  "suggested_severity": "Exactly one of: Low, Medium, High, Critical",
  "reasoning": "One sentence explaining your category and severity choice"
}

Classification guide:
POS Issue: payment system, billing, terminal, cash register problems
Delivery Delay: order delivery late, driver issues, logistics
Inventory: stock shortage, missing ingredients, supply issues
Kitchen Equipment: oven, fryer, refrigerator, any kitchen equipment failure
Customer Complaint: customer dissatisfied, rude staff, bad experience
Other: anything that does not fit the above

Severity guide:
Low: minor inconvenience, easily resolved
Medium: affects operations but workaround exists
High: significantly impacts service or revenue
Critical: immediate action required, complete outage or safety issue`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error('Groq API Error:', await response.text());
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';

    // Handle markdown JSON code block wrap if the LLM output includes it
    content = content.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();

    try {
      const parsedContent = JSON.parse(content);
      // Validate structure to ensure all keys are present
      if (
        !parsedContent.summary ||
        !parsedContent.suggested_category ||
        !parsedContent.suggested_severity ||
        !parsedContent.reasoning
      ) {
        throw new Error('Missing keys in JSON response');
      }
      return NextResponse.json(parsedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response content:', content, parseError);
      return NextResponse.json({ error: 'AI response parsing failed' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Unexpected error in ai-analyze route:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
