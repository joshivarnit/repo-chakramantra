import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AnalyzedDraft {
  title: string;
  summary: string;
  genre: string;
  contentHtml: string;
}

import { CHAKRA_TOPICS } from "./constants";

function cleanJsonString(str: string): any {
  const start = str.indexOf('{');
  const end = str.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  let json = str.slice(start, end + 1);

  try {
    return JSON.parse(json);
  } catch {
    let inString = false;
    let result = '';
    for (let i = 0; i < json.length; i++) {
      const c = json[i];
      if (c === '"' && (i === 0 || json[i - 1] !== '\\')) {
        inString = !inString;
        result += c;
      } else if (inString) {
        if (c === '\n') result += '\\n';
        else if (c === '\r') result += '\\r';
        else if (c === '\t') result += '\\t';
        else result += c;
      } else {
        result += c;
      }
    }
    return JSON.parse(result);
  }
}

export async function analyzeContent(
  rawText: string,
  sourceUrl: string,
  targetGenre?: string
): Promise<AnalyzedDraft> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_actual_key_here") {
    console.warn("GEMINI_API_KEY is missing. Using mock AI response for testing.");
    return {
      title: "[MOCK] AI Analyzed: The Future of Web Development",
      summary: "A mock summary generated because the Gemini API Key was missing. This demonstrates the automation flow.",
      genre: (targetGenre && CHAKRA_TOPICS.includes(targetGenre)) ? targetGenre : "Tech",
      contentHtml: "<h2>Mock Content</h2><p>This is a simulated AI response used for local testing when an API key is not provided.</p>"
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const targetCategoryInstruction = targetGenre && CHAKRA_TOPICS.includes(targetGenre)
    ? `The primary intended category for this article is "${targetGenre}". Set "genre" to "${targetGenre}" unless the text clearly belongs elsewhere.`
    : `Choose the best matching category from the allowed list.`;

  const prompt = `
    You are the lead editor and senior analyst for Chakramantra, an independent publication that publishes original, in-depth analysis on technology, science, and global affairs.
    You will receive raw reference material from an external article (${sourceUrl}). This material is for editorial research only.

    Rewrite it as an original Chakramantra article: fresh voice, clear structure, no mention of the original publisher or source.
    Do not say "according to" or "originally reported by" — write as if Chakramantra produced this piece.

    Crucially, make the article highly detailed, comprehensive, and readable. It should be at least 800-1200 words. 
    Expand on concepts, add deeper analytical insights, structure it with multiple <h3> subheadings, and use bullet points where helpful.

    ${targetCategoryInstruction}

    Return ONLY a strict JSON object with this schema. No markdown fences or text outside the JSON.

    {
      "title": "A compelling, SEO-friendly headline in Chakramantra's voice",
      "summary": "A 2-3 sentence hook that draws readers in",
      "genre": "One word category MUST BE EXACTLY ONE OF: AI, Automation, Tech, Neuroscience, IT, Gaming, Cybersec, Networking, Startups, Space, Robotics, Quantum, BioTech, Design, Data, Ethics, Privacy, Science, Future, Web3, Cloud, SaaS, Mobile, Hardware",
      "contentHtml": "The full article as semantic HTML (<h2>, <h3>, <p>, <ul>, <li>). Original prose, well-structured, retaining core insights and significantly expanded depth."
    }

    Reference material:
    ${rawText}
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = cleanJsonString(responseText) as AnalyzedDraft;

    // Validate canonical genre
    if (!CHAKRA_TOPICS.includes(parsed.genre)) {
      parsed.genre = (targetGenre && CHAKRA_TOPICS.includes(targetGenre)) ? targetGenre : "Tech";
    }

    return parsed;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw new Error("Failed to analyze content using AI.");
  }
}
