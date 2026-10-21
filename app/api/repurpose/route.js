import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { content, formats } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const formatInstructions = {
      tweet: "X/Twitter post (max 280 characters). Punchy, engaging, with 1-2 relevant hashtags. No fluff.",
      linkedin: "LinkedIn post (150-300 words). Professional tone, add line breaks for readability, start with a hook, end with a question or CTA.",
      instagram: "Instagram caption (100-200 words). Engaging, conversational tone. Include 5-10 relevant hashtags at the end. Add emoji sparingly.",
      newsletter: "Email newsletter summary (100-150 words). Conversational, highlight key takeaways with bullet points. Include a CTA.",
      youtube: "YouTube Shorts script (30-60 seconds). Start with a hook in the first line. Use short sentences. Mark [VISUAL] cues. End with CTA.",
    };

    const selectedFormats = formats || ["tweet", "linkedin", "instagram", "newsletter", "youtube"];
    
    const formatList = selectedFormats
      .map((f) => `${f.toUpperCase()}:\n${formatInstructions[f]}`)
      .join("\n\n");

    const systemPrompt = `You are a content repurposing expert. Given a blog post or article, you create adapted versions for different platforms.

Rules:
- Each format must feel native to its platform
- Don't just shorten — ADAPT the message for each audience
- Maintain the core message but change the angle/hook per platform
- Output each format clearly labeled with === FORMAT_NAME === headers
- Write in English`;

    const userPrompt = `Repurpose this content into the following formats:

${formatList}

ORIGINAL CONTENT:
${content.substring(0, 3000)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const result = completion.choices[0]?.message?.content?.trim();

    // Parse the result into separate formats
    const parsed = {};
    selectedFormats.forEach((f) => {
      const regex = new RegExp(`===\\s*${f.toUpperCase()}\\s*===([\\s\\S]*?)(?====|$)`, "i");
      const match = result.match(regex);
      parsed[f] = match ? match[1].trim() : "";
    });

    return NextResponse.json({ formats: parsed, raw: result });
  } catch (error) {
    console.error("Repurpose error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to repurpose content. Please try again." },
      { status: 500 }
    );
  }
}
