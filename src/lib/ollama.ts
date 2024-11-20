const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL;

export const DEFAULT_AI_PROMPT = `You are an AI content analyzer. Analyze the following article and respond with 'true' if it's about artificial intelligence, machine learning, or related technologies, and 'false' otherwise. Only respond with true or false.`;

export const generateLinkedInPrompt = (params: {
  tone: string;
  audience: string;
  industry: string;
  keyMessage: string;
  includeHashtags: boolean;
  includeCallToAction: boolean;
}) => {
  return `You are a professional social media expert. Create an engaging LinkedIn post about the following article.

Guidelines:
- Tone: ${params.tone}
- Target Audience: ${params.audience}
- Industry Focus: ${params.industry}
- Key Message to Emphasize: ${params.keyMessage}
${params.includeHashtags ? '- Include 3-5 relevant hashtags' : '- Do not include hashtags'}
${params.includeCallToAction ? '- Include a clear call-to-action' : '- No call-to-action needed'}

Additional Requirements:
- Keep it under 3000 characters
- Use professional language
- Format with appropriate line breaks
- Focus on value and insights
- Encourage engagement and discussion
${params.tone === 'storytelling' ? '- Start with a compelling hook or personal anecdote' : ''}
${params.tone === 'technical' ? '- Include specific technical details and data points' : ''}

Please write a LinkedIn post about this article:`;
};

export async function analyzeArticleContent(title: string, content: string, settings: {
  model: string;
  temperature: number;
  maxTokens: number;
  prompt: string;
}): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.model,
        prompt: `${settings.prompt}

Title: ${title}

Content: ${content}`,
        stream: false,
        options: {
          temperature: settings.temperature,
          num_predict: settings.maxTokens,
        },
      }),
    });

    const data = await response.json();
    const result = data.response.toLowerCase().trim();
    return result === 'true';
  } catch (error) {
    console.error('Error analyzing article content:', error);
    return false;
  }
}

export async function generateLinkedInPost(
  title: string,
  content: string,
  settings: {
    model: string;
    temperature: number;
    maxTokens: number;
  },
  postParams: {
    tone: string;
    audience: string;
    industry: string;
    keyMessage: string;
    includeHashtags: boolean;
    includeCallToAction: boolean;
  }
): Promise<string> {
  try {
    const prompt = generateLinkedInPrompt(postParams);
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.model,
        prompt: `${prompt}

Title: ${title}

Content: ${content}`,
        stream: false,
        options: {
          temperature: settings.temperature,
          num_predict: settings.maxTokens,
        },
      }),
    });

    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    console.error('Error generating LinkedIn post:', error);
    throw new Error('Failed to generate LinkedIn post');
  }
}

export async function chatWithAI(
  message: string,
  context: string,
  settings: {
    model: string;
    temperature: number;
    maxTokens: number;
  }
): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.model,
        prompt: `You are a professional LinkedIn content expert. Help the user optimize and refine their LinkedIn post.
Current post content:
${context}

User message:
${message}

Please provide specific, actionable advice to improve the post while maintaining its core message and professional tone.`,
        stream: false,
        options: {
          temperature: settings.temperature,
          num_predict: settings.maxTokens,
        },
      }),
    });

    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    console.error('Error chatting with AI:', error);
    throw new Error('Failed to get AI response');
  }
}