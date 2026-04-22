"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callAIAPI = callAIAPI;
exports.getLegalChatResponse = getLegalChatResponse;
const axios_1 = __importDefault(require("axios"));
async function callAIAPI(messages) {
    try {
        const apiKey = process.env.AI_API_KEY || '';
        const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
        const model = process.env.AI_MODEL || 'gpt-3.5-turbo';
        const response = await axios_1.default.post(apiUrl, {
            model,
            messages,
            temperature: 0.7,
            max_tokens: 1000,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        // Handle different AI API response formats
        const data = response.data;
        if (data.choices && data.choices[0]) {
            return data.choices[0].message?.content || data.choices[0].text || '';
        }
        throw new Error('Invalid AI API response format');
    }
    catch (error) {
        console.error('AI API Error:', error);
        throw new Error('Failed to get AI response');
    }
}
async function getLegalChatResponse(userMessage, previousMessages = []) {
    const systemPrompt = {
        role: 'system',
        content: `You are a helpful legal assistant chatbot. Provide legal information and guidance based on user queries. 
    Always remind users that you are not a substitute for professional legal advice and they should consult with a lawyer for specific legal matters.
    Be concise, clear, and professional in your responses.`,
    };
    const messages = [
        systemPrompt,
        ...previousMessages,
        {
            role: 'user',
            content: userMessage,
        },
    ];
    return callAIAPI(messages);
}
//# sourceMappingURL=aiService.js.map