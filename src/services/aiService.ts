import axios from 'axios';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIAPIResponse {
  choices: Array<{
    message?: { content: string };
    text?: string;
  }>;
}

export async function callAIAPI(messages: AIMessage[]): Promise<string> {
  try {
    const apiKey = process.env.AI_API_KEY || '';
    const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
    const model = process.env.AI_MODEL || 'gpt-3.5-turbo';

    const response = await axios.post(
      apiUrl,
      {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Handle different AI API response formats
    const data = response.data as AIAPIResponse;
    if (data.choices && data.choices[0]) {
      return data.choices[0].message?.content || data.choices[0].text || '';
    }

    throw new Error('Invalid AI API response format');
  } catch (error) {
    console.error('AI API Error:', error);
    throw new Error('Failed to get AI response');
  }
}

export async function getLegalChatResponse(userMessage: string, previousMessages: AIMessage[] = []): Promise<string> {
  const systemPrompt: AIMessage = {
    role: 'system',
    content: `You are a helpful legal assistant chatbot. Provide legal information and guidance based on user queries. 
    Always remind users that you are not a substitute for professional legal advice and they should consult with a lawyer for specific legal matters.
    Be concise, clear, and professional in your responses.`,
  };

  const messages: AIMessage[] = [
    systemPrompt,
    ...previousMessages,
    {
      role: 'user',
      content: userMessage,
    },
  ];

  return callAIAPI(messages);
}