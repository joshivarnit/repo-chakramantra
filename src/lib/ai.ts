import { GoogleGenerativeAI } from "@google/generative-ai";

// We create an abstraction so we can easily swap to Ollama later
export interface AnalyzedDraft {
  title: string;
  summary: string;
  genre: string;
  contentHtml: string;
}

export async function analyzeContent(rawText: string, sourceUrl: string): Promise<AnalyzedDraft> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "your_actual_key_here") {
    console.warn("GEMINI_API_KEY is missing. Using mock AI response for testing.");
    return {
      title: "[MOCK] AI Analyzed: The Future of Web Development",
      summary: "A mock summary generated because the Gemini API Key was missing. This demonstrates the automation flow.",
      genre: "Development",
      contentHtml: "<h2>Mock Content</h2><p>This is a simulated AI response used for local testing when an API key is not provided.</p>"
    };
  }

  // Initialize Gemini
  // NOTE: In the future, this block can be swapped out to hit a local Ollama endpoint
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an expert editor for a premium, SEO-optimized blog directory.
    I am going to provide you with the raw text of an article sourced from the web (${sourceUrl}).

    Your task is to analyze this content and generate a highly engaging, SEO-friendly draft for our directory.
    You must return ONLY a strict JSON object with the following schema, and absolutely NO markdown formatting or code blocks outside the JSON.

    {
      "title": "A catchy, SEO-friendly title",
      "summary": "A 2-3 sentence engaging summary/hook",
      "genre": "One word category (e.g., Technology, Design, Science, Business)",
      "contentHtml": "The main content formatted as semantic HTML. Include headings (<h2>, <h3>), paragraphs (<p>), and lists if necessary. Ensure the content is well-structured and retains the core insights of the original article."
    }

    Raw Content to Analyze:
    ${rawText}
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Strip markdown code block formatting if Gemini included it
    const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleanJson) as AnalyzedDraft;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw new Error("Failed to analyze content using AI.");
  }
}
