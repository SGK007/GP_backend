export interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface AIAPIResponse {
    choices: Array<{
        message?: {
            content: string;
        };
        text?: string;
    }>;
}
export declare function callAIAPI(messages: AIMessage[]): Promise<string>;
export declare function getLegalChatResponse(userMessage: string, previousMessages?: AIMessage[]): Promise<string>;
//# sourceMappingURL=aiService.d.ts.map