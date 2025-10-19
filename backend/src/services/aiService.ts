import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';

export interface AIRequest {
    prompt: string;
    type: 'code' | 'documentation' | 'test' | 'review';
    language?: string;
    context?: string;
    maxTokens?: number;
}

export interface AIResponse {
    content: string;
    tokensUsed: number;
    model: string;
    cost: number;
}

class AIService {
    private openai: OpenAI;
    private anthropic: Anthropic;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }

    async generateWithOpenAI(request: AIRequest): Promise<AIResponse> {
        try {
            const systemPrompt = this.getSystemPrompt(request.type);
            const userPrompt = this.formatUserPrompt(request);

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: request.maxTokens || 2000,
                temperature: 0.1,
            });

            const content = response.choices[0]?.message?.content || '';
            const tokensUsed = response.usage?.total_tokens || 0;

            return {
                content,
                tokensUsed,
                model: 'gpt-4-turbo-preview',
                cost: this.calculateOpenAICost(tokensUsed, 'gpt-4-turbo-preview')
            };
        } catch (error) {
            logger.error('OpenAI API error:', error);
            throw new Error('Failed to generate content with OpenAI');
        }
    }

    async generateWithAnthropic(request: AIRequest): Promise<AIResponse> {
        try {
            const systemPrompt = this.getSystemPrompt(request.type);
            const userPrompt = this.formatUserPrompt(request);

            const response = await this.anthropic.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: request.maxTokens || 2000,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: userPrompt }
                ],
            });

            const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
            const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

            return {
                content,
                tokensUsed,
                model: 'claude-3-sonnet-20240229',
                cost: this.calculateAnthropicCost(response.usage.input_tokens, response.usage.output_tokens)
            };
        } catch (error) {
            logger.error('Anthropic API error:', error);
            throw new Error('Failed to generate content with Anthropic');
        }
    }

    private getSystemPrompt(type: string): string {
        const prompts = {
            code: 'You are an expert software developer. Generate clean, efficient, and well-documented code based on the user requirements.',
            documentation: 'You are a technical writer. Create comprehensive, clear documentation that helps developers understand and use the code.',
            test: 'You are a testing expert. Generate thorough unit tests that cover edge cases and follow best practices.',
            review: 'You are a senior code reviewer. Provide constructive feedback on code quality, security, performance, and best practices.'
        };

        return prompts[type as keyof typeof prompts] || prompts.code;
    }

    private formatUserPrompt(request: AIRequest): string {
        let prompt = request.prompt;

        if (request.language) {
            prompt += `\n\nLanguage: ${request.language}`;
        }

        if (request.context) {
            prompt += `\n\nContext: ${request.context}`;
        }

        return prompt;
    }

    private calculateOpenAICost(tokens: number, model: string): number {
        // Pricing per 1K tokens (in cents)
        const pricing = {
            'gpt-4-turbo-preview': 3.0, // $0.03 per 1K tokens
            'gpt-3.5-turbo': 0.2, // $0.002 per 1K tokens
        };

        const rate = pricing[model as keyof typeof pricing] || 3.0;
        return (tokens / 1000) * rate;
    }

    private calculateAnthropicCost(inputTokens: number, outputTokens: number): number {
        // Claude 3 Sonnet pricing (in cents per 1K tokens)
        const inputRate = 0.3; // $0.003 per 1K input tokens
        const outputRate = 1.5; // $0.015 per 1K output tokens

        return (inputTokens / 1000) * inputRate + (outputTokens / 1000) * outputRate;
    }
}

export const aiService = new AIService();