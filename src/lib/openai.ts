import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function analyzeArticleContent(title: string, content: string): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI content analyzer. Respond with 'true' if the article is about artificial intelligence, machine learning, or related technologies, and 'false' otherwise. Only respond with true or false."
        },
        {
          role: "user",
          content: `Title: ${title}\n\nContent: ${content}`
        }
      ],
      temperature: 0.1,
      max_tokens: 5
    });

    const result = response.choices[0]?.message?.content?.toLowerCase().trim();
    return result === 'true';
  } catch (error) {
    console.error('Error analyzing article content:', error);
    return false;
  }
}